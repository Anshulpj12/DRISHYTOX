// ═══ Location Watchdog — Smart Auto-SOS Safety System ═══
// Monitors driver GPS state and movement. Triggers automated SOS
// when driver appears unconscious/unresponsive.
//
// Case 1: GPS OFF for 5 min → warn → auto-SOS if no response
// Case 2: STATIONARY for 5 min (GPS ON) → warn → auto-SOS if no response
//
// Dependencies: GPSTracker (data.js), BlockCodeEncoder, SOSProviderEngine

const LocationWatchdog = {
  // ── State ──
  _state: 'IDLE',        // IDLE | DRIVING | STAT_WARN | GPS_WARN | PARKED | SOS_SENT
  _checkInterval: null,
  _warningTimer: null,
  _warningCountdown: 60,  // seconds remaining in warning
  _countdownInterval: null,

  // ── Position Tracking ──
  _lastMovementPos: null,
  _lastMovementTime: Date.now(),
  _lastGPSTime: Date.now(),
  _isGPSActive: true,
  _positions: [],          // Recent positions for movement detection

  // ── Config (ms) ──
  STATIC_THRESHOLD_MS:  5 * 60 * 1000,  // 5 minutes stationary
  GPS_OFF_THRESHOLD_MS: 5 * 60 * 1000,  // 5 minutes GPS off
  WARNING_DURATION_S:   60,              // 60-second warning countdown
  MOVEMENT_THRESHOLD_M: 50,             // >50m = driver moved
  CHECK_INTERVAL_MS:    10 * 1000,      // Check every 10 seconds

  // ── UI Callbacks (set by driver.html) ──
  _onShowWarning: null,   // fn(type, message, countdown)
  _onHideWarning: null,   // fn()
  _onUpdateCountdown: null, // fn(seconds)
  _onShowParked: null,    // fn()
  _onHideParked: null,    // fn()
  _onTriggerSOS: null,    // fn(blockCode, smsUri)

  // ═══ PUBLIC API ═══

  /**
   * Start the watchdog. Call after driver login.
   */
  start() {
    if (this._checkInterval) return; // Already running
    this._state = 'DRIVING';
    this._lastMovementTime = Date.now();
    this._lastGPSTime = Date.now();
    this._isGPSActive = true;
    this._positions = [];

    // Subscribe to GPS updates
    if (typeof GPSTracker !== 'undefined') {
      GPSTracker.onChange((pos) => this._onGPSUpdate(pos));
    }

    // Start periodic state check
    this._checkInterval = setInterval(() => this._checkState(), this.CHECK_INTERVAL_MS);
    console.log('[Watchdog] Started — monitoring driver safety');
  },

  /**
   * Stop the watchdog completely.
   */
  stop() {
    if (this._checkInterval) { clearInterval(this._checkInterval); this._checkInterval = null; }
    if (this._countdownInterval) { clearInterval(this._countdownInterval); this._countdownInterval = null; }
    if (this._warningTimer) { clearTimeout(this._warningTimer); this._warningTimer = null; }
    this._state = 'IDLE';
    console.log('[Watchdog] Stopped');
  },

  /**
   * User pressed STAY (Case 2: stationary warning).
   * Enters PARKED state — watchdog pauses until START is pressed.
   */
  pressStay() {
    console.log('[Watchdog] STAY pressed — entering PARKED mode');
    this._cancelWarning();
    this._state = 'PARKED';
    if (this._onHideWarning) this._onHideWarning();
    if (this._onShowParked) this._onShowParked();
  },

  /**
   * User pressed START DRIVING (from PARKED state).
   * Resumes DRIVING state and resets all timers.
   */
  pressStart() {
    console.log('[Watchdog] START pressed — resuming DRIVING mode');
    this._state = 'DRIVING';
    this._lastMovementTime = Date.now();
    this._lastGPSTime = Date.now();
    this._positions = [];
    if (this._onHideParked) this._onHideParked();
  },

  /**
   * User pressed I'M OK (Case 1: GPS off warning).
   * Resets the GPS off timer.
   */
  pressOK() {
    console.log('[Watchdog] OK pressed — resetting GPS timer');
    this._cancelWarning();
    this._lastGPSTime = Date.now();
    this._state = 'DRIVING';
    if (this._onHideWarning) this._onHideWarning();
  },

  /**
   * User pressed NO — SEND SOS (immediate SOS).
   */
  pressNO() {
    console.log('[Watchdog] NO pressed — immediate SOS');
    this._cancelWarning();
    if (this._onHideWarning) this._onHideWarning();
    this._triggerAutoSOS(this._state === 'GPS_WARN' ? 'GOFF' : 'STAT');
  },

  /**
   * Get current watchdog state.
   */
  getState() { return this._state; },

  /**
   * Register UI callbacks.
   */
  setCallbacks({ onShowWarning, onHideWarning, onUpdateCountdown, onShowParked, onHideParked, onTriggerSOS }) {
    if (onShowWarning) this._onShowWarning = onShowWarning;
    if (onHideWarning) this._onHideWarning = onHideWarning;
    if (onUpdateCountdown) this._onUpdateCountdown = onUpdateCountdown;
    if (onShowParked) this._onShowParked = onShowParked;
    if (onHideParked) this._onHideParked = onHideParked;
    if (onTriggerSOS) this._onTriggerSOS = onTriggerSOS;
  },


  // ═══ INTERNAL ═══

  /**
   * Called on every GPS position update from GPSTracker.
   */
  _onGPSUpdate(pos) {
    if (!pos) return;
    this._lastGPSTime = Date.now();
    this._isGPSActive = true;

    // Track positions for movement detection
    this._positions.push({ lat: pos.lat, lng: pos.lng, time: Date.now() });
    if (this._positions.length > 60) this._positions.shift(); // Keep last 10 minutes at 10s interval

    // Check if driver has moved significantly
    if (this._lastMovementPos) {
      const dist = this._haversine(
        this._lastMovementPos.lat, this._lastMovementPos.lng,
        pos.lat, pos.lng
      );
      if (dist > this.MOVEMENT_THRESHOLD_M) {
        this._lastMovementPos = { lat: pos.lat, lng: pos.lng };
        this._lastMovementTime = Date.now();
      }
    } else {
      this._lastMovementPos = { lat: pos.lat, lng: pos.lng };
      this._lastMovementTime = Date.now();
    }
  },

  /**
   * Periodic state check — runs every 10 seconds.
   */
  _checkState() {
    const now = Date.now();

    // Don't check in PARKED, SOS_SENT, or IDLE states
    if (this._state === 'PARKED' || this._state === 'SOS_SENT' || this._state === 'IDLE') return;

    // Don't re-check if already showing a warning
    if (this._state === 'STAT_WARN' || this._state === 'GPS_WARN') return;

    // ── CASE 1: GPS OFF Detection ──
    const gpsOffDuration = now - this._lastGPSTime;
    if (gpsOffDuration >= this.GPS_OFF_THRESHOLD_MS) {
      console.log(`[Watchdog] GPS off for ${Math.round(gpsOffDuration / 1000)}s — showing warning`);
      this._state = 'GPS_WARN';
      this._showWarning(
        'GPS_OFF',
        '⚠️ Your GPS has been off for 5 minutes. Are you safe?',
        'GOFF'
      );
      return;
    }

    // ── CASE 2: Stationary Detection (only when GPS is active) ──
    if (this._isGPSActive) {
      const staticDuration = now - this._lastMovementTime;
      if (staticDuration >= this.STATIC_THRESHOLD_MS) {
        console.log(`[Watchdog] Stationary for ${Math.round(staticDuration / 1000)}s — showing warning`);
        this._state = 'STAT_WARN';
        this._showWarning(
          'STATIONARY',
          '🚗 You haven\'t moved for 5 minutes. Are you parked?',
          'STAT'
        );
        return;
      }
    }
  },

  /**
   * Show warning modal with countdown timer.
   */
  _showWarning(type, message, reasonCode) {
    this._warningCountdown = this.WARNING_DURATION_S;

    // Notify UI to show modal
    if (this._onShowWarning) {
      this._onShowWarning(type, message, this._warningCountdown);
    }

    // Start countdown
    this._countdownInterval = setInterval(() => {
      this._warningCountdown--;
      if (this._onUpdateCountdown) this._onUpdateCountdown(this._warningCountdown);

      if (this._warningCountdown <= 0) {
        // Timer expired — auto-trigger SOS
        this._cancelWarning();
        if (this._onHideWarning) this._onHideWarning();
        this._triggerAutoSOS(reasonCode);
      }
    }, 1000);
  },

  /**
   * Cancel active warning and timers.
   */
  _cancelWarning() {
    if (this._countdownInterval) { clearInterval(this._countdownInterval); this._countdownInterval = null; }
    if (this._warningTimer) { clearTimeout(this._warningTimer); this._warningTimer = null; }
    this._warningCountdown = this.WARNING_DURATION_S;
  },

  /**
   * Trigger automatic SOS — builds block code and opens SMS.
   * @param {string} reason - Reason code (GOFF, STAT, NRSP, etc.)
   */
  _triggerAutoSOS(reason) {
    this._state = 'SOS_SENT';
    console.log(`[Watchdog] 🆘 AUTO-SOS TRIGGERED — reason: ${reason}`);

    // ── Get position (last known or estimated) ──
    let lat = 0, lng = 0;
    if (typeof GPSTracker !== 'undefined') {
      const pos = GPSTracker.lastPosition || GPSTracker.getEstimatedPosition();
      if (pos) { lat = pos.lat; lng = pos.lng; }
    }

    // ── Build block code with reason ──
    let blockCode = 'XX-000-SOS-' + reason;
    if (typeof BlockCodeEncoder !== 'undefined' && lat !== 0) {
      if (BlockCodeEncoder.encodeWithReason) {
        blockCode = BlockCodeEncoder.encodeWithReason(lat, lng, 'SOS', reason);
      } else {
        blockCode = BlockCodeEncoder.encode(lat, lng, 'SOS') + '-' + reason;
      }
    }

    // ── Get nearest provider phone numbers ──
    const providers = this._getNearestProviderPhones(lat, lng);

    // ── Build SMS message ──
    const time = new Date().toLocaleTimeString('en-IN', { hour12: false });
    const smsBody = `🆘 APARA AUTO-SOS\nCode: ${blockCode}\nTime: ${time}\nLocation: ${lat.toFixed(4)},${lng.toFixed(4)}\nReason: ${this._getReasonLabel(reason)}\nMap: https://maps.google.com/?q=${lat.toFixed(6)},${lng.toFixed(6)}`;

    // ── Open SMS app for each provider ──
    const phoneNumber = providers.length > 0 ? providers[0] : '112';
    const smsUri = `sms:${phoneNumber}?body=${encodeURIComponent(smsBody)}`;

    // ── Queue for Firebase sync ──
    if (typeof SOSMessageQueue !== 'undefined') {
      SOSMessageQueue.enqueue({
        type: 'sos_alert',
        payload: {
          blockCode, lat, lng, reason,
          timestamp: Date.now(),
          providers: providers,
          autoTriggered: true,
        }
      });
    }

    // ── Save SOS event locally ──
    if (typeof Store !== 'undefined') {
      Store.saveSOSEvent({
        id: 'SOS-' + Date.now(),
        blockCode, lat, lng,
        typeCode: 'SOS',
        reason,
        timestamp: new Date().toISOString(),
        autoTriggered: true,
        providers: providers,
        resolved: false,
      });
    }

    // ── Notify UI ──
    if (this._onTriggerSOS) {
      this._onTriggerSOS(blockCode, smsUri, smsBody, providers);
    }

    // ── Open SMS app ──
    console.log(`[Watchdog] Opening SMS to ${phoneNumber}: ${blockCode}`);
    try {
      window.location.href = smsUri;
    } catch (e) {
      console.warn('[Watchdog] Could not open SMS app:', e);
    }

    // Auto-reset after 2 minutes (allow re-triggering if still in danger)
    setTimeout(() => {
      if (this._state === 'SOS_SENT') {
        this._state = 'DRIVING';
        this._lastMovementTime = Date.now();
        this._lastGPSTime = Date.now();
        console.log('[Watchdog] Auto-reset after SOS — resuming monitoring');
      }
    }, 2 * 60 * 1000);
  },

  /**
   * Get nearest provider phone numbers from local storage.
   */
  _getNearestProviderPhones(lat, lng) {
    const phones = [];
    if (typeof SOSProviderEngine !== 'undefined' && lat && lng) {
      const providers = SOSProviderEngine.getNearestProviders(lat, lng, 100);
      providers.forEach(p => {
        if (p.phone && phones.length < 3) phones.push(p.phone);
      });
    }
    // Fallback: check Store directly
    if (phones.length === 0 && typeof Store !== 'undefined') {
      const allProviders = Store.getProviders();
      allProviders.forEach(p => {
        if (p.phone && p.status === 'Active' && phones.length < 3) {
          phones.push(p.phone);
        }
      });
    }
    return phones;
  },

  /**
   * Get human-readable reason label.
   */
  _getReasonLabel(code) {
    const labels = {
      'GOFF': 'GPS turned off — driver may be in danger',
      'STAT': 'Stationary too long — driver unresponsive',
      'NRSP': 'No response to safety check',
      'MANU': 'Manual SOS activation',
      'AUTO': 'Auto-triggered safety alert',
      'FALL': 'Possible fall or impact detected',
    };
    return labels[code] || 'Emergency alert';
  },

  /**
   * Haversine distance in meters.
   */
  _haversine(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  },
};
