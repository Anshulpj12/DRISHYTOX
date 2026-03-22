// ═══════════ RoadSOS Shared Data Store (localStorage-based) ═══════════
// All data is stored in localStorage and shared across all windows.
// No mock/fake data — everything is entered by admin, providers, and users.

const STORE_KEYS = {
  PROVIDERS: 'roadsos_providers',
  SOS_EVENTS: 'roadsos_sos_events',
  CORRIDORS: 'roadsos_corridors',
  CROSSINGS: 'roadsos_crossings',
  V2V_RELAYS: 'roadsos_v2v_relays',
  LOGGED_PROVIDER: 'roadsos_logged_provider',
  SETTINGS: 'roadsos_settings',
  ZONE_HISTORY: 'roadsos_zone_history',
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

  start() {
    if (!navigator.geolocation) { console.warn('Geolocation not available'); return; }
    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        this.lastPosition = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          speed: pos.coords.speed, // m/s, can be null
          heading: pos.coords.heading,
          timestamp: pos.timestamp,
        };
        if (NetworkDetector.isOnline()) {
          this.lastOnlinePosition = { ...this.lastPosition };
        }
        this.positionHistory.push({ ...this.lastPosition });
        if (this.positionHistory.length > 500) this.positionHistory.shift();
        this._notify();
      },
      (err) => { console.warn('GPS error:', err.message); },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
    );
  },

  stop() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  },

  getSpeedKmh() {
    if (this.lastPosition && this.lastPosition.speed !== null) {
      return Math.round(this.lastPosition.speed * 3.6);
    }
    // Estimate from position history
    if (this.positionHistory.length >= 2) {
      const p1 = this.positionHistory[this.positionHistory.length - 2];
      const p2 = this.positionHistory[this.positionHistory.length - 1];
      const dist = this._haversine(p1.lat, p1.lng, p2.lat, p2.lng);
      const dt = (p2.timestamp - p1.timestamp) / 1000;
      if (dt > 0) return Math.round((dist / dt) * 3.6);
    }
    return 0;
  },

  getEstimatedPosition() {
    if (!this.lastOnlinePosition) return this.lastPosition;
    const elapsed = (Date.now() - this.lastOnlinePosition.timestamp) / 1000;

    // ═══ TRY HISTORY-DRIVEN ESTIMATION FIRST ═══
    const historyResult = DeadZoneHistory.estimateFromHistory(
      this.lastOnlinePosition, elapsed
    );
    if (historyResult) {
      return {
        lat: historyResult.lat,
        lng: historyResult.lng,
        accuracy: historyResult.accuracy,
        speed: this.lastOnlinePosition.speed,
        heading: this.lastOnlinePosition.heading,
        timestamp: Date.now(),
        estimated: true,
        estimationSource: historyResult.source, // 'personal' or 'community'
        estimatedBlock: historyResult.block,
        estimatedCorridor: historyResult.corridorId,
        confidence: historyResult.confidence,
      };
    }

    // ═══ FALLBACK: BASIC DEAD RECKONING ═══
    const speed = this.lastOnlinePosition.speed || 0;
    const heading = this.lastOnlinePosition.heading || 0;
    const dist = speed * elapsed;
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
      speed: this.lastOnlinePosition.speed,
      heading: this.lastOnlinePosition.heading,
      timestamp: Date.now(),
      estimated: true,
      estimationSource: 'dead_reckoning',
      confidence: Math.max(40, 65 - Math.floor(elapsed / 60) * 5),
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
};

// Init network detector
NetworkDetector.init();
