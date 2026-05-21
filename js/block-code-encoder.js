// ═══ Block Code Encoder/Decoder — Offline Emergency Location ═══
// Format: RR-NNN-TTT (Region 2 + Block 3 + Type 3) — max 15 chars
// Designed for SMS, voice, and low-bandwidth transmission.
// No internet required — pure coordinate math.

const BlockCodeEncoder = {
  // ── Region Grid: India divided into ~50 lat/lng buckets ──
  // Each region is a 2-char code derived from lat/lng
  _REGION_CODES: [
    'AA','AB','AC','AD','AE','AF','AG','AH','AI','AJ',
    'BA','BB','BC','BD','BE','BF','BG','BH','BI','BJ',
    'CA','CB','CC','CD','CE','CF','CG','CH','CI','CJ',
    'DA','DB','DC','DD','DE','DF','DG','DH','DI','DJ',
    'EA','EB','EC','ED','EE','EF','EG','EH','EI','EJ'
  ],

  // India bounding box (approximate)
  _LAT_MIN: 6.0,
  _LAT_MAX: 37.0,
  _LNG_MIN: 68.0,
  _LNG_MAX: 98.0,
  _LAT_DIVISIONS: 10,
  _LNG_DIVISIONS: 5,

  // Emergency type codes (matches EMERGENCY_TYPES in data.js)
  _TYPE_CODES: {
    'ACC': 'ACC', // Accident
    'MED': 'MED', // Medical Emergency
    'TYR': 'TYR', // Tyre Puncture
    'FUL': 'FUL', // Out of Fuel
    'TOW': 'TOW', // Tow Required
    'FIR': 'FIR', // Fire
    'SOS': 'SOS', // Generic SOS
    'TRP': 'TRP', // Trapped
    'CAR': 'CAR', // Cardiac
    'BLD': 'BLD', // Bleeding
  },

  /**
   * Encode lat/lng + emergency type into a short block code.
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {string} type - Emergency type code (ACC, MED, etc.)
   * @returns {string} Block code in format "RR-NNN-TTT" (max 15 chars)
   */
  encode(lat, lng, type) {
    // Clamp coordinates to India bounds
    lat = Math.max(this._LAT_MIN, Math.min(this._LAT_MAX, lat));
    lng = Math.max(this._LNG_MIN, Math.min(this._LNG_MAX, lng));

    // Calculate region index (row * cols + col)
    const latStep = (this._LAT_MAX - this._LAT_MIN) / this._LAT_DIVISIONS;
    const lngStep = (this._LNG_MAX - this._LNG_MIN) / this._LNG_DIVISIONS;
    const latIdx = Math.min(this._LAT_DIVISIONS - 1, Math.floor((lat - this._LAT_MIN) / latStep));
    const lngIdx = Math.min(this._LNG_DIVISIONS - 1, Math.floor((lng - this._LNG_MIN) / lngStep));
    const regionIdx = latIdx * this._LNG_DIVISIONS + lngIdx;
    const regionCode = this._REGION_CODES[regionIdx] || 'XX';

    // Calculate block number (0-999) from fractional position within region
    const latFrac = ((lat - this._LAT_MIN) % latStep) / latStep;
    const lngFrac = ((lng - this._LNG_MIN) % lngStep) / lngStep;
    // Combine into a single block number using interleaved bits
    const latBlock = Math.floor(latFrac * 32); // 5 bits (0-31)
    const lngBlock = Math.floor(lngFrac * 32); // 5 bits (0-31)
    const blockNum = latBlock * 32 + lngBlock;  // 0-1023, cap at 999
    const blockCode = String(Math.min(999, blockNum)).padStart(3, '0');

    // Type code (3 chars)
    const typeCode = this._TYPE_CODES[type] || type?.substring(0, 3)?.toUpperCase() || 'SOS';

    return `${regionCode}-${blockCode}-${typeCode}`;
  },

  /**
   * Decode a block code back to approximate lat/lng + type.
   * @param {string} code - Block code in format "RR-NNN-TTT"
   * @returns {object|null} {lat, lng, type, region, accuracy_km} or null if invalid
   */
  decode(code) {
    if (!code || typeof code !== 'string') return null;
    const parts = code.toUpperCase().trim().split('-');
    if (parts.length !== 3) return null;

    const [regionCode, blockStr, typeCode] = parts;

    // Find region index
    const regionIdx = this._REGION_CODES.indexOf(regionCode);
    if (regionIdx < 0) return null;

    // Calculate region lat/lng bounds
    const latStep = (this._LAT_MAX - this._LAT_MIN) / this._LAT_DIVISIONS;
    const lngStep = (this._LNG_MAX - this._LNG_MIN) / this._LNG_DIVISIONS;
    const latIdx = Math.floor(regionIdx / this._LNG_DIVISIONS);
    const lngIdx = regionIdx % this._LNG_DIVISIONS;
    const regionLatMin = this._LAT_MIN + latIdx * latStep;
    const regionLngMin = this._LNG_MIN + lngIdx * lngStep;

    // Decode block number back to position within region
    const blockNum = parseInt(blockStr, 10);
    if (isNaN(blockNum)) return null;
    const latBlock = Math.floor(blockNum / 32);
    const lngBlock = blockNum % 32;
    const latFrac = (latBlock + 0.5) / 32; // Center of block
    const lngFrac = (lngBlock + 0.5) / 32;

    const lat = regionLatMin + latFrac * latStep;
    const lng = regionLngMin + lngFrac * lngStep;

    // Accuracy: each block covers ~(latStep/32) degrees ≈ ~10km
    const accuracy_km = Math.round((latStep / 32) * 111); // ~111km per degree

    return {
      lat: Math.round(lat * 10000) / 10000,
      lng: Math.round(lng * 10000) / 10000,
      type: typeCode,
      region: regionCode,
      block: blockNum,
      accuracy_km,
      decoded: true,
    };
  },

  /**
   * Generate a human-readable emergency SMS message with block code.
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {string} type - Emergency type code
   * @param {string} priority - Priority level (P1-P4)
   * @param {string} conditions - Comma-separated condition labels
   * @returns {string} SMS-ready message
   */
  buildSMSMessage(lat, lng, type, priority, conditions) {
    const code = this.encode(lat, lng, type);
    const time = new Date().toLocaleTimeString('en-IN', { hour12: false });
    const coords = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    const mapLink = `https://maps.google.com/?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
    return `🆘 EMERGENCY SOS\nCode: ${code}\nPriority: ${priority}\nCoords: ${coords}\nTime: ${time}\nInjuries: ${conditions || 'Unknown'}\nMap: ${mapLink}`;
  },

  /**
   * Generate SMS URI for native app pre-fill.
   * @param {string} phoneNumber - Target phone number (e.g., '112')
   * @param {string} message - SMS body
   * @returns {string} sms: URI
   */
  buildSMSUri(phoneNumber, message) {
    // Use body= param (works on Android and iOS)
    return `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
  },

  /**
   * Validate a block code format (supports both 11-char and 15-char).
   * @param {string} code - Code to validate
   * @returns {boolean}
   */
  isValid(code) {
    if (!code || typeof code !== 'string') return false;
    const upper = code.toUpperCase().trim();
    // Match RR-NNN-TTT or RR-NNN-TTT-RRRR
    return /^[A-Z]{2}-\d{3}-[A-Z]{3}(-[A-Z]{4})?$/.test(upper);
  },

  // ═══ REASON-ENHANCED ENCODING (15-char format) ═══

  /**
   * Reason codes for auto-SOS triggers.
   */
  _REASON_CODES: {
    'NRSP': 'No Response',
    'STAT': 'Stationary too long',
    'GOFF': 'GPS turned off',
    'FALL': 'Fall detected',
    'MANU': 'Manual SOS',
    'AUTO': 'Auto-triggered',
  },

  /**
   * Encode lat/lng + type + reason into 15-char block code.
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {string} type - Emergency type code (ACC, MED, SOS, etc.)
   * @param {string} reason - 4-char reason code (GOFF, STAT, NRSP, etc.)
   * @returns {string} Block code "RR-NNN-TTT-RRRR" (max 15 chars)
   */
  encodeWithReason(lat, lng, type, reason) {
    const base = this.encode(lat, lng, type);
    const reasonCode = (reason || 'AUTO').substring(0, 4).toUpperCase().padEnd(4, 'X');
    return `${base}-${reasonCode}`;
  },

  /**
   * Decode a 15-char block code back to lat/lng + type + reason.
   * Also handles legacy 11-char codes (no reason).
   * @param {string} code - Block code "RR-NNN-TTT" or "RR-NNN-TTT-RRRR"
   * @returns {object|null} {lat, lng, type, reason, reasonLabel, ...} or null
   */
  decodeWithReason(code) {
    if (!code || typeof code !== 'string') return null;
    const parts = code.toUpperCase().trim().split('-');
    if (parts.length < 3 || parts.length > 4) return null;

    // Decode base location (first 3 parts)
    const baseCode = parts.slice(0, 3).join('-');
    const decoded = this.decode(baseCode);
    if (!decoded) return null;

    // Add reason if present
    if (parts.length === 4) {
      decoded.reason = parts[3];
      decoded.reasonLabel = this._REASON_CODES[parts[3]] || parts[3];
    } else {
      decoded.reason = null;
      decoded.reasonLabel = 'Unknown';
    }
    decoded.fullCode = code.toUpperCase().trim();
    return decoded;
  },

  /**
   * Generate a block code using offline estimated position.
   * Uses last known GPS + community/driver averages when GPS is off.
   * @param {string} type - Emergency type code
   * @param {string} reason - Reason code
   * @returns {string} Block code (best-effort position)
   */
  getOfflineEstimatedCode(type, reason) {
    let lat = 0, lng = 0;

    // Try GPSTracker's estimated position (dead reckoning)
    if (typeof GPSTracker !== 'undefined') {
      const estimated = GPSTracker.getEstimatedPosition();
      if (estimated) { lat = estimated.lat; lng = estimated.lng; }

      // Fallback to last known position
      if (lat === 0 && GPSTracker.lastPosition) {
        lat = GPSTracker.lastPosition.lat;
        lng = GPSTracker.lastPosition.lng;
      }

      // Fallback to last online position
      if (lat === 0 && GPSTracker.lastOnlinePosition) {
        lat = GPSTracker.lastOnlinePosition.lat;
        lng = GPSTracker.lastOnlinePosition.lng;
      }
    }

    // Last resort: use stored position from localStorage
    if (lat === 0) {
      try {
        const saved = JSON.parse(localStorage.getItem('apara_last_known_pos'));
        if (saved) { lat = saved.lat; lng = saved.lng; }
      } catch (e) { /* ignore */ }
    }

    if (lat === 0) return `XX-000-${(type || 'SOS').substring(0,3)}-${(reason || 'AUTO').substring(0,4)}`;
    return this.encodeWithReason(lat, lng, type || 'SOS', reason || 'AUTO');
  },
};
