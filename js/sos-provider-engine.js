// ═══ SOS Provider Engine — Emergency Dispatch System ═══
// Handles incoming SOS packets, provider matching, and priority dispatch.
// Uses Store.getProviders() from data.js — no separate cache needed.
// Reuses BlockCodeEncoder for location decoding.

const SOSProviderEngine = {
  // ── Active emergency queue (in-memory) ──
  _activeEmergencies: [],
  _listeners: [],
  _maxCache: 50,

  /**
   * Receive and process an incoming SOS packet.
   * @param {object} sosPacket - SOS packet from SOSPacket.build()
   * @returns {object} Processed emergency with matched providers
   */
  receiveEmergency(sosPacket) {
    const emergency = {
      ...sosPacket,
      receivedAt: Date.now(),
      status: 'active', // active, dispatched, resolved
      matchedProviders: [],
      dispatchedTo: null,
    };

    // Decode block code if available
    if (sosPacket.blockCode && typeof BlockCodeEncoder !== 'undefined') {
      const decoded = BlockCodeEncoder.decode(sosPacket.blockCode);
      if (decoded) {
        emergency.decodedLocation = decoded;
        // Use decoded lat/lng if packet doesn't have them
        if (!emergency.lat) emergency.lat = decoded.lat;
        if (!emergency.lng) emergency.lng = decoded.lng;
      }
    }

    // Find nearest providers
    if (emergency.lat && emergency.lng) {
      emergency.matchedProviders = this.getNearestProviders(
        emergency.lat, emergency.lng, 100
      );
      // Auto-sort by priority
      if (emergency.matchedProviders.length > 0) {
        emergency.matchedProviders = this.priorityDispatch(
          emergency.matchedProviders,
          sosPacket.priority || 'P2'
        );
      }
    }

    // Add to active queue
    this._activeEmergencies.unshift(emergency);
    if (this._activeEmergencies.length > this._maxCache) {
      this._activeEmergencies.pop();
    }

    // Save to localStorage for persistence
    this._saveToLocal();

    // Notify listeners
    this._notify('new_emergency', emergency);

    console.log(`[SOSProvider] Emergency received: ${sosPacket.id} | ${sosPacket.blockCode} | ${emergency.matchedProviders.length} providers matched`);
    return emergency;
  },

  /**
   * Decode a block code and return location info.
   * @param {string} code - Block code (RR-NNN-TTT)
   * @returns {object|null} Decoded location or null
   */
  decodeBlockCode(code) {
    if (typeof BlockCodeEncoder === 'undefined') {
      console.warn('[SOSProvider] BlockCodeEncoder not loaded');
      return null;
    }
    return BlockCodeEncoder.decode(code);
  },

  /**
   * Get nearest providers within a radius.
   * Uses existing Store.getProviders() from data.js.
   * @param {number} lat - Center latitude
   * @param {number} lng - Center longitude
   * @param {number} radiusKm - Search radius in km (default 100)
   * @returns {Array} Providers sorted by distance
   */
  getNearestProviders(lat, lng, radiusKm = 100) {
    const providers = typeof Store !== 'undefined' ? Store.getProviders() : [];
    if (providers.length === 0) return [];

    const results = [];
    providers.forEach(p => {
      if (!p.lat || !p.lng) return;
      if (p.status !== 'Active') return;

      const dist = this._haversineKm(lat, lng, p.lat, p.lng);
      if (dist <= radiusKm) {
        results.push({
          ...p,
          distanceKm: Math.round(dist * 10) / 10,
          etaMinutes: this._estimateETA(dist, p.category),
        });
      }
    });

    // Sort by distance
    results.sort((a, b) => a.distanceKm - b.distanceKm);
    return results;
  },

  /**
   * Priority dispatch — sort providers by distance + capability match.
   * @param {Array} providers - Matched providers
   * @param {string} severity - Priority level (P1-P4)
   * @returns {Array} Sorted providers with dispatch priority
   */
  priorityDispatch(providers, severity) {
    const priorityScores = { P1: 4, P2: 3, P3: 2, P4: 1 };
    const severityScore = priorityScores[severity] || 2;

    // Category priority for medical emergencies
    const catPriority = {
      'HOSP': 5, // Hospitals first for medical
      'PHAR': 3, // Pharmacies have medical supplies
      'MECH': 1, // Mechanics for vehicle issues
      'FUEL': 1,
      'TOW': 2,
      'PUNC': 1,
    };

    return providers.map(p => {
      let score = 100 - p.distanceKm; // Closer = higher score
      // Boost medical providers for high severity
      if (severityScore >= 3) {
        score += (catPriority[p.category] || 0) * 5;
      }
      return { ...p, dispatchScore: Math.round(score) };
    }).sort((a, b) => b.dispatchScore - a.dispatchScore);
  },

  /**
   * Mark an emergency as dispatched to a provider.
   * @param {string} emergencyId - SOS event ID
   * @param {string} providerId - Provider ID
   */
  dispatchTo(emergencyId, providerId) {
    const emg = this._activeEmergencies.find(e => e.id === emergencyId);
    if (emg) {
      emg.status = 'dispatched';
      emg.dispatchedTo = providerId;
      emg.dispatchedAt = new Date().toISOString();
      this._saveToLocal();
      this._notify('dispatched', emg);
    }
  },

  /**
   * Mark an emergency as resolved.
   * @param {string} emergencyId - SOS event ID
   */
  resolveEmergency(emergencyId) {
    const emg = this._activeEmergencies.find(e => e.id === emergencyId);
    if (emg) {
      emg.status = 'resolved';
      emg.resolvedAt = new Date().toISOString();
      this._saveToLocal();
      this._notify('resolved', emg);
    }
  },

  /**
   * Get all active (unresolved) emergencies.
   * @returns {Array}
   */
  getActiveEmergencies() {
    return this._activeEmergencies.filter(e => e.status === 'active' || e.status === 'dispatched');
  },

  /**
   * Get all emergencies (including resolved).
   * @returns {Array}
   */
  getAllEmergencies() {
    return [...this._activeEmergencies];
  },

  /**
   * Load emergencies from localStorage on init.
   */
  init() {
    try {
      const saved = JSON.parse(localStorage.getItem('apara_sos_dispatch_queue')) || [];
      this._activeEmergencies = saved;
    } catch (e) {
      this._activeEmergencies = [];
    }
    console.log(`[SOSProvider] Initialized with ${this._activeEmergencies.length} cached emergencies`);
  },

  // ── Internal helpers ──

  _saveToLocal() {
    try {
      localStorage.setItem('apara_sos_dispatch_queue', JSON.stringify(this._activeEmergencies));
    } catch (e) {
      console.warn('[SOSProvider] Failed to save to localStorage:', e);
    }
  },

  _haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  },

  _estimateETA(distKm, category) {
    // Rough ETA based on category and distance
    const speedKmh = category === 'HOSP' ? 60 : 40; // Ambulance faster
    return Math.round((distKm / speedKmh) * 60); // minutes
  },

  onChange(fn) { this._listeners.push(fn); },
  _notify(event, data) {
    this._listeners.forEach(fn => fn(event, data));
  },
};

// ── Offline Message Queue ──
// Stores SOS messages when offline, sends when reconnected.
const SOSMessageQueue = {
  _QUEUE_KEY: 'apara_sos_msg_queue',

  /**
   * Add a message to the offline queue.
   * @param {object} message - {type, payload, timestamp}
   */
  enqueue(message) {
    const queue = this.getQueue();
    queue.push({
      ...message,
      id: 'MSG-' + Date.now(),
      timestamp: Date.now(),
      status: 'pending',
    });
    localStorage.setItem(this._QUEUE_KEY, JSON.stringify(queue));
    console.log(`[MsgQueue] Enqueued: ${message.type} | Queue size: ${queue.length}`);
  },

  /**
   * Get all queued messages.
   * @returns {Array}
   */
  getQueue() {
    try {
      return JSON.parse(localStorage.getItem(this._QUEUE_KEY)) || [];
    } catch (e) {
      return [];
    }
  },

  /**
   * Get count of pending messages.
   * @returns {number}
   */
  getPendingCount() {
    return this.getQueue().filter(m => m.status === 'pending').length;
  },

  /**
   * Attempt to flush the queue (send all pending messages).
   * Called when internet reconnects.
   * @returns {number} Number of messages sent
   */
  flush() {
    if (typeof NetworkDetector !== 'undefined' && !NetworkDetector.isOnline()) {
      console.log('[MsgQueue] Still offline, skipping flush');
      return 0;
    }

    const queue = this.getQueue();
    let sent = 0;

    queue.forEach(msg => {
      if (msg.status === 'pending') {
        // Attempt to send via Firebase if available
        if (typeof FirebaseSync !== 'undefined' && FirebaseSync.isReady()) {
          try {
            // Push SOS event to Firebase
            if (msg.type === 'sos_alert' && msg.payload) {
              FirebaseSync.pushSOS && FirebaseSync.pushSOS(msg.payload);
              msg.status = 'sent';
              msg.sentAt = Date.now();
              sent++;
            }
          } catch (e) {
            console.warn('[MsgQueue] Firebase send failed:', e);
          }
        }
        // If no Firebase, mark as sent anyway (SMS was the primary channel)
        if (msg.status === 'pending' && msg.type === 'sms_prefill') {
          msg.status = 'sent';
          msg.sentAt = Date.now();
          sent++;
        }
      }
    });

    localStorage.setItem(this._QUEUE_KEY, JSON.stringify(queue));
    console.log(`[MsgQueue] Flushed: ${sent}/${queue.length} messages sent`);
    return sent;
  },

  /**
   * Clear the entire queue.
   */
  clear() {
    localStorage.removeItem(this._QUEUE_KEY);
  },
};

// Auto-init provider engine
if (typeof document !== 'undefined') {
  SOSProviderEngine.init();

  // Auto-flush message queue when coming back online
  if (typeof NetworkDetector !== 'undefined') {
    NetworkDetector.onChange((online) => {
      if (online) {
        setTimeout(() => SOSMessageQueue.flush(), 2000);
      }
    });
  }
}
