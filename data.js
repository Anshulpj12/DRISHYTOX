// ═══════════ APARA Shared Data Store (localStorage-based) ═══════════
// All data is stored in localStorage and shared across all windows.
// No mock/fake data — everything is entered by admin, providers, and users.

const STORE_KEYS = {
  PROVIDERS: 'apara_providers',
  SOS_EVENTS: 'apara_sos_events',
  CORRIDORS: 'apara_corridors',
  CROSSINGS: 'apara_crossings',
  V2V_RELAYS: 'apara_v2v_relays',
  LOGGED_PROVIDER: 'apara_logged_provider',
  SETTINGS: 'apara_settings',
  ZONE_HISTORY: 'apara_zone_history',
  BLOCK_REGISTRY: 'apara_block_registry',
  BLOCK_TRANSIT_LOG: 'apara_block_transit_log',
  DRIVERS: 'apara_drivers',
  DRIVER_BUFFER: 'apara_driver_buffer',
  ZONE_INDEX: 'apara_zone_index',
  ZONE_PREFIX: 'apara_zone_',
  BATCH_BUFFER: 'apara_batch_buffer',
  BATCH_META: 'apara_batch_meta',
  CONFIG_VERSION: 'apara_config_version',
  // ═══ MARKETPLACE KEYS ═══
  SHOPS: 'apara_shops',
  MENU_PREFIX: 'apara_menu_',
  ORDERS: 'apara_orders',
  ACTIVE_ORDER: 'apara_active_order',
  LOGGED_SHOP: 'apara_logged_shop',
  ORDER_BATCH_BUFFER: 'apara_order_batch',
};

const EMERGENCY_TYPES = [
  { code: 'ACC', label: 'Accident', icon: '🚨', color: '#F87171', badge: 'badge-accident' },
  { code: 'MED', label: 'Medical Emergency', icon: '🏥', color: '#60A5FA', badge: 'badge-medical' },
  { code: 'TYR', label: 'Tyre Puncture', icon: '🔴', color: '#FB923C', badge: 'badge-tyre' },
  { code: 'FUL', label: 'Out of Fuel', icon: '⛽', color: '#FACC15', badge: 'badge-fuel' },
  { code: 'TOW', label: 'Tow Required', icon: '🚗', color: '#94A3B8', badge: 'badge-tow' },
];

const PROVIDER_CATEGORIES = [
  { code: 'HOSP', label: 'Hospital', icon: '🏥' },
  { code: 'MECH', label: 'Mechanic', icon: '🔧' },
  { code: 'FUEL', label: 'Fuel Station', icon: '⛽' },
  { code: 'TOW', label: 'Tow Operator', icon: '🚗' },
  { code: 'PHAR', label: 'Pharmacy', icon: '💊' },
  { code: 'PUNC', label: 'Puncture Shop', icon: '🔴' },
];

const TRANSMISSION_METHODS = [
  { code: 'SMS', badge: 'badge-sms' },
  { code: 'USSD', badge: 'badge-ussd' },
  { code: 'LoRa', badge: 'badge-lora' },
  { code: 'V2V Relay', badge: 'badge-v2v' },
  { code: 'Data', badge: 'badge-data' },
];

// ═══ Default Corridors (Indian Highway Dead Zones — reference data) ═══
const DEFAULT_CORRIDORS = [
  { id: 'NH44-BAN', name: 'NH44 Banihal Pass', code: 'NH44', blocks: 42, length: 84000, region: 'J&K' },
  { id: 'NH44-CNT', name: 'Chenani-Nashri Tunnel', code: 'NH44', blocks: 18, length: 9200, region: 'J&K' },
  { id: 'NH48-GHT', name: 'NH48 Western Ghats', code: 'NH48', blocks: 35, length: 70000, region: 'Maharashtra' },
  { id: 'NH66-KNR', name: 'NH66 Kannur Stretch', code: 'NH66', blocks: 28, length: 56000, region: 'Kerala' },
  { id: 'NH7-CDM', name: 'Char Dham Route', code: 'NH7', blocks: 55, length: 110000, region: 'Uttarakhand' },
  { id: 'NH39-NE', name: 'NH39 Northeast Corridor', code: 'NH39', blocks: 38, length: 76000, region: 'Nagaland' },
];

// ═══ localStorage CRUD helpers ═══
const Store = {
  get(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; }
    catch { return []; }
  },
  set(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },
  getObj(key) {
    try { return JSON.parse(localStorage.getItem(key)) || {}; }
    catch { return {}; }
  },
  setObj(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },

  // Providers
  getProviders() { return this.get(STORE_KEYS.PROVIDERS); },
  saveProvider(provider) {
    const list = this.getProviders();
    list.push(provider);
    this.set(STORE_KEYS.PROVIDERS, list);
  },
  updateProvider(id, updates) {
    const list = this.getProviders();
    const idx = list.findIndex(p => p.id === id);
    if (idx >= 0) { Object.assign(list[idx], updates); this.set(STORE_KEYS.PROVIDERS, list); }
  },
  deleteProvider(id) {
    const list = this.getProviders().filter(p => p.id !== id);
    this.set(STORE_KEYS.PROVIDERS, list);
  },
  findProvider(id, password) {
    return this.getProviders().find(p => p.id === id && p.password === password);
  },

  // SOS Events
  getSOSEvents() { return this.get(STORE_KEYS.SOS_EVENTS); },
  saveSOSEvent(event) {
    const list = this.getSOSEvents();
    list.unshift(event);
    this.set(STORE_KEYS.SOS_EVENTS, list);
  },
  updateSOSEvent(id, updates) {
    const list = this.getSOSEvents();
    const idx = list.findIndex(e => e.id === id);
    if (idx >= 0) { Object.assign(list[idx], updates); this.set(STORE_KEYS.SOS_EVENTS, list); }
  },

  // Corridors
  getCorridors() {
    const stored = this.get(STORE_KEYS.CORRIDORS);
    return stored.length > 0 ? stored : DEFAULT_CORRIDORS;
  },
  saveCorridors(corridors) { this.set(STORE_KEYS.CORRIDORS, corridors); },

  // Crossings
  getCrossings() { return this.get(STORE_KEYS.CROSSINGS); },
  saveCrossing(crossing) {
    const list = this.getCrossings();
    list.unshift(crossing);
    this.set(STORE_KEYS.CROSSINGS, list);
  },

  // Dead Zone History
  getZoneHistory() { return this.getObj(STORE_KEYS.ZONE_HISTORY); },
  saveZoneHistory(data) { this.setObj(STORE_KEYS.ZONE_HISTORY, data); },

  // V2V
  getV2VRelays() { return this.get(STORE_KEYS.V2V_RELAYS); },
  saveV2VRelay(relay) {
    const list = this.getV2VRelays();
    list.unshift(relay);
    this.set(STORE_KEYS.V2V_RELAYS, list);
  },

  // Settings
  getSettings() {
    return this.getObj(STORE_KEYS.SETTINGS) || {
      v2vRelay: true,
      sosMode: 'hold',
      alertSound: true,
    };
  },
  saveSettings(settings) { this.setObj(STORE_KEYS.SETTINGS, settings); },

  // Stats
  getStats() {
    const providers = this.getProviders();
    const events = this.getSOSEvents();
    const now = new Date();
    const today = now.toDateString();
    const weekAgo = new Date(now - 7 * 86400000);
    const monthAgo = new Date(now - 30 * 86400000);
    return {
      totalProviders: providers.length,
      activeProviders: providers.filter(p => p.status === 'Active').length,
      totalSOS: {
        today: events.filter(e => new Date(e.timestamp).toDateString() === today).length,
        week: events.filter(e => new Date(e.timestamp) >= weekAgo).length,
        month: events.filter(e => new Date(e.timestamp) >= monthAgo).length,
      },
      avgResponseMin: events.filter(e => e.resolutionMin).length > 0
        ? Math.round(events.filter(e => e.resolutionMin).reduce((s, e) => s + e.resolutionMin, 0) / events.filter(e => e.resolutionMin).length)
        : 0,
      totalCrossings: this.getCrossings().length,
      corridorsCovered: this.getCorridors().length,
    };
  },
};

// ═══ Network Detection Utility ═══
const NetworkDetector = {
  _online: navigator.onLine,
  _listeners: [],

  init() {
    window.addEventListener('online', () => { this._online = true; this._notify(); });
    window.addEventListener('offline', () => { this._online = false; this._notify(); });
    // Also check connection quality if available
    if (navigator.connection) {
      navigator.connection.addEventListener('change', () => this._notify());
    }
  },

  isOnline() {
    return this._online;
  },

  getConnectionInfo() {
    if (navigator.connection) {
      return {
        type: navigator.connection.effectiveType || 'unknown',
        downlink: navigator.connection.downlink || 0,
        rtt: navigator.connection.rtt || 0,
      };
    }
    return { type: this._online ? '4g' : 'none', downlink: 0, rtt: 0 };
  },

  isWeakConnection() {
    const info = this.getConnectionInfo();
    return !this._online || info.type === 'slow-2g' || info.type === '2g' || info.downlink < 0.5;
  },

  onChange(fn) { this._listeners.push(fn); },
  _notify() { this._listeners.forEach(fn => fn(this._online, this.getConnectionInfo())); },
};

// ═══ GPS Utility ═══
const GPSTracker = {
  watchId: null,
  lastPosition: null,
  lastOnlinePosition: null,
  positionHistory: [],
  _listeners: [],
  _smoothingWindow: 2,
  _refreshInterval: null,

  // ═══ SPEED FROM POSITION CHANGES (not coords.speed) ═══
  _calculatedSpeedMs: 0,       // Reliable speed in m/s from position delta
  _driverSpeedHistory: [],     // Recent speed samples for driver average
  _driverAvgSpeedKmh: 0,      // Rolling average

  start() {
    if (!navigator.geolocation) { console.warn('Geolocation not available'); return; }

    // Load saved driver average
    const savedAvg = localStorage.getItem('apara_driver_avg_speed');
    if (savedAvg) this._driverAvgSpeedKmh = parseFloat(savedAvg) || 0;

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => { this._processRawPosition(pos); },
      (err) => { console.warn('GPS error:', err.message); },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    );

    // Backup: force a fresh GPS read every 5 seconds if watchPosition is slow
    this._refreshInterval = setInterval(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => { this._processRawPosition(pos); },
          () => {},
          { enableHighAccuracy: true, maximumAge: 3000, timeout: 5000 }
        );
      }
    }, 5000);
  },

  _processRawPosition(pos) {
    const raw = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      speed: null,  // We calculate our own
      heading: pos.coords.heading,
      timestamp: pos.timestamp || Date.now(),
    };

    // ═══ REJECT LOW ACCURACY READINGS (> 50m) — keep last known good ═══
    if (raw.accuracy && raw.accuracy > 50 && this.lastPosition) {
      return; // Skip this noisy reading
    }

    // ═══ CALCULATE SPEED FROM POSITION DELTA ═══
    if (this.positionHistory.length >= 1) {
      const prev = this.positionHistory[this.positionHistory.length - 1];
      const dist = Utils.haversine(prev.lat, prev.lng, raw.lat, raw.lng);
      const dt = (raw.timestamp - prev.timestamp) / 1000; // seconds

      if (dt > 0.5 && dt < 30) { // Valid time window (0.5s to 30s)
        const speedMs = dist / dt;

        // ═══ JITTER FILTER: if moved < 3m in < 3s, speed is 0 (stationary) ═══
        if (dist < 3 && dt < 3) {
          this._calculatedSpeedMs = 0;
        }
        // ═══ SANITY: cap at 200 km/h (55.5 m/s) — anything above is GPS jump ═══
        else if (speedMs > 55.5) {
          this._calculatedSpeedMs = this._calculatedSpeedMs; // Keep previous
        }
        else {
          // Smooth: weighted blend of previous and new speed
          this._calculatedSpeedMs = this._calculatedSpeedMs * 0.3 + speedMs * 0.7;
        }

        // Track driver speed history (only when moving)
        if (this._calculatedSpeedMs > 0.5) {
          this._driverSpeedHistory.push(this._calculatedSpeedMs * 3.6); // km/h
          if (this._driverSpeedHistory.length > 100) this._driverSpeedHistory.shift();
          // Update rolling average
          this._driverAvgSpeedKmh = this._driverSpeedHistory.reduce((a,b) => a+b, 0) / this._driverSpeedHistory.length;
          // Save to localStorage periodically
          if (this._driverSpeedHistory.length % 10 === 0) {
            localStorage.setItem('apara_driver_avg_speed', this._driverAvgSpeedKmh.toFixed(1));
          }
        }
      }
    }

    // Set calculated speed on the raw position
    raw.speed = this._calculatedSpeedMs;

    this.positionHistory.push({ ...raw });
    if (this.positionHistory.length > 500) this.positionHistory.shift();

    // Smooth position if accuracy is poor
    this.lastPosition = this._getSmoothedPosition(raw);

    if (NetworkDetector.isOnline()) {
      this.lastOnlinePosition = { ...this.lastPosition };
    }
    this._notify();
  },

  stop() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    if (this._refreshInterval) {
      clearInterval(this._refreshInterval);
      this._refreshInterval = null;
    }
  },

  // Smooth position only when accuracy is poor
  _getSmoothedPosition(latest) {
    if (latest.accuracy && latest.accuracy < 15) return latest;
    const history = this.positionHistory;
    const n = Math.min(this._smoothingWindow, history.length);
    if (n <= 1) return latest;
    const recent = history.slice(-n);
    const avgLat = recent.reduce((s, p) => s + p.lat, 0) / n;
    const avgLng = recent.reduce((s, p) => s + p.lng, 0) / n;
    return {
      lat: avgLat, lng: avgLng,
      accuracy: latest.accuracy, speed: latest.speed,
      heading: latest.heading, timestamp: latest.timestamp,
    };
  },

  // ═══ SPEED: Always use position-calculated speed ═══
  getSpeedKmh() {
    return Math.round(this._calculatedSpeedMs * 3.6);
  },

  getDriverAvgSpeedKmh() {
    return Math.round(this._driverAvgSpeedKmh) || 40; // Fallback 40 km/h
  },

  getCommunityAvgSpeedKmh() {
    // Community average from DeadZoneHistory or default highway speed
    const communityData = DeadZoneHistory.getCommunityAvgSpeed();
    return communityData || 50; // Default 50 km/h for highways
  },

  // ═══ OFFLINE ESTIMATION using driver/community averages ═══
  getEstimatedPosition() {
    if (!this.lastOnlinePosition) return this.lastPosition;
    const elapsed = (Date.now() - this.lastOnlinePosition.timestamp) / 1000;

    // ═══ TRY HISTORY-DRIVEN ESTIMATION FIRST ═══
    const historyResult = DeadZoneHistory.estimateFromHistory(
      this.lastOnlinePosition, elapsed
    );
    if (historyResult) {
      return {
        lat: historyResult.lat, lng: historyResult.lng,
        accuracy: historyResult.accuracy,
        speed: this._calculatedSpeedMs,
        heading: this.lastOnlinePosition.heading,
        timestamp: Date.now(), estimated: true,
        estimationSource: historyResult.source,
        estimatedBlock: historyResult.block,
        estimatedCorridor: historyResult.corridorId,
        confidence: historyResult.confidence,
      };
    }

    // ═══ DEAD RECKONING WITH DRIVER/COMMUNITY AVERAGES ═══
    // Blend: 60% driver average + 40% community average
    const driverAvg = this.getDriverAvgSpeedKmh() / 3.6; // m/s
    const communityAvg = this.getCommunityAvgSpeedKmh() / 3.6; // m/s
    const lastSpeed = this.lastOnlinePosition.speed || 0;

    // Use weighted average: recent speed > driver avg > community avg
    let estimatedSpeedMs;
    if (lastSpeed > 1) {
      // Blend last known speed with averages (decays over time)
      const decayFactor = Math.max(0, 1 - elapsed / 300); // Decay over 5 min
      estimatedSpeedMs = lastSpeed * decayFactor + (driverAvg * 0.6 + communityAvg * 0.4) * (1 - decayFactor);
    } else {
      estimatedSpeedMs = driverAvg * 0.6 + communityAvg * 0.4;
    }

    const heading = this.lastOnlinePosition.heading || 0;
    const dist = estimatedSpeedMs * elapsed;
    const headingRad = (heading * Math.PI) / 180;
    const R = 6371000;
    const lat1 = (this.lastOnlinePosition.lat * Math.PI) / 180;
    const lng1 = (this.lastOnlinePosition.lng * Math.PI) / 180;
    const lat2 = Math.asin(Math.sin(lat1) * Math.cos(dist / R) + Math.cos(lat1) * Math.sin(dist / R) * Math.cos(headingRad));
    const lng2 = lng1 + Math.atan2(Math.sin(headingRad) * Math.sin(dist / R) * Math.cos(lat1), Math.cos(dist / R) - Math.sin(lat1) * Math.sin(lat2));
    return {
      lat: (lat2 * 180) / Math.PI,
      lng: (lng2 * 180) / Math.PI,
      accuracy: this.lastOnlinePosition.accuracy + dist * 0.1,
      speed: estimatedSpeedMs,
      heading: heading,
      timestamp: Date.now(), estimated: true,
      estimationSource: 'dead_reckoning_avg',
      confidence: Math.max(35, 65 - Math.floor(elapsed / 60) * 5),
    };
  },

  _haversine(lat1, lon1, lat2, lon2) {
    return Utils.haversine(lat1, lon1, lat2, lon2);
  },

  onChange(fn) { this._listeners.push(fn); },
  _notify() { this._listeners.forEach(fn => fn(this.lastPosition)); },
};

// ═══ Block Code Resolver ═══
const BlockResolver = {
  resolve(lat, lng, estimatedPos) {
    const corridors = Store.getCorridors();
    let bestCorridor = corridors[0];
    let bestBlock = 1;
    let confidence = 70;

    // If we have history-driven estimation with a block, use it
    if (estimatedPos && estimatedPos.estimatedBlock && estimatedPos.estimatedCorridor) {
      bestCorridor = corridors.find(c => c.id === estimatedPos.estimatedCorridor) || corridors[0];
      bestBlock = estimatedPos.estimatedBlock;
      confidence = estimatedPos.confidence || 85;
      return {
        corridor: bestCorridor,
        block: bestBlock,
        blockCode: `${bestCorridor.code}-B${String(bestBlock).padStart(2, '0')}`,
        confidence,
        source: estimatedPos.estimationSource,
      };
    }

    // Simple mapping: use latitude to pick corridor region
    if (lat > 32) { bestCorridor = corridors.find(c => c.id === 'NH44-BAN') || corridors[0]; }
    else if (lat > 28) { bestCorridor = corridors.find(c => c.id === 'NH7-CDM') || corridors[0]; }
    else if (lat > 18) { bestCorridor = corridors.find(c => c.id === 'NH48-GHT') || corridors[0]; }
    else if (lat > 10) { bestCorridor = corridors.find(c => c.id === 'NH66-KNR') || corridors[0]; }
    else { bestCorridor = corridors[0]; }

    const blockLength = bestCorridor.length / bestCorridor.blocks;
    bestBlock = Math.max(1, Math.min(bestCorridor.blocks, Math.floor(((lng % 10) / 10) * bestCorridor.blocks) + 1));
    confidence = NetworkDetector.isOnline() ? 92 : (estimatedPos ? estimatedPos.confidence || 60 : 60);

    return {
      corridor: bestCorridor,
      block: bestBlock,
      blockCode: `${bestCorridor.code}-B${String(bestBlock).padStart(2, '0')}`,
      confidence,
      source: NetworkDetector.isOnline() ? 'gps' : (estimatedPos?.estimationSource || 'dead_reckoning'),
    };
  },
};

// ═══ Utilities ═══
const Utils = {
  haversine(lat1, lon1, lat2, lon2) {
    const R = 6371000; // meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
};

// ═══ SOS Packet Builder ═══
const SOSPacket = {
  build(blockCode, typeCode, confidence, lat, lng) {
    const now = new Date();
    const time = now.toLocaleTimeString('en-IN', { hour12: false });
    const packet = `${blockCode}|${typeCode}|${time}|conf:${confidence}`;
    return {
      id: `SOS-${Date.now()}`,
      packet,
      blockCode,
      typeCode,
      type: EMERGENCY_TYPES.find(t => t.code === typeCode),
      confidence,
      lat, lng,
      timestamp: now.toISOString(),
      timeStr: time,
      transmission: NetworkDetector.isOnline()
        ? TRANSMISSION_METHODS.find(t => t.code === 'Data')
        : TRANSMISSION_METHODS.find(t => t.code === 'SMS'),
      resolved: false,
      resolutionMin: null,
      providerId: null,
      providerName: null,
      dispatchedAt: null,
      resolutionPin: Math.floor(1000 + Math.random() * 9000).toString(),
    };
  },
};

// ═══ Dead Zone History — History-Driven Offline Positioning ═══
// Records traversal timing data for dead zone corridors.
// When offline, uses historical avg transit times to estimate which block you're in.
const DeadZoneHistory = {
  // Current traversal tracking (in-memory, saved on exit)
  _currentTraversal: null,

  // ─── Record when vehicle ENTERS a dead zone (goes offline) ───
  recordEntry(corridorId, entryBlock, speed, lat, lng) {
    this._currentTraversal = {
      corridorId,
      entryBlock,
      entrySpeed: speed, // m/s
      entryLat: lat,
      entryLng: lng,
      entryTime: Date.now(),
      blockTimestamps: [{ block: entryBlock, time: Date.now(), speed }],
    };
    console.log(`[DeadZone] Entry recorded: ${corridorId} Block ${entryBlock} @ ${Math.round(speed * 3.6)} km/h`);
  },

  // ─── Record when vehicle EXITS a dead zone (goes back online) ───
  recordExit(corridorId, exitBlock, lat, lng) {
    if (!this._currentTraversal || this._currentTraversal.corridorId !== corridorId) return;
    const traversal = this._currentTraversal;
    traversal.exitBlock = exitBlock;
    traversal.exitTime = Date.now();
    traversal.exitLat = lat;
    traversal.exitLng = lng;
    traversal.totalTimeMs = traversal.exitTime - traversal.entryTime;
    traversal.blocksTraversed = Math.abs(exitBlock - traversal.entryBlock);

    // Save to persistent history
    const history = Store.getZoneHistory();
    if (!history[corridorId]) history[corridorId] = { traversals: [], blockProfiles: {} };
    history[corridorId].traversals.push(traversal);
    // Keep last 20 traversals per corridor
    if (history[corridorId].traversals.length > 20) history[corridorId].traversals.shift();

    // Update per-block average transit times
    this._updateBlockProfiles(history, corridorId);
    Store.saveZoneHistory(history);
    this._currentTraversal = null;
    console.log(`[DeadZone] Exit recorded: ${corridorId} Block ${exitBlock}, total ${Math.round(traversal.totalTimeMs / 1000)}s`);
  },

  // ─── Record block-by-block transit while online (builds profile) ───
  recordBlockCrossing(corridorId, fromBlock, toBlock, transitTimeMs, speed) {
    const history = Store.getZoneHistory();
    if (!history[corridorId]) history[corridorId] = { traversals: [], blockProfiles: {} };
    const key = `${fromBlock}-${toBlock}`;
    if (!history[corridorId].blockProfiles[key]) {
      history[corridorId].blockProfiles[key] = { samples: [], avgTimeMs: 0, avgSpeedMps: 0 };
    }
    const profile = history[corridorId].blockProfiles[key];
    profile.samples.push({ timeMs: transitTimeMs, speed, timestamp: Date.now() });
    // Keep last 30 samples per block transition
    if (profile.samples.length > 30) profile.samples.shift();
    // Recalculate averages
    profile.avgTimeMs = Math.round(profile.samples.reduce((s, p) => s + p.timeMs, 0) / profile.samples.length);
    profile.avgSpeedMps = profile.samples.reduce((s, p) => s + p.speed, 0) / profile.samples.length;
    Store.saveZoneHistory(history);
  },

  // ─── Update block profiles from traversal data ───
  _updateBlockProfiles(history, corridorId) {
    const traversals = history[corridorId].traversals;
    if (traversals.length === 0) return;
    // Build avg time-per-block from total traversal data
    traversals.forEach(t => {
      if (t.blocksTraversed > 0 && t.totalTimeMs > 0) {
        const avgTimePerBlock = t.totalTimeMs / t.blocksTraversed;
        const direction = t.exitBlock > t.entryBlock ? 1 : -1;
        for (let i = 0; i < t.blocksTraversed; i++) {
          const from = t.entryBlock + i * direction;
          const to = from + direction;
          const key = `${from}-${to}`;
          if (!history[corridorId].blockProfiles[key]) {
            history[corridorId].blockProfiles[key] = { samples: [], avgTimeMs: 0, avgSpeedMps: 0 };
          }
          const profile = history[corridorId].blockProfiles[key];
          // Only add if we don't have per-block data already from online recording
          if (profile.samples.length === 0) {
            profile.avgTimeMs = Math.round(avgTimePerBlock);
            profile.avgSpeedMps = t.entrySpeed || 20;
          }
        }
      }
    });
  },

  // ─── CORE: Estimate position from history when offline ───
  estimateFromHistory(lastOnlinePos, elapsedSeconds) {
    if (!lastOnlinePos) return null;
    const corridors = Store.getCorridors();

    // Find which corridor the user was on
    let corridor = null;
    if (lastOnlinePos.lat > 32) corridor = corridors.find(c => c.id === 'NH44-BAN');
    else if (lastOnlinePos.lat > 28) corridor = corridors.find(c => c.id === 'NH7-CDM');
    else if (lastOnlinePos.lat > 18) corridor = corridors.find(c => c.id === 'NH48-GHT');
    else if (lastOnlinePos.lat > 10) corridor = corridors.find(c => c.id === 'NH66-KNR');
    if (!corridor) corridor = corridors[0];
    if (!corridor) return null;

    const history = Store.getZoneHistory();
    const corridorData = history[corridor.id];
    if (!corridorData || Object.keys(corridorData.blockProfiles).length === 0) return null;

    // Determine entry block
    const entryBlock = Math.max(1, Math.min(corridor.blocks,
      Math.floor(((lastOnlinePos.lng % 10) / 10) * corridor.blocks) + 1
    ));

    // Walk through blocks using historical transit times
    let remainingMs = elapsedSeconds * 1000;
    let currentBlock = entryBlock;
    let blocksAdvanced = 0;
    const direction = 1; // Assume forward direction
    let source = 'personal';
    let totalConfidence = 90;

    while (remainingMs > 0 && currentBlock >= 1 && currentBlock <= corridor.blocks) {
      const nextBlock = currentBlock + direction;
      const key = `${currentBlock}-${nextBlock}`;
      const profile = corridorData.blockProfiles[key];

      if (profile && profile.avgTimeMs > 0) {
        // We have historical data for this block transition
        if (remainingMs >= profile.avgTimeMs) {
          remainingMs -= profile.avgTimeMs;
          currentBlock = nextBlock;
          blocksAdvanced++;
        } else {
          // Partially through this block
          const fraction = remainingMs / profile.avgTimeMs;
          // Interpolate position within the block
          currentBlock = currentBlock; // Still in this block
          remainingMs = 0;
        }
      } else {
        // No history for this block — use corridor average or speed-based estimate
        source = 'community';
        totalConfidence = Math.max(60, totalConfidence - 10);
        const avgBlockLength = corridor.length / corridor.blocks; // meters
        const speed = lastOnlinePos.speed || 20; // m/s fallback
        const estimatedTransitMs = (avgBlockLength / speed) * 1000;
        if (remainingMs >= estimatedTransitMs) {
          remainingMs -= estimatedTransitMs;
          currentBlock = nextBlock;
          blocksAdvanced++;
        } else {
          remainingMs = 0;
        }
      }

      if (currentBlock < 1 || currentBlock > corridor.blocks) {
        currentBlock = Math.max(1, Math.min(corridor.blocks, currentBlock));
        break;
      }
    }

    // Degrade confidence over time (but less than basic dead reckoning)
    totalConfidence = Math.max(55, totalConfidence - Math.floor(elapsedSeconds / 120) * 3);

    // Estimate lat/lng from block position
    const blockFraction = (currentBlock - 1) / corridor.blocks;
    const blockLength = corridor.length / corridor.blocks;
    const distFromEntry = blocksAdvanced * blockLength;
    const heading = lastOnlinePos.heading || 0;
    const headingRad = (heading * Math.PI) / 180;
    const R = 6371000;
    const lat1 = (lastOnlinePos.lat * Math.PI) / 180;
    const lng1 = (lastOnlinePos.lng * Math.PI) / 180;
    const lat2 = Math.asin(Math.sin(lat1) * Math.cos(distFromEntry / R) +
      Math.cos(lat1) * Math.sin(distFromEntry / R) * Math.cos(headingRad));
    const lng2 = lng1 + Math.atan2(
      Math.sin(headingRad) * Math.sin(distFromEntry / R) * Math.cos(lat1),
      Math.cos(distFromEntry / R) - Math.sin(lat1) * Math.sin(lat2));

    return {
      lat: (lat2 * 180) / Math.PI,
      lng: (lng2 * 180) / Math.PI,
      accuracy: source === 'personal' ? 100 + elapsedSeconds * 0.5 : 200 + elapsedSeconds,
      block: currentBlock,
      corridorId: corridor.id,
      source,
      confidence: totalConfidence,
      blocksAdvanced,
      elapsedSeconds,
    };
  },

  // ─── Get summary of stored history for a corridor ───
  getCorridorSummary(corridorId) {
    const history = Store.getZoneHistory();
    const data = history[corridorId];
    if (!data) return { traversals: 0, blocksProfiled: 0, avgCrossTimeMin: 0 };
    const profiledBlocks = Object.keys(data.blockProfiles).length;
    const avgCrossTime = data.traversals.length > 0
      ? Math.round(data.traversals.reduce((s, t) => s + (t.totalTimeMs || 0), 0) / data.traversals.length / 60000)
      : 0;
    return {
      traversals: data.traversals.length,
      blocksProfiled: profiledBlocks,
      avgCrossTimeMin: avgCrossTime,
    };
  },

  // ─── Seed sample history data for demonstration ───
  seedDemoHistory() {
    const history = Store.getZoneHistory();
    if (history['NH48-GHT'] && history['NH48-GHT'].traversals.length > 0) return; // Already seeded

    // Simulate 3 past trips through NH48 Western Ghats corridor
    const now = Date.now();
    const trips = [
      { daysAgo: 7, entryBlock: 28, exitBlock: 35, speed: 22, totalMin: 16 },
      { daysAgo: 3, entryBlock: 28, exitBlock: 35, speed: 25, totalMin: 14 },
      { daysAgo: 1, entryBlock: 28, exitBlock: 35, speed: 20, totalMin: 18 },
    ];

    const corridorId = 'NH48-GHT';
    if (!history[corridorId]) history[corridorId] = { traversals: [], blockProfiles: {} };

    trips.forEach(trip => {
      const entryTime = now - trip.daysAgo * 86400000;
      const totalMs = trip.totalMin * 60000;
      const blocksTraversed = trip.exitBlock - trip.entryBlock;
      const avgTimePerBlock = totalMs / blocksTraversed;

      // Record traversal
      history[corridorId].traversals.push({
        corridorId,
        entryBlock: trip.entryBlock,
        exitBlock: trip.exitBlock,
        entrySpeed: trip.speed,
        entryTime,
        exitTime: entryTime + totalMs,
        totalTimeMs: totalMs,
        blocksTraversed,
      });

      // Record per-block profiles with realistic variation
      for (let i = 0; i < blocksTraversed; i++) {
        const from = trip.entryBlock + i;
        const to = from + 1;
        const key = `${from}-${to}`;
        if (!history[corridorId].blockProfiles[key]) {
          history[corridorId].blockProfiles[key] = { samples: [], avgTimeMs: 0, avgSpeedMps: 0 };
        }
        // Add slight random variation per block (±15%)
        const variation = 0.85 + Math.random() * 0.3;
        const transitTime = Math.round(avgTimePerBlock * variation);
        const profile = history[corridorId].blockProfiles[key];
        profile.samples.push({
          timeMs: transitTime,
          speed: trip.speed * (0.9 + Math.random() * 0.2),
          timestamp: entryTime + i * avgTimePerBlock,
        });
        profile.avgTimeMs = Math.round(profile.samples.reduce((s, p) => s + p.timeMs, 0) / profile.samples.length);
        profile.avgSpeedMps = profile.samples.reduce((s, p) => s + p.speed, 0) / profile.samples.length;
      }
    });

    // Also seed crossings for display
    const crossings = Store.getCrossings();
    if (crossings.length === 0) {
      trips.forEach(trip => {
        for (let b = trip.entryBlock; b <= trip.exitBlock; b++) {
          Store.saveCrossing({
            blockCode: `NH48-B${String(b).padStart(2, '0')}`,
            corridor: { code: 'NH48', id: 'NH48-GHT' },
            block: b,
            lat: 19.5 + (b - 28) * 0.02,
            lng: 73.8 + (b - 28) * 0.015,
            speed: Math.round(trip.speed * 3.6),
            timestamp: now - trip.daysAgo * 86400000 + (b - trip.entryBlock) * 120000,
            date: new Date(now - trip.daysAgo * 86400000).toLocaleDateString(),
          });
        }
      });
    }

    Store.saveZoneHistory(history);
    console.log('[DeadZone] Demo history seeded: 3 trips, 7 blocks profiled for NH48-GHT');
  },

  // ─── Get community average speed from all corridor traversals ───
  getCommunityAvgSpeed() {
    const history = Store.getZoneHistory();
    let totalSpeed = 0;
    let count = 0;
    Object.values(history).forEach(corridorData => {
      if (corridorData.blockProfiles) {
        Object.values(corridorData.blockProfiles).forEach(profile => {
          if (profile.avgSpeedMps > 0) {
            totalSpeed += profile.avgSpeedMps * 3.6; // Convert to km/h
            count++;
          }
        });
      }
      // Also from traversals
      if (corridorData.traversals) {
        corridorData.traversals.forEach(t => {
          if (t.entrySpeed && t.entrySpeed > 0) {
            totalSpeed += t.entrySpeed * 3.6;
            count++;
          }
        });
      }
    });
    return count > 0 ? Math.round(totalSpeed / count) : null; // null = no data, use default
  },
};

// ═══ Block Registry — 1000m Grid-Based Immutable Blocks ═══
// Blocks are auto-generated when vehicles enter new 1km grid cells.
// Once created, a block is IMMUTABLE and cannot be changed.
const BLOCK_GRID_SIZE = 1000; // meters
const BLOCK_HYSTERESIS_DISTANCE = 100; // meters — stay in current block if within this distance of its center

const BlockRegistry = {
  _currentBlockId: null, // Track current block for hysteresis

  // Convert lat/lng to grid cell coordinates
  getGridCell(lat, lng) {
    // 1 degree latitude ≈ 111,320 meters
    // 1 degree longitude ≈ 111,320 * cos(lat) meters
    const latMeters = 111320;
    const lngMeters = 111320 * Math.cos((lat * Math.PI) / 180);
    const gridRow = Math.floor((lat * latMeters) / BLOCK_GRID_SIZE);
    const gridCol = Math.floor((lng * lngMeters) / BLOCK_GRID_SIZE);
    return { gridRow, gridCol };
  },

  // Get block ID from lat/lng WITH hysteresis to prevent jitter at block edges
  getBlockId(lat, lng) {
    const cell = this.getGridCell(lat, lng);
    const rawBlockId = `BLK-${cell.gridRow}-${cell.gridCol}`;

    // If we have a current block, check if we're still close to its center (hysteresis)
    if (this._currentBlockId && this._currentBlockId !== rawBlockId) {
      const currentBlock = this.getBlock(this._currentBlockId);
      if (currentBlock && currentBlock.centerLat != null && currentBlock.centerLng != null) {
        const distFromCurrent = Utils.haversine(lat, lng, currentBlock.centerLat, currentBlock.centerLng);
        // Stay in current block if within hysteresis zone
        if (distFromCurrent < BLOCK_HYSTERESIS_DISTANCE) {
          return this._currentBlockId;
        }
      }
    }
    this._currentBlockId = rawBlockId;
    return rawBlockId;
  },

  // Get center coordinates of a grid cell
  getCellCenter(gridRow, gridCol) {
    const latMeters = 111320;
    const centerLatDeg = ((gridRow + 0.5) * BLOCK_GRID_SIZE) / latMeters;
    const lngMeters = 111320 * Math.cos((centerLatDeg * Math.PI) / 180);
    const centerLngDeg = ((gridCol + 0.5) * BLOCK_GRID_SIZE) / lngMeters;
    return { lat: centerLatDeg, lng: centerLngDeg };
  },

  // Get or create a block at this position. Returns block object.
  getOrCreateBlock(lat, lng, creatorId) {
    const blockId = this.getBlockId(lat, lng);
    const blocks = this.getAllBlocks();
    if (blocks[blockId]) return blocks[blockId]; // Already exists — immutable

    const cell = this.getGridCell(lat, lng);
    const center = this.getCellCenter(cell.gridRow, cell.gridCol);
    const block = {
      id: blockId,
      gridRow: cell.gridRow,
      gridCol: cell.gridCol,
      centerLat: center.lat,
      centerLng: center.lng,
      sizeMeter: BLOCK_GRID_SIZE,
      createdAt: new Date().toISOString(),
      createdBy: creatorId || 'unknown',
      source: 'gps', // 'gps' or 'offline_retrogenerated'
      locked: true,
    };
    blocks[blockId] = block;
    Store.setObj(STORE_KEYS.BLOCK_REGISTRY, blocks);
    console.log(`[BlockRegistry] New block created: ${blockId} by ${creatorId}`);
    return block;
  },

  // Create a block from offline retro-generation
  createRetroBlock(lat, lng, creatorId, estimatedTime) {
    const blockId = this.getBlockId(lat, lng);
    const blocks = this.getAllBlocks();
    if (blocks[blockId]) return blocks[blockId]; // Already exists

    const cell = this.getGridCell(lat, lng);
    const center = this.getCellCenter(cell.gridRow, cell.gridCol);
    const block = {
      id: blockId,
      gridRow: cell.gridRow,
      gridCol: cell.gridCol,
      centerLat: center.lat,
      centerLng: center.lng,
      sizeMeter: BLOCK_GRID_SIZE,
      createdAt: estimatedTime || new Date().toISOString(),
      createdBy: creatorId || 'unknown',
      source: 'offline_retrogenerated',
      locked: true,
    };
    blocks[blockId] = block;
    Store.setObj(STORE_KEYS.BLOCK_REGISTRY, blocks);
    console.log(`[BlockRegistry] Retro-block created: ${blockId}`);
    return block;
  },

  getAllBlocks() {
    return Store.getObj(STORE_KEYS.BLOCK_REGISTRY);
  },

  getBlock(id) {
    return this.getAllBlocks()[id] || null;
  },

  getBlockCount() {
    return Object.keys(this.getAllBlocks()).length;
  },

  exportToJSON() {
    return JSON.stringify(this.getAllBlocks(), null, 2);
  },

  importFromJSON(jsonStr) {
    try {
      const imported = JSON.parse(jsonStr);
      const existing = this.getAllBlocks();
      let added = 0;
      for (const id in imported) {
        if (!existing[id]) { // Never overwrite existing blocks (immutable)
          existing[id] = imported[id];
          added++;
        }
      }
      Store.setObj(STORE_KEYS.BLOCK_REGISTRY, existing);
      console.log(`[BlockRegistry] Imported ${added} new blocks (${Object.keys(imported).length - added} duplicates skipped)`);
      return added;
    } catch (e) {
      console.error('[BlockRegistry] Import failed:', e);
      return 0;
    }
  },
};

// ═══ Block Transit Log — Entry/Exit Timing Records ═══
const BlockTransitLog = {
  getAll() { return Store.get(STORE_KEYS.BLOCK_TRANSIT_LOG); },

  recordEntry(driverId, blockId, timestamp, speed, lat, lng) {
    const entry = {
      id: `TRN-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: 'entry',
      driverId,
      blockId,
      timestamp: timestamp || new Date().toISOString(),
      speed: speed || 0,
      lat, lng,
    };
    const log = this.getAll();
    log.unshift(entry);
    if (log.length > 2000) log.pop(); // Keep max 2000 records
    Store.set(STORE_KEYS.BLOCK_TRANSIT_LOG, log);
    return entry;
  },

  recordExit(driverId, blockId, timestamp, speed, lat, lng) {
    const entry = {
      id: `TRN-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: 'exit',
      driverId,
      blockId,
      timestamp: timestamp || new Date().toISOString(),
      speed: speed || 0,
      lat, lng,
    };
    const log = this.getAll();
    log.unshift(entry);
    if (log.length > 2000) log.pop();
    Store.set(STORE_KEYS.BLOCK_TRANSIT_LOG, log);
    return entry;
  },

  getByBlock(blockId) {
    return this.getAll().filter(e => e.blockId === blockId);
  },

  getByDriver(driverId) {
    return this.getAll().filter(e => e.driverId === driverId);
  },

  getAvgSpeedForBlock(blockId) {
    const records = this.getByBlock(blockId).filter(e => e.speed > 0);
    if (records.length === 0) return null;
    return records.reduce((s, e) => s + e.speed, 0) / records.length;
  },

  getTransitCount() {
    return this.getAll().length;
  },

  exportToJSON() {
    return JSON.stringify(this.getAll(), null, 2);
  },

  importFromJSON(jsonStr) {
    try {
      const imported = JSON.parse(jsonStr);
      const existing = this.getAll();
      const existingIds = new Set(existing.map(e => e.id));
      let added = 0;
      imported.forEach(record => {
        if (!existingIds.has(record.id)) {
          existing.push(record);
          added++;
        }
      });
      // Sort by timestamp descending, keep max 2000
      existing.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      if (existing.length > 2000) existing.length = 2000;
      Store.set(STORE_KEYS.BLOCK_TRANSIT_LOG, existing);
      console.log(`[BlockTransitLog] Imported ${added} new records`);
      return added;
    } catch (e) {
      console.error('[BlockTransitLog] Import failed:', e);
      return 0;
    }
  },
};

// ═══ Driver Registry — Mobile-Based Login ═══
const DriverRegistry = {
  loginDriver(mobileNumber) {
    const cleaned = mobileNumber.replace(/\D/g, '').slice(-10); // Last 10 digits
    if (cleaned.length < 10) return null;
    const driverId = `DRV-${cleaned}`;
    const drivers = Store.get(STORE_KEYS.DRIVERS);
    let driver = drivers.find(d => d.id === driverId);
    if (!driver) {
      driver = {
        id: driverId,
        mobile: cleaned,
        registeredAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        totalSessions: 1,
      };
      drivers.push(driver);
    } else {
      driver.lastLogin = new Date().toISOString();
      driver.totalSessions = (driver.totalSessions || 0) + 1;
    }
    Store.set(STORE_KEYS.DRIVERS, drivers);
    return driver;
  },

  getDriver(id) {
    return Store.get(STORE_KEYS.DRIVERS).find(d => d.id === id) || null;
  },

  getAllDrivers() {
    return Store.get(STORE_KEYS.DRIVERS);
  },

  getDriverCount() {
    return Store.get(STORE_KEYS.DRIVERS).length;
  },
};

// ═══ Data Buffer — 5-Minute Batched Sync ═══
// Buffers block and transit data in sessionStorage, flushes to main localStorage every 5 min.
const DataBuffer = {
  BUFFER_KEY: 'apara_session_buffer',
  FLUSH_INTERVAL: 5 * 60 * 1000, // 5 minutes
  _flushTimer: null,

  init() {
    // Start periodic flush
    this._flushTimer = setInterval(() => this.flush(), this.FLUSH_INTERVAL);
    // Flush on page unload
    window.addEventListener('beforeunload', () => this.flush());
    console.log('[DataBuffer] Initialized — flushing every 5 minutes');
  },

  _getBuffer() {
    try {
      return JSON.parse(sessionStorage.getItem(this.BUFFER_KEY)) || { blocks: {}, transits: [] };
    } catch { return { blocks: {}, transits: [] }; }
  },

  _saveBuffer(buffer) {
    sessionStorage.setItem(this.BUFFER_KEY, JSON.stringify(buffer));
  },

  // Buffer a new block (will be flushed to BlockRegistry)
  bufferBlock(block) {
    const buffer = this._getBuffer();
    if (!buffer.blocks[block.id]) {
      buffer.blocks[block.id] = block;
      this._saveBuffer(buffer);
    }
  },

  // Buffer a transit record (will be flushed to BlockTransitLog)
  bufferTransit(transit) {
    const buffer = this._getBuffer();
    buffer.transits.push(transit);
    this._saveBuffer(buffer);
  },

  // Flush all buffered data to main localStorage
  flush() {
    const buffer = this._getBuffer();
    let blocksFlushed = 0;
    let transitsFlushed = 0;

    // Flush blocks
    if (Object.keys(buffer.blocks).length > 0) {
      const existing = Store.getObj(STORE_KEYS.BLOCK_REGISTRY);
      for (const id in buffer.blocks) {
        if (!existing[id]) {
          existing[id] = buffer.blocks[id];
          blocksFlushed++;
        }
      }
      Store.setObj(STORE_KEYS.BLOCK_REGISTRY, existing);
    }

    // Flush transits
    if (buffer.transits.length > 0) {
      const existing = Store.get(STORE_KEYS.BLOCK_TRANSIT_LOG);
      buffer.transits.forEach(t => existing.unshift(t));
      if (existing.length > 2000) existing.length = 2000;
      Store.set(STORE_KEYS.BLOCK_TRANSIT_LOG, existing);
      transitsFlushed = buffer.transits.length;
    }

    // Clear buffer
    sessionStorage.removeItem(this.BUFFER_KEY);

    if (blocksFlushed > 0 || transitsFlushed > 0) {
      console.log(`[DataBuffer] Flushed: ${blocksFlushed} blocks, ${transitsFlushed} transits`);
    }
  },

  getBufferSize() {
    const buffer = this._getBuffer();
    return {
      blocks: Object.keys(buffer.blocks).length,
      transits: buffer.transits.length,
    };
  },
};

// ═══ Offline Retro-Generator — Creates blocks when GPS returns ═══
const OfflineRetroGenerator = {
  // Called when GPS comes back after being offline
  // lastPos: {lat, lng, speed, heading, timestamp} - position when went offline
  // newPos: {lat, lng, speed, timestamp} - position when GPS returned
  // driverId: the driver's ID
  retroGenerateBlocks(lastPos, newPos, driverId) {
    if (!lastPos || !newPos) return [];

    const distance = Utils.haversine(lastPos.lat, lastPos.lng, newPos.lat, newPos.lng);
    const elapsedMs = newPos.timestamp - lastPos.timestamp;
    const elapsedSec = elapsedMs / 1000;

    if (distance < BLOCK_GRID_SIZE || elapsedSec < 10) return []; // Too short

    // Calculate number of intermediate points
    const numSteps = Math.ceil(distance / BLOCK_GRID_SIZE);
    const generatedBlocks = [];
    const generatedTransits = [];

    // Walk a straight line from lastPos to newPos
    for (let i = 0; i <= numSteps; i++) {
      const fraction = i / numSteps;
      const lat = lastPos.lat + (newPos.lat - lastPos.lat) * fraction;
      const lng = lastPos.lng + (newPos.lng - lastPos.lng) * fraction;
      const estimatedTime = new Date(lastPos.timestamp + elapsedMs * fraction).toISOString();
      const avgSpeed = distance / elapsedSec; // m/s

      // Create block
      const block = BlockRegistry.createRetroBlock(lat, lng, driverId, estimatedTime);
      generatedBlocks.push(block);

      // Record transit
      if (i > 0) {
        const prevBlockId = generatedBlocks[i - 1].id;
        if (prevBlockId !== block.id) {
          // Exit previous block
          BlockTransitLog.recordExit(driverId, prevBlockId, estimatedTime, avgSpeed * 3.6, lat, lng);
          // Enter new block
          BlockTransitLog.recordEntry(driverId, block.id, estimatedTime, avgSpeed * 3.6, lat, lng);
        }
      } else {
        // First block — record entry
        BlockTransitLog.recordEntry(driverId, block.id, estimatedTime, avgSpeed * 3.6, lat, lng);
      }
    }

    console.log(`[RetroGen] Generated ${generatedBlocks.length} blocks over ${Math.round(distance)}m in ${Math.round(elapsedSec)}s`);
    return generatedBlocks;
  },
};

// ═══ India-Specific Block Code Encoder — 8-Character Unique Codes ═══
// Format: RRR CCC T K  (Row 3 chars + Col 3 chars + Type 1 char + Checksum 1 char)
// Covers all of India at 1km resolution. No two blocks share a code.
const INDIA_ROW_BASE = 800;
const INDIA_COL_BASE = 5500;
const BASE36 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const BlockCodeEncoder = {
  SOS_TYPE_CHARS: { 'ACC': 'A', 'MED': 'M', 'TYR': 'T', 'FUL': 'F', 'TOW': 'W' },
  SOS_CHAR_TYPES: { 'A': 'ACC', 'M': 'MED', 'T': 'TYR', 'F': 'FUL', 'W': 'TOW' },

  _toBase36(num, len) {
    let s = '';
    let n = Math.max(0, Math.floor(num));
    for (let i = 0; i < len; i++) {
      s = BASE36[n % 36] + s;
      n = Math.floor(n / 36);
    }
    return s;
  },

  _fromBase36(str) {
    let n = 0;
    for (let i = 0; i < str.length; i++) {
      n = n * 36 + BASE36.indexOf(str[i].toUpperCase());
    }
    return n;
  },

  _checksum(s) {
    let sum = 0;
    for (let i = 0; i < s.length; i++) {
      sum = (sum + BASE36.indexOf(s[i].toUpperCase()) * (i + 1)) % 36;
    }
    return BASE36[sum];
  },

  // Encode lat/lng + SOS type → 8-char code
  encode(lat, lng, sosTypeCode) {
    const grid = BlockRegistry.getGridCell(lat, lng);
    const relRow = Math.max(0, grid.gridRow - INDIA_ROW_BASE);
    const relCol = Math.max(0, grid.gridCol - INDIA_COL_BASE);
    const rowCode = this._toBase36(relRow, 3);
    const colCode = this._toBase36(relCol, 3);
    const typeChar = this.SOS_TYPE_CHARS[sosTypeCode] || 'A';
    const body = rowCode + colCode + typeChar;
    return body + this._checksum(body);
  },

  // Decode 8-char code → { lat, lng, sosType, valid }
  decode(code) {
    if (!code || code.length < 8) return { valid: false, error: 'Code must be 8 characters' };
    code = code.toUpperCase().replace(/[^0-9A-Z]/g, '');
    if (code.length !== 8) return { valid: false, error: 'Invalid characters in code' };

    const body = code.substring(0, 7);
    const checkChar = code[7];
    if (this._checksum(body) !== checkChar) return { valid: false, error: 'Invalid checksum — check for typos' };

    const rowCode = code.substring(0, 3);
    const colCode = code.substring(3, 6);
    const typeChar = code[6];

    const relRow = this._fromBase36(rowCode);
    const relCol = this._fromBase36(colCode);
    const gridRow = relRow + INDIA_ROW_BASE;
    const gridCol = relCol + INDIA_COL_BASE;

    const center = BlockRegistry.getCellCenter(gridRow, gridCol);
    const sosTypeCode = this.SOS_CHAR_TYPES[typeChar];
    const sosType = EMERGENCY_TYPES.find(t => t.code === sosTypeCode);

    return {
      valid: true,
      lat: center.lat,
      lng: center.lng,
      gridRow, gridCol,
      blockId: `BLK-${gridRow}-${gridCol}`,
      sosTypeCode, sosType, typeChar,
      fullCode: code,
    };
  },
};

// ═══ Zone Manager — Auto Zone Detection + Permanent Provider Caching ═══
// Divides India into 1°×1° zones (~111km). Loads providers per zone permanently.
// Auto-prefetches adjacent zones when driver approaches zone boundary.
const ZONE_SIZE_DEG = 1;
const ZONE_PREFETCH_KM = 80;

const ZoneManager = {
  _currentZoneId: null,
  _prefetchedSet: {},
  _listeners: [],

  getZoneId(lat, lng) {
    const zLat = Math.floor(lat / ZONE_SIZE_DEG) * ZONE_SIZE_DEG;
    const zLng = Math.floor(lng / ZONE_SIZE_DEG) * ZONE_SIZE_DEG;
    return `Z-${zLat}-${zLng}`;
  },

  getZoneCenter(zoneId) {
    const parts = zoneId.split('-');
    return { lat: parseInt(parts[1]) + ZONE_SIZE_DEG / 2, lng: parseInt(parts[2]) + ZONE_SIZE_DEG / 2 };
  },

  _getIndex() {
    try { return JSON.parse(localStorage.getItem(STORE_KEYS.ZONE_INDEX)) || { zones: [] }; }
    catch { return { zones: [] }; }
  },

  _saveIndex(idx) { localStorage.setItem(STORE_KEYS.ZONE_INDEX, JSON.stringify(idx)); },

  isZoneCached(zoneId) { return localStorage.getItem(STORE_KEYS.ZONE_PREFIX + zoneId) !== null; },

  getZoneData(zoneId) {
    try { return JSON.parse(localStorage.getItem(STORE_KEYS.ZONE_PREFIX + zoneId)); }
    catch { return null; }
  },

  getCachedZoneIds() { return this._getIndex().zones; },

  getTotalCachedProviders() {
    let c = 0;
    this.getCachedZoneIds().forEach(zId => {
      const d = this.getZoneData(zId);
      if (d && d.providers) c += d.providers.length;
    });
    return c;
  },

  // Load zone — filter providers AND shops by distance, store permanently
  loadZone(zoneId, allProviders) {
    if (this.isZoneCached(zoneId)) return this.getZoneData(zoneId);
    const center = this.getZoneCenter(zoneId);
    const radiusM = ZONE_SIZE_DEG * 111320;
    const provs = (allProviders || Store.getProviders()).filter(p => {
      if (!p.gps) return false;
      const parts = p.gps.split(',').map(s => parseFloat(s.trim()));
      if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) return false;
      return Utils.haversine(center.lat, center.lng, parts[0], parts[1]) <= radiusM;
    }).map(p => {
      const pts = p.gps.split(',').map(s => parseFloat(s.trim()));
      return { id: p.id, name: p.name, cat: p.category?.code || '', catIcon: p.category?.icon || '', catLabel: p.category?.label || '', phone: p.phone, lat: pts[0], lng: pts[1], status: p.status };
    });

    // Also cache shops in this zone
    const allShops = typeof ShopRegistry !== 'undefined' ? ShopRegistry.getShops() : [];
    const zoneShops = allShops.filter(s => {
      if (s.status !== 'Active' || !s.gps) return false;
      const pts = s.gps.split(',').map(x => parseFloat(x.trim()));
      if (pts.length !== 2 || isNaN(pts[0]) || isNaN(pts[1])) return false;
      return Utils.haversine(center.lat, center.lng, pts[0], pts[1]) <= radiusM;
    }).map(s => {
      const pts = s.gps.split(',').map(x => parseFloat(x.trim()));
      return { id: s.id, name: s.name, catCode: s.category?.code || s.categoryCode || '', phone: s.phone, lat: pts[0], lng: pts[1], gps: s.gps, hours: s.hours, owner: s.owner };
    });

    const zoneData = {
      zoneId, centerLat: center.lat, centerLng: center.lng,
      loadedAt: new Date().toISOString(),
      configVersion: parseInt(localStorage.getItem(STORE_KEYS.CONFIG_VERSION) || '1'),
      providerCount: provs.length, providers: provs,
      shopCount: zoneShops.length, shops: zoneShops,
    };
    localStorage.setItem(STORE_KEYS.ZONE_PREFIX + zoneId, JSON.stringify(zoneData));
    const idx = this._getIndex();
    if (!idx.zones.includes(zoneId)) { idx.zones.push(zoneId); idx.lastUpdated = new Date().toISOString(); this._saveIndex(idx); }
    console.log(`[ZoneManager] Zone ${zoneId} cached: ${provs.length} providers, ${zoneShops.length} shops`);
    this._notify({ type: 'zone_loaded', zoneId, providerCount: provs.length, shopCount: zoneShops.length });
    return zoneData;
  },

  // Auto-detect zone boundary + prefetch
  checkBoundary(lat, lng) {
    const curZone = this.getZoneId(lat, lng);
    const result = { zoneChanged: false, newZone: null, prefetching: false, prefetchZone: null };
    if (curZone !== this._currentZoneId) {
      this._currentZoneId = curZone;
      if (!this.isZoneCached(curZone)) {
        this.loadZone(curZone);
        result.zoneChanged = true;
        result.newZone = curZone;
      }
    }
    // Check proximity to boundary for prefetch
    const center = this.getZoneCenter(curZone);
    const distKm = Utils.haversine(lat, lng, center.lat, center.lng) / 1000;
    if (distKm > ZONE_PREFETCH_KM) {
      const adjacent = [
        this.getZoneId(lat + ZONE_SIZE_DEG, lng),
        this.getZoneId(lat - ZONE_SIZE_DEG, lng),
        this.getZoneId(lat, lng + ZONE_SIZE_DEG),
        this.getZoneId(lat, lng - ZONE_SIZE_DEG),
      ];
      for (const adj of adjacent) {
        if (!this.isZoneCached(adj) && !this._prefetchedSet[adj]) {
          this._prefetchedSet[adj] = true;
          this.loadZone(adj);
          result.prefetching = true;
          result.prefetchZone = adj;
          break;
        }
      }
    }
    return result;
  },

  // Search ALL cached zones for nearest provider
  searchNearest(lat, lng, categoryCode) {
    let nearest = null, minDist = Infinity;
    this.getCachedZoneIds().forEach(zId => {
      const zone = this.getZoneData(zId);
      if (!zone || !zone.providers) return;
      zone.providers.forEach(p => {
        if (p.status !== 'Active') return;
        if (categoryCode && p.cat !== categoryCode) return;
        const dist = Utils.haversine(lat, lng, p.lat, p.lng);
        if (dist < minDist) { minDist = dist; nearest = { ...p, distance: dist }; }
      });
    });
    return nearest;
  },

  // Search best provider by SOS type
  searchBySOS(lat, lng, sosTypeCode) {
    const map = { 'ACC': ['HOSP','TOW'], 'MED': ['HOSP','PHAR'], 'TYR': ['PUNC','MECH'], 'FUL': ['FUEL'], 'TOW': ['TOW','MECH'] };
    const cats = map[sosTypeCode] || [];
    for (const cat of cats) {
      const r = this.searchNearest(lat, lng, cat);
      if (r) return r;
    }
    return this.searchNearest(lat, lng, null);
  },

  getStatus() {
    const zones = this.getCachedZoneIds();
    let totalShops = 0;
    zones.forEach(zId => {
      const d = this.getZoneData(zId);
      if (d && d.shops) totalShops += d.shops.length;
    });
    return { zoneCount: zones.length, totalProviders: this.getTotalCachedProviders(), totalShops, currentZone: this._currentZoneId, estimatedSizeKB: Math.round(zones.length * 12) };
  },

  // Get shops within a specific radius from all cached zones
  getShopsInRadius(lat, lng, radiusM) {
    const results = [];
    this.getCachedZoneIds().forEach(zId => {
      const zone = this.getZoneData(zId);
      if (!zone || !zone.shops) return;
      zone.shops.forEach(s => {
        const dist = Utils.haversine(lat, lng, s.lat, s.lng);
        if (dist <= radiusM) {
          results.push({ ...s, distance: dist });
        }
      });
    });
    results.sort((a, b) => a.distance - b.distance);
    return results;
  },

  onChange(fn) { this._listeners.push(fn); },
  _notify(evt) { this._listeners.forEach(fn => fn(evt)); },
};

// ═══ Transit Batch Sync — 15-Day Buffered Upload (Blocks + Transits) ═══
// Stores all block entries/exits AND new block data locally.
// Compresses and uploads as a single file every 15 days.
const BATCH_SYNC_DAYS = 15;

const TransitBatchSync = {
  _getBuffer() {
    try { return JSON.parse(localStorage.getItem(STORE_KEYS.BATCH_BUFFER)) || { blocks: {}, transits: [], startedAt: new Date().toISOString() }; }
    catch { return { blocks: {}, transits: [], startedAt: new Date().toISOString() }; }
  },
  _saveBuffer(buf) { localStorage.setItem(STORE_KEYS.BATCH_BUFFER, JSON.stringify(buf)); },
  _getMeta() {
    try { return JSON.parse(localStorage.getItem(STORE_KEYS.BATCH_META)) || { lastSyncAt: null, totalSyncs: 0 }; }
    catch { return { lastSyncAt: null, totalSyncs: 0 }; }
  },
  _saveMeta(meta) { localStorage.setItem(STORE_KEYS.BATCH_META, JSON.stringify(meta)); },

  // Buffer a transit record
  bufferTransit(record) {
    const buf = this._getBuffer();
    buf.transits.push({
      t: record.type === 'entry' ? 'E' : 'X',
      b: record.blockId,
      ts: record.timestamp,
      s: Math.round(record.speed || 0),
      la: record.lat ? +record.lat.toFixed(5) : 0,
      ln: record.lng ? +record.lng.toFixed(5) : 0,
    });
    this._saveBuffer(buf);
  },

  // Buffer a new block
  bufferBlock(block) {
    const buf = this._getBuffer();
    if (!buf.blocks[block.id]) {
      buf.blocks[block.id] = {
        la: block.centerLat ? +block.centerLat.toFixed(5) : 0,
        ln: block.centerLng ? +block.centerLng.toFixed(5) : 0,
        cr: block.createdAt,
        src: block.source === 'gps' ? 'G' : 'O',
      };
      this._saveBuffer(buf);
    }
  },

  getDaysSinceSync() {
    const meta = this._getMeta();
    const ref = meta.lastSyncAt ? new Date(meta.lastSyncAt) : new Date(this._getBuffer().startedAt || Date.now());
    return Math.floor((Date.now() - ref.getTime()) / 86400000);
  },

  shouldSync() { return this.getDaysSinceSync() >= BATCH_SYNC_DAYS; },

  getStats() {
    const buf = this._getBuffer();
    const raw = JSON.stringify(buf).length;
    return {
      transitCount: buf.transits.length,
      blockCount: Object.keys(buf.blocks).length,
      rawSizeKB: Math.round(raw / 1024 * 10) / 10,
      compressedSizeKB: Math.round(raw / 1024 * 0.15 * 10) / 10,
      daysSinceSync: this.getDaysSinceSync(),
      daysUntilSync: Math.max(0, BATCH_SYNC_DAYS - this.getDaysSinceSync()),
      totalSyncs: this._getMeta().totalSyncs,
    };
  },

  // Build compressed payload
  buildPayload(driverId) {
    const buf = this._getBuffer();
    const payload = { v: 1, d: driverId, ts: new Date().toISOString(), b: buf.blocks, t: buf.transits };
    const json = JSON.stringify(payload);
    // Dictionary compression: replace repeated blockIds/timestamps
    let compressed = json;
    const dict = {}; let tid = 0;
    const repeats = json.match(/"BLK-[0-9-]+"/g);
    if (repeats) {
      const freq = {};
      repeats.forEach(r => { freq[r] = (freq[r] || 0) + 1; });
      Object.entries(freq).filter(([,c]) => c > 1).sort((a,b) => b[1]-a[1]).slice(0, 50).forEach(([str]) => {
        const tok = `~${tid++}~`; dict[tok] = str;
        compressed = compressed.split(str).join(tok);
      });
    }
    const final = JSON.stringify({ c: compressed, d: dict });
    return { raw: json, compressed: final, rawSizeKB: Math.round(json.length / 1024 * 10) / 10, compressedSizeKB: Math.round(final.length / 1024 * 10) / 10, records: buf.transits.length, blocks: Object.keys(buf.blocks).length };
  },

  // Perform sync
  sync(driverId) {
    const payload = this.buildPayload(driverId);
    console.log(`[BatchSync] Synced: ${payload.records} transits + ${payload.blocks} blocks (${payload.compressedSizeKB} KB)`);
    // Clear buffer
    localStorage.setItem(STORE_KEYS.BATCH_BUFFER, JSON.stringify({ blocks: {}, transits: [], startedAt: new Date().toISOString() }));
    const meta = this._getMeta();
    meta.lastSyncAt = new Date().toISOString();
    meta.totalSyncs = (meta.totalSyncs || 0) + 1;
    this._saveMeta(meta);
    return payload;
  },

  // Export batch as downloadable file
  exportBatch(driverId) {
    const payload = this.buildPayload(driverId);
    const blob = new Blob([payload.compressed], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `apara_batch_${driverId}_${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
    return payload;
  },
};

// ═══ Config Push — Provider Change Notifications ═══
// Polls every 30 min for config version changes.
// When admin adds/removes providers, affected zones are refreshed.
const CONFIG_CHECK_INTERVAL = 30 * 60 * 1000;

const ConfigPush = {
  _timer: null,
  _listeners: [],
  _pendingChanges: null,

  init() {
    this._timer = setInterval(() => this.checkForUpdates(), CONFIG_CHECK_INTERVAL);
    setTimeout(() => this.checkForUpdates(), 5000);
  },

  getVersion() { return parseInt(localStorage.getItem(STORE_KEYS.CONFIG_VERSION) || '1'); },
  setVersion(v) { localStorage.setItem(STORE_KEYS.CONFIG_VERSION, String(v)); },
  incrementVersion() { const v = this.getVersion() + 1; this.setVersion(v); return v; },
  bumpVersion(changeInfo) {
    const v = this.incrementVersion();
    console.log(`[ConfigPush] Version bumped to v${v}`, changeInfo || '');
    // Immediately check for zone updates
    setTimeout(() => this.checkForUpdates(), 500);
    return v;
  },

  checkForUpdates() {
    const currentVersion = this.getVersion();
    const zones = ZoneManager.getCachedZoneIds();
    const outdated = [];
    zones.forEach(zId => {
      const zone = ZoneManager.getZoneData(zId);
      if (zone && zone.configVersion < currentVersion) outdated.push(zId);
    });
    if (outdated.length === 0) return;

    const allProviders = Store.getProviders();
    const changes = { added: 0, removed: 0, zones: outdated.length };
    outdated.forEach(zId => {
      const oldZone = ZoneManager.getZoneData(zId);
      const oldIds = new Set((oldZone?.providers || []).map(p => p.id));
      // Force reload
      localStorage.removeItem(STORE_KEYS.ZONE_PREFIX + zId);
      const idx = ZoneManager._getIndex();
      idx.zones = idx.zones.filter(z => z !== zId);
      ZoneManager._saveIndex(idx);
      const newZone = ZoneManager.loadZone(zId, allProviders);
      const newIds = new Set(newZone.providers.map(p => p.id));
      newIds.forEach(id => { if (!oldIds.has(id)) changes.added++; });
      oldIds.forEach(id => { if (!newIds.has(id)) changes.removed++; });
    });

    if (changes.added > 0 || changes.removed > 0) {
      this._pendingChanges = changes;
      this._notify(changes);
      console.log(`[ConfigPush] Updated ${outdated.length} zones: +${changes.added} -${changes.removed} providers`);
    }
  },

  getPendingChanges() { return this._pendingChanges; },
  dismissChanges() { this._pendingChanges = null; },
  onChange(fn) { this._listeners.push(fn); },
  _notify(changes) { this._listeners.forEach(fn => fn(changes)); },
};

// ═══════════ MARKETPLACE — Shop, Menu & Order System ═══════════

const SHOP_CATEGORIES = [
  { code: 'FOOD', label: 'Restaurant / Dhaba', icon: '🍛' },
  { code: 'STLL', label: 'Food Stall', icon: '🍢' },
  { code: 'CAFE', label: 'Café / Tea Stall', icon: '☕' },
  { code: 'BAKE', label: 'Bakery / Snacks', icon: '🥐' },
  { code: 'GROC', label: 'General Store', icon: '🛒' },
  { code: 'FUEL', label: 'Fuel Station', icon: '⛽' },
  { code: 'MECH', label: 'Mechanic', icon: '🔧' },
  { code: 'PHAR', label: 'Pharmacy', icon: '💊' },
];

const ITEM_CATEGORIES = [
  { code: 'FOOD', label: 'Food', icon: '🍛' },
  { code: 'DRNK', label: 'Drink', icon: '🧃' },
  { code: 'SNCK', label: 'Snack', icon: '🍿' },
  { code: 'SRVS', label: 'Service', icon: '🔧' },
  { code: 'OTHR', label: 'Other', icon: '📦' },
];

// ═══ Shop Registry — CRUD for shops/restaurants/stalls ═══
const ShopRegistry = {
  getShops() { return Store.get(STORE_KEYS.SHOPS); },

  saveShop(shop) {
    const list = this.getShops();
    list.push(shop);
    Store.set(STORE_KEYS.SHOPS, list);
    // Bump config version so zones refresh
    ConfigPush.bumpVersion({ type: 'shop_added', shopId: shop.id });
  },

  updateShop(id, updates) {
    const list = this.getShops();
    const idx = list.findIndex(s => s.id === id);
    if (idx >= 0) {
      Object.assign(list[idx], updates);
      Store.set(STORE_KEYS.SHOPS, list);
    }
  },

  deleteShop(id) {
    const list = this.getShops().filter(s => s.id !== id);
    Store.set(STORE_KEYS.SHOPS, list);
    // Also remove menu
    localStorage.removeItem(STORE_KEYS.MENU_PREFIX + id);
    ConfigPush.bumpVersion({ type: 'shop_deleted', shopId: id });
  },

  findShop(id, password) {
    return this.getShops().find(s => s.id === id && s.password === password);
  },

  getShopById(id) {
    return this.getShops().find(s => s.id === id) || null;
  },

  getShopsByBlock(blockId) {
    return this.getShops().filter(s => {
      if (!s.gps) return false;
      const parts = s.gps.split(',').map(x => parseFloat(x.trim()));
      if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) return false;
      const shopBlockId = BlockRegistry.getBlockId(parts[0], parts[1]);
      return shopBlockId === blockId;
    });
  },

  getNearbyShops(lat, lng, radiusM) {
    radiusM = radiusM || 5000; // default 5km
    return this.getShops()
      .filter(s => s.status === 'Active' && s.gps)
      .map(s => {
        const parts = s.gps.split(',').map(x => parseFloat(x.trim()));
        if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) return null;
        const dist = Utils.haversine(lat, lng, parts[0], parts[1]);
        if (dist > radiusM) return null;
        return { ...s, distance: dist, shopLat: parts[0], shopLng: parts[1] };
      })
      .filter(Boolean)
      .sort((a, b) => a.distance - b.distance);
  },

  getShopCount() { return this.getShops().length; },

  generateShopId(categoryCode) {
    const existing = this.getShops().filter(s => s.id.startsWith(`SHOP-${categoryCode}-`));
    const num = existing.length + 1;
    return `SHOP-${categoryCode}-${String(num).padStart(6, '0')}`;
  },

  generatePassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let pw = '';
    for (let i = 0; i < 8; i++) pw += chars[Math.floor(Math.random() * chars.length)];
    return pw;
  },
};

// ═══ Menu Manager — Per-shop item management ═══
const MenuManager = {
  getMenu(shopId) {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEYS.MENU_PREFIX + shopId)) || [];
    } catch { return []; }
  },

  saveMenu(shopId, items) {
    localStorage.setItem(STORE_KEYS.MENU_PREFIX + shopId, JSON.stringify(items));
  },

  addItem(shopId, item) {
    const menu = this.getMenu(shopId);
    if (!item.code) item.code = this.generateItemCode(item.name, menu);
    item.available = item.available !== false;
    item.addedAt = new Date().toISOString();
    menu.push(item);
    this.saveMenu(shopId, menu);
    return item;
  },

  removeItem(shopId, code) {
    const menu = this.getMenu(shopId).filter(i => i.code !== code);
    this.saveMenu(shopId, menu);
  },

  toggleItem(shopId, code) {
    const menu = this.getMenu(shopId);
    const item = menu.find(i => i.code === code);
    if (item) {
      item.available = !item.available;
      this.saveMenu(shopId, menu);
    }
    return item;
  },

  updateItem(shopId, code, updates) {
    const menu = this.getMenu(shopId);
    const item = menu.find(i => i.code === code);
    if (item) {
      Object.assign(item, updates);
      this.saveMenu(shopId, menu);
    }
  },

  getAvailableItems(shopId) {
    return this.getMenu(shopId).filter(i => i.available);
  },

  // Generate unique 2-char item code from name
  generateItemCode(name, existingMenu) {
    existingMenu = existingMenu || [];
    const existingCodes = new Set(existingMenu.map(i => i.code));
    // Try first 2 consonants uppercase
    const clean = name.replace(/[^a-zA-Z]/g, '').toUpperCase();
    const consonants = clean.replace(/[AEIOU]/g, '');
    let code = consonants.length >= 2 ? consonants.slice(0, 2) : clean.slice(0, 2);
    if (!existingCodes.has(code) && code.length === 2) return code;
    // Try first letter + last letter
    code = clean[0] + clean[clean.length - 1];
    if (!existingCodes.has(code) && code.length === 2) return code;
    // Generate sequential: A1, A2, ... Z9
    for (let c = 65; c <= 90; c++) {
      for (let n = 1; n <= 9; n++) {
        code = String.fromCharCode(c) + n;
        if (!existingCodes.has(code)) return code;
      }
    }
    return 'XX';
  },

  getItemByCode(shopId, code) {
    return this.getMenu(shopId).find(i => i.code === code) || null;
  },
};

// ═══ Order Packet — Build & Decode compressed order codes ═══
const OrderPacket = {
  // Build an order packet from cart items
  // items: [{ code: 'BG', qty: 2 }, { code: 'TH', qty: 1 }]
  build(blockCode, shopId, items, confidence, lat, lng) {
    const now = new Date();
    const time = now.toLocaleTimeString('en-IN', { hour12: false });
    // Encode items as CODE+QTY pairs: "BG2TH1CD1"
    const itemStr = items.map(i => `${i.code}${i.qty}`).join('');
    const packet = `${blockCode}|${itemStr}|${time}|conf:${confidence}`;
    return {
      id: `ORD-${Date.now()}`,
      packet,
      blockCode,
      shopId,
      items: items.map(i => ({ ...i })),
      confidence,
      lat, lng,
      timestamp: now.toISOString(),
      timeStr: time,
      itemStr,
      transmission: NetworkDetector.isOnline()
        ? TRANSMISSION_METHODS.find(t => t.code === 'Data')
        : TRANSMISSION_METHODS.find(t => t.code === 'SMS'),
      fulfilled: false,
      cancelledByUser: false,
      fulfilledAt: null,
      pickupPin: Math.floor(1000 + Math.random() * 9000).toString(),
    };
  },

  // Decode a packet string back to structured data
  decode(packetStr) {
    if (!packetStr) return { valid: false, error: 'Empty packet' };
    const parts = packetStr.split('|');
    if (parts.length < 3) return { valid: false, error: 'Invalid format' };

    const blockCode = parts[0];
    const itemStr = parts[1];
    const time = parts[2];
    const confStr = parts[3] || '';
    const confidence = parseInt(confStr.replace('conf:', '')) || 0;

    // Parse items: "BG2TH1CD1" → [{code:'BG', qty:2}, ...]
    const items = [];
    const regex = /([A-Z][A-Z0-9])(\d)/g;
    let match;
    while ((match = regex.exec(itemStr)) !== null) {
      items.push({ code: match[1], qty: parseInt(match[2]) });
    }

    return {
      valid: true,
      blockCode,
      items,
      itemStr,
      time,
      confidence,
    };
  },

  // Encode to compact 8-char code (like SOS block code but for orders)
  // Format: LOCATION(5) + ITEM_HASH(2) + CHECKSUM(1)
  encodeCompact(lat, lng, items) {
    const grid = BlockRegistry.getGridCell(lat, lng);
    const relRow = Math.max(0, grid.gridRow - INDIA_ROW_BASE);
    const relCol = Math.max(0, grid.gridCol - INDIA_COL_BASE);
    const rowCode = BlockCodeEncoder._toBase36(relRow, 3);
    const colCode = BlockCodeEncoder._toBase36(relCol, 2);
    // Item hash: sum of item codes * qty mod 36^2
    let itemHash = 0;
    items.forEach(i => {
      const c1 = BASE36.indexOf(i.code[0].toUpperCase()) || 0;
      const c2 = BASE36.indexOf(i.code[1].toUpperCase()) || 0;
      itemHash = (itemHash + (c1 * 36 + c2) * i.qty) % 1296;
    });
    const itemCode = BlockCodeEncoder._toBase36(itemHash, 2);
    const body = rowCode + colCode + itemCode;
    return body + BlockCodeEncoder._checksum(body);
  },

  // Decode compact 8-char order code
  decodeCompact(code) {
    if (!code || code.length < 8) return { valid: false, error: 'Code must be 8 characters' };
    code = code.toUpperCase().replace(/[^0-9A-Z]/g, '');
    if (code.length !== 8) return { valid: false, error: 'Invalid characters' };

    const body = code.substring(0, 7);
    const checkChar = code[7];
    if (BlockCodeEncoder._checksum(body) !== checkChar) {
      return { valid: false, error: 'Invalid checksum — check for typos' };
    }

    const rowCode = code.substring(0, 3);
    const colCode = code.substring(3, 5);
    const relRow = BlockCodeEncoder._fromBase36(rowCode);
    const relCol = BlockCodeEncoder._fromBase36(colCode);
    const gridRow = relRow + INDIA_ROW_BASE;
    const gridCol = relCol + INDIA_COL_BASE;
    const center = BlockRegistry.getCellCenter(gridRow, gridCol);

    return {
      valid: true,
      lat: center.lat,
      lng: center.lng,
      gridRow, gridCol,
      blockId: `BLK-${gridRow}-${gridCol}`,
      fullCode: code,
    };
  },
};

// ═══ Order Store — CRUD for orders ═══
const OrderStore = {
  getAll() { return Store.get(STORE_KEYS.ORDERS); },

  saveOrder(order) {
    const list = this.getAll();
    list.unshift(order);
    Store.set(STORE_KEYS.ORDERS, list);
  },

  updateOrder(id, updates) {
    const list = this.getAll();
    const idx = list.findIndex(o => o.id === id);
    if (idx >= 0) {
      Object.assign(list[idx], updates);
      Store.set(STORE_KEYS.ORDERS, list);
    }
  },

  getByShop(shopId) {
    return this.getAll().filter(o => o.shopId === shopId);
  },

  getActiveByShop(shopId) {
    return this.getByShop(shopId).filter(o => !o.fulfilled && !o.cancelledByUser);
  },

  getStats() {
    const all = this.getAll();
    const now = new Date();
    const today = now.toDateString();
    return {
      total: all.length,
      today: all.filter(o => new Date(o.timestamp).toDateString() === today).length,
      fulfilled: all.filter(o => o.fulfilled).length,
      cancelled: all.filter(o => o.cancelledByUser).length,
      active: all.filter(o => !o.fulfilled && !o.cancelledByUser).length,
    };
  },
};

// Init network detector
NetworkDetector.init();

