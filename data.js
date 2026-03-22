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
    // When offline, estimate using last known position + speed + time
    if (!this.lastOnlinePosition) return this.lastPosition;
    const elapsed = (Date.now() - this.lastOnlinePosition.timestamp) / 1000;
    const speed = this.lastOnlinePosition.speed || 0; // m/s
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
    };
  },

  _haversine(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  },

  onChange(fn) { this._listeners.push(fn); },
  _notify() { this._listeners.forEach(fn => fn(this.lastPosition)); },
};

// ═══ Block Code Resolver ═══
// Given a lat/lng, find which corridor/block the user is near
const BlockResolver = {
  // Find nearest corridor block for given coordinates
  resolve(lat, lng) {
    const corridors = Store.getCorridors();
    // For a real system, each block would have GPS boundaries.
    // Here we use a simplified linear mapping along corridors.
    // We estimate block based on distance from corridor start.
    // This is a placeholder that works with real GPS — in production,
    // each block would have precise start/end coordinates.
    let bestCorridor = corridors[0];
    let bestBlock = 1;
    let confidence = 70;

    // Simple mapping: use latitude to pick corridor region
    if (lat > 32) { bestCorridor = corridors.find(c => c.id === 'NH44-BAN') || corridors[0]; }
    else if (lat > 28) { bestCorridor = corridors.find(c => c.id === 'NH7-CDM') || corridors[0]; }
    else if (lat > 18) { bestCorridor = corridors.find(c => c.id === 'NH48-GHT') || corridors[0]; }
    else if (lat > 10) { bestCorridor = corridors.find(c => c.id === 'NH66-KNR') || corridors[0]; }
    else { bestCorridor = corridors[0]; }

    // Estimate block from longitude offset
    const blockLength = bestCorridor.length / bestCorridor.blocks;
    bestBlock = Math.max(1, Math.min(bestCorridor.blocks, Math.floor(((lng % 10) / 10) * bestCorridor.blocks) + 1));
    confidence = NetworkDetector.isOnline() ? 92 : 65;

    return {
      corridor: bestCorridor,
      block: bestBlock,
      blockCode: `${bestCorridor.code}-B${String(bestBlock).padStart(2, '0')}`,
      confidence,
    };
  },
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
    };
  },
};

// Init network detector
NetworkDetector.init();
