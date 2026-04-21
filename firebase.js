// ═══════════════════════════════════════════════════════════════════
// APARA — Firebase Sync Engine
// ═══════════════════════════════════════════════════════════════════
// PURPOSE:
//   1. Store provider/shop registrations in Firestore (admin writes)
//   2. Config Push versioning — drivers poll and download diffs
//   3. Block Registry — immutable blocks stored in Firestore
//   4. Transit Records — uploaded for dead-reckoning calculations
//   5. Zone Data — 100km radius provider/shop data downloaded to localStorage
//
// NOT USED FOR: SOS events (pure SMS), orders (pure SMS)
// ═══════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════
// ▶ PASTE YOUR FIREBASE CONFIG BELOW
// ════════════════════════════════════════════
const FIREBASE_CONFIG = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  // Optional: measurementId: ""
};

// ═══ Firebase Sync Manager ═══
const FirebaseSync = {
  _db: null,
  _app: null,
  _ready: false,
  _initPromise: null,

  // ─── Initialize Firebase ───
  init() {
    if (this._initPromise) return this._initPromise;
    this._initPromise = this._doInit();
    return this._initPromise;
  },

  async _doInit() {
    try {
      // Check if config is provided
      if (!FIREBASE_CONFIG.apiKey || !FIREBASE_CONFIG.projectId) {
        console.warn('[FirebaseSync] No config — running in localStorage-only mode');
        this._ready = false;
        return false;
      }

      // Check if Firebase SDK is loaded
      if (typeof firebase === 'undefined') {
        console.warn('[FirebaseSync] Firebase SDK not loaded — running offline');
        this._ready = false;
        return false;
      }

      // Initialize app (only once)
      if (!firebase.apps || firebase.apps.length === 0) {
        this._app = firebase.initializeApp(FIREBASE_CONFIG);
      } else {
        this._app = firebase.apps[0];
      }

      this._db = firebase.firestore();

      // Enable offline persistence for Firestore
      try {
        await this._db.enablePersistence({ synchronizeTabs: true });
        console.log('[FirebaseSync] Offline persistence enabled');
      } catch (err) {
        if (err.code === 'failed-precondition') {
          console.warn('[FirebaseSync] Persistence failed — multiple tabs open');
        } else if (err.code === 'unimplemented') {
          console.warn('[FirebaseSync] Persistence not supported in this browser');
        }
      }

      this._ready = true;
      console.log('[FirebaseSync] ✅ Initialized — project:', FIREBASE_CONFIG.projectId);
      return true;
    } catch (err) {
      console.error('[FirebaseSync] Init failed:', err);
      this._ready = false;
      return false;
    }
  },

  isReady() { return this._ready && this._db !== null; },

  // ═══════════════════════════════════════════
  // PROVIDERS — Admin writes, drivers read via zone download
  // ═══════════════════════════════════════════

  async pushProvider(provider) {
    if (!this.isReady()) return;
    try {
      await this._db.collection('providers').doc(provider.id).set({
        id: provider.id,
        name: provider.name,
        category: provider.category || null,
        phone: provider.phone,
        gps: provider.gps || null,
        status: provider.status || 'Active',
        available: provider.available !== false,
        corridorId: provider.corridorId || null,
        corridorName: provider.corridorName || null,
        registeredAt: provider.registeredAt || new Date().toISOString(),
        lastLogin: provider.lastLogin || null,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`[FirebaseSync] Provider pushed: ${provider.id}`);
    } catch (err) {
      console.error('[FirebaseSync] pushProvider failed:', err);
    }
  },

  async updateProvider(id, updates) {
    if (!this.isReady()) return;
    try {
      await this._db.collection('providers').doc(id).update({
        ...updates,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`[FirebaseSync] Provider updated: ${id}`);
    } catch (err) {
      console.error('[FirebaseSync] updateProvider failed:', err);
    }
  },

  async deleteProvider(id) {
    if (!this.isReady()) return;
    try {
      await this._db.collection('providers').doc(id).delete();
      console.log(`[FirebaseSync] Provider deleted: ${id}`);
    } catch (err) {
      console.error('[FirebaseSync] deleteProvider failed:', err);
    }
  },

  // Fetch ALL providers from Firestore (used by admin and zone builder)
  async fetchAllProviders() {
    if (!this.isReady()) return [];
    try {
      const snap = await this._db.collection('providers').get();
      return snap.docs.map(doc => doc.data());
    } catch (err) {
      console.error('[FirebaseSync] fetchAllProviders failed:', err);
      return [];
    }
  },

  // ═══════════════════════════════════════════
  // SHOPS — Admin writes, drivers read via zone download
  // ═══════════════════════════════════════════

  async pushShop(shop) {
    if (!this.isReady()) return;
    try {
      await this._db.collection('shops').doc(shop.id).set({
        id: shop.id,
        name: shop.name,
        category: shop.category || null,
        categoryCode: shop.categoryCode || '',
        owner: shop.owner || '',
        phone: shop.phone,
        gps: shop.gps || null,
        hours: shop.hours || '',
        status: shop.status || 'Active',
        corridorId: shop.corridorId || null,
        registeredAt: shop.registeredAt || new Date().toISOString(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`[FirebaseSync] Shop pushed: ${shop.id}`);
    } catch (err) {
      console.error('[FirebaseSync] pushShop failed:', err);
    }
  },

  async updateShop(id, updates) {
    if (!this.isReady()) return;
    try {
      await this._db.collection('shops').doc(id).update({
        ...updates,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`[FirebaseSync] Shop updated: ${id}`);
    } catch (err) {
      console.error('[FirebaseSync] updateShop failed:', err);
    }
  },

  async deleteShop(id) {
    if (!this.isReady()) return;
    try {
      await this._db.collection('shops').doc(id).delete();
      console.log(`[FirebaseSync] Shop deleted: ${id}`);
    } catch (err) {
      console.error('[FirebaseSync] deleteShop failed:', err);
    }
  },

  async fetchAllShops() {
    if (!this.isReady()) return [];
    try {
      const snap = await this._db.collection('shops').get();
      return snap.docs.map(doc => doc.data());
    } catch (err) {
      console.error('[FirebaseSync] fetchAllShops failed:', err);
      return [];
    }
  },

  // ═══════════════════════════════════════════
  // MENUS — Shop provider writes, drivers read via zone
  // ═══════════════════════════════════════════

  async pushMenu(shopId, items) {
    if (!this.isReady()) return;
    try {
      await this._db.collection('menus').doc(shopId).set({
        shopId,
        items: items || [],
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`[FirebaseSync] Menu pushed for shop: ${shopId}`);
    } catch (err) {
      console.error('[FirebaseSync] pushMenu failed:', err);
    }
  },

  async fetchMenu(shopId) {
    if (!this.isReady()) return null;
    try {
      const doc = await this._db.collection('menus').doc(shopId).get();
      return doc.exists ? doc.data() : null;
    } catch (err) {
      console.error('[FirebaseSync] fetchMenu failed:', err);
      return null;
    }
  },

  // ═══════════════════════════════════════════
  // CONFIG VERSION — Global version counter for push notifications
  // ═══════════════════════════════════════════

  async pushConfigVersion(version, changeInfo) {
    if (!this.isReady()) return;
    try {
      const configRef = this._db.collection('config').doc('apara_config');
      const doc = await configRef.get();
      const changelog = doc.exists ? (doc.data().changelog || []) : [];
      
      // Prepend new change, keep last 50
      changelog.unshift({
        version,
        action: changeInfo?.action || 'update',
        detail: changeInfo?.detail || '',
        timestamp: new Date().toISOString(),
      });
      if (changelog.length > 50) changelog.length = 50;

      await configRef.set({
        version,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
        changelog,
      });
      console.log(`[FirebaseSync] Config version pushed: v${version}`);
    } catch (err) {
      console.error('[FirebaseSync] pushConfigVersion failed:', err);
    }
  },

  async fetchConfigVersion() {
    if (!this.isReady()) return null;
    try {
      const doc = await this._db.collection('config').doc('apara_config').get();
      return doc.exists ? doc.data().version : null;
    } catch (err) {
      console.error('[FirebaseSync] fetchConfigVersion failed:', err);
      return null;
    }
  },

  // Poll config version — called by driver app every 30 min
  // Returns { changed: true/false, remoteVersion, localVersion }
  async pollConfigVersion() {
    if (!this.isReady()) return { changed: false };
    try {
      const remoteVersion = await this.fetchConfigVersion();
      if (remoteVersion === null) return { changed: false };
      const localVersion = parseInt(localStorage.getItem('apara_config_version') || '1');
      if (remoteVersion > localVersion) {
        console.log(`[FirebaseSync] Config version mismatch: local v${localVersion} < remote v${remoteVersion}`);
        return { changed: true, remoteVersion, localVersion };
      }
      return { changed: false, remoteVersion, localVersion };
    } catch (err) {
      return { changed: false };
    }
  },

  // ═══════════════════════════════════════════
  // ZONE DATA — 100km provider/shop data download
  // ═══════════════════════════════════════════
  // Drivers call this on login / when entering a new zone
  // Downloads ALL providers + shops from Firestore, filters by 100km radius,
  // stores in localStorage as zone cache

  async initDriverZone(lat, lng) {
    if (!this.isReady()) return null;
    try {
      console.log(`[FirebaseSync] Downloading zone data for ${lat.toFixed(2)}, ${lng.toFixed(2)}...`);

      // Fetch all providers and shops from Firestore
      const [providers, shops] = await Promise.all([
        this.fetchAllProviders(),
        this.fetchAllShops(),
      ]);

      if (providers.length === 0 && shops.length === 0) {
        console.log('[FirebaseSync] No providers/shops in Firestore yet');
        return null;
      }

      // Sync to localStorage so ZoneManager can pick them up
      // Merge with existing localStorage providers (don't overwrite local-only ones)
      const existingProviders = Store.getProviders();
      const existingIds = new Set(existingProviders.map(p => p.id));
      let added = 0;

      providers.forEach(p => {
        if (!existingIds.has(p.id)) {
          existingProviders.push(p);
          added++;
        } else {
          // Update existing with Firestore data (Firestore is source of truth)
          const idx = existingProviders.findIndex(ep => ep.id === p.id);
          if (idx >= 0) existingProviders[idx] = { ...existingProviders[idx], ...p };
        }
      });
      Store.set(STORE_KEYS.PROVIDERS, existingProviders);

      // Sync shops
      const existingShops = typeof ShopRegistry !== 'undefined' ? ShopRegistry.getShops() : [];
      const existingShopIds = new Set(existingShops.map(s => s.id));
      let shopsAdded = 0;

      shops.forEach(s => {
        if (!existingShopIds.has(s.id)) {
          existingShops.push(s);
          shopsAdded++;
        } else {
          const idx = existingShops.findIndex(es => es.id === s.id);
          if (idx >= 0) existingShops[idx] = { ...existingShops[idx], ...s };
        }
      });
      Store.set(STORE_KEYS.SHOPS, existingShops);

      // Update config version from Firestore
      const remoteVersion = await this.fetchConfigVersion();
      if (remoteVersion !== null) {
        localStorage.setItem('apara_config_version', String(remoteVersion));
      }

      // Now force ZoneManager to rebuild zone cache with new data
      if (typeof ZoneManager !== 'undefined') {
        const zoneId = ZoneManager.getZoneId(lat, lng);
        // Clear and reload zone
        localStorage.removeItem(STORE_KEYS.ZONE_PREFIX + zoneId);
        const idx = ZoneManager._getIndex();
        idx.zones = idx.zones.filter(z => z !== zoneId);
        ZoneManager._saveIndex(idx);
        ZoneManager.loadZone(zoneId, existingProviders);
      }

      console.log(`[FirebaseSync] Zone loaded: +${added} providers, +${shopsAdded} shops`);
      return { providersAdded: added, shopsAdded };
    } catch (err) {
      console.error('[FirebaseSync] initDriverZone failed:', err);
      return null;
    }
  },

  // Refresh all cached zones when config version changes
  async refreshOutdatedZones(newVersion) {
    if (!this.isReady()) return;
    try {
      const [providers, shops] = await Promise.all([
        this.fetchAllProviders(),
        this.fetchAllShops(),
      ]);

      // Update localStorage
      Store.set(STORE_KEYS.PROVIDERS, providers);
      if (typeof ShopRegistry !== 'undefined') {
        Store.set(STORE_KEYS.SHOPS, shops);
      }

      // Rebuild all cached zones
      if (typeof ZoneManager !== 'undefined') {
        const zoneIds = ZoneManager.getCachedZoneIds();
        zoneIds.forEach(zId => {
          localStorage.removeItem(STORE_KEYS.ZONE_PREFIX + zId);
        });
        const idx = ZoneManager._getIndex();
        idx.zones = [];
        ZoneManager._saveIndex(idx);

        // Reload current zone
        if (ZoneManager._currentZoneId) {
          ZoneManager.loadZone(ZoneManager._currentZoneId, providers);
        }
      }

      // Save new version
      localStorage.setItem('apara_config_version', String(newVersion));
      console.log(`[FirebaseSync] Zones refreshed to v${newVersion}: ${providers.length} providers, ${shops.length} shops`);
    } catch (err) {
      console.error('[FirebaseSync] refreshOutdatedZones failed:', err);
    }
  },

  // ═══════════════════════════════════════════
  // BLOCK REGISTRY — Immutable blocks stored in Firestore
  // ═══════════════════════════════════════════

  async pushBlock(block) {
    if (!this.isReady()) return;
    try {
      // Blocks are immutable — only create, never update
      const docRef = this._db.collection('block_registry').doc(block.id);
      const existing = await docRef.get();
      if (existing.exists) return; // Already exists — immutable, skip

      await docRef.set({
        id: block.id,
        gridRow: block.gridRow,
        gridCol: block.gridCol,
        centerLat: block.centerLat,
        centerLng: block.centerLng,
        sizeMeter: block.sizeMeter || 1000,
        createdAt: block.createdAt || new Date().toISOString(),
        createdBy: block.createdBy || 'unknown',
        source: block.source || 'gps',
        locked: true,
      });
      console.log(`[FirebaseSync] Block pushed: ${block.id}`);
    } catch (err) {
      console.error('[FirebaseSync] pushBlock failed:', err);
    }
  },

  // Batch push blocks (for 15-day sync)
  async pushBlocks(blocks) {
    if (!this.isReady()) return;
    try {
      const batch = this._db.batch();
      let count = 0;
      const blockArray = Array.isArray(blocks) ? blocks : Object.values(blocks);

      for (const block of blockArray) {
        const docRef = this._db.collection('block_registry').doc(block.id || `BLK-${block.gridRow || 0}-${block.gridCol || 0}`);
        batch.set(docRef, {
          id: block.id || docRef.id,
          gridRow: block.gridRow || 0,
          gridCol: block.gridCol || 0,
          centerLat: block.centerLat || block.la || 0,
          centerLng: block.centerLng || block.ln || 0,
          sizeMeter: block.sizeMeter || 1000,
          createdAt: block.createdAt || block.cr || new Date().toISOString(),
          createdBy: block.createdBy || 'batch',
          source: block.source || (block.src === 'G' ? 'gps' : 'offline_retrogenerated'),
          locked: true,
        }, { merge: true }); // merge: true = don't overwrite if exists
        count++;
        // Firestore batch limit is 500
        if (count >= 499) break;
      }

      await batch.commit();
      console.log(`[FirebaseSync] Batch pushed ${count} blocks`);
    } catch (err) {
      console.error('[FirebaseSync] pushBlocks failed:', err);
    }
  },

  // Download community blocks for a zone (100km radius)
  async fetchBlocksForZone(lat, lng, radiusM) {
    if (!this.isReady()) return [];
    try {
      // Firestore doesn't support geo queries natively, so we fetch
      // blocks within a lat/lng bounding box
      radiusM = radiusM || 100000; // 100km default
      const latDelta = radiusM / 111320;
      const lngDelta = radiusM / (111320 * Math.cos((lat * Math.PI) / 180));

      const snap = await this._db.collection('block_registry')
        .where('centerLat', '>=', lat - latDelta)
        .where('centerLat', '<=', lat + latDelta)
        .get();

      // Filter by longitude in client (Firestore allows only one range query)
      const blocks = snap.docs
        .map(doc => doc.data())
        .filter(b => b.centerLng >= lng - lngDelta && b.centerLng <= lng + lngDelta);

      console.log(`[FirebaseSync] Fetched ${blocks.length} community blocks for zone`);
      return blocks;
    } catch (err) {
      console.error('[FirebaseSync] fetchBlocksForZone failed:', err);
      return [];
    }
  },

  // ═══════════════════════════════════════════
  // TRANSIT RECORDS — For dead-reckoning calculations
  // ═══════════════════════════════════════════

  async pushTransitRecords(records) {
    if (!this.isReady()) return;
    try {
      const batch = this._db.batch();
      let count = 0;

      for (const rec of records) {
        const docRef = this._db.collection('transit_log').doc();
        batch.set(docRef, {
          type: rec.t === 'E' ? 'entry' : 'exit',
          blockId: rec.b,
          timestamp: rec.ts,
          speed: rec.s || 0,
          lat: rec.la || 0,
          lng: rec.ln || 0,
          uploadedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        count++;
        if (count >= 499) break;
      }

      await batch.commit();
      console.log(`[FirebaseSync] Pushed ${count} transit records`);
    } catch (err) {
      console.error('[FirebaseSync] pushTransitRecords failed:', err);
    }
  },

  // Fetch community transit data for dead-reckoning
  async fetchTransitsForZone(lat, lng, radiusM) {
    if (!this.isReady()) return [];
    try {
      radiusM = radiusM || 100000;
      const latDelta = radiusM / 111320;

      const snap = await this._db.collection('transit_log')
        .where('lat', '>=', lat - latDelta)
        .where('lat', '<=', lat + latDelta)
        .orderBy('lat')
        .limit(500)
        .get();

      const lngDelta = radiusM / (111320 * Math.cos((lat * Math.PI) / 180));
      return snap.docs
        .map(doc => doc.data())
        .filter(r => r.lng >= lng - lngDelta && r.lng <= lng + lngDelta);
    } catch (err) {
      console.error('[FirebaseSync] fetchTransitsForZone failed:', err);
      return [];
    }
  },

  // ═══════════════════════════════════════════
  // 15-DAY BATCH SYNC — Upload everything at once
  // ═══════════════════════════════════════════

  async uploadBatchTransit(driverId, payload) {
    if (!this.isReady()) return false;
    try {
      // 1. Push blocks
      if (payload.b && Object.keys(payload.b).length > 0) {
        const blocks = Object.entries(payload.b).map(([id, b]) => ({
          id,
          centerLat: b.la,
          centerLng: b.ln,
          createdAt: b.cr,
          source: b.src === 'G' ? 'gps' : 'offline_retrogenerated',
        }));
        await this.pushBlocks(blocks);
      }

      // 2. Push transit records
      if (payload.t && payload.t.length > 0) {
        // Split into batches of 499 (Firestore limit)
        for (let i = 0; i < payload.t.length; i += 499) {
          const chunk = payload.t.slice(i, i + 499);
          await this.pushTransitRecords(chunk);
        }
      }

      // 3. Record the batch upload itself
      await this._db.collection('batch_uploads').doc(`${driverId}_${Date.now()}`).set({
        driverId,
        uploadedAt: firebase.firestore.FieldValue.serverTimestamp(),
        blockCount: Object.keys(payload.b || {}).length,
        transitCount: (payload.t || []).length,
      });

      console.log(`[FirebaseSync] ✅ Batch upload complete: ${Object.keys(payload.b || {}).length} blocks, ${(payload.t || []).length} transits`);
      return true;
    } catch (err) {
      console.error('[FirebaseSync] uploadBatchTransit failed:', err);
      return false;
    }
  },

  // Download community data for merging into local dead-reckoning
  async downloadCommunityData(lat, lng) {
    if (!this.isReady()) return null;
    try {
      const [blocks, transits] = await Promise.all([
        this.fetchBlocksForZone(lat, lng, 100000),
        this.fetchTransitsForZone(lat, lng, 100000),
      ]);

      // Merge blocks into local BlockRegistry
      const localBlocks = Store.getObj(STORE_KEYS.BLOCK_REGISTRY);
      let newBlocks = 0;
      blocks.forEach(b => {
        if (!localBlocks[b.id]) {
          localBlocks[b.id] = {
            id: b.id,
            gridRow: b.gridRow,
            gridCol: b.gridCol,
            centerLat: b.centerLat,
            centerLng: b.centerLng,
            sizeMeter: b.sizeMeter || 1000,
            createdAt: b.createdAt,
            createdBy: b.createdBy || 'community',
            source: b.source || 'community',
            locked: true,
          };
          newBlocks++;
        }
      });
      Store.setObj(STORE_KEYS.BLOCK_REGISTRY, localBlocks);

      // Merge transit records for speed profiles
      if (transits.length > 0) {
        const existing = Store.get(STORE_KEYS.BLOCK_TRANSIT_LOG);
        const existingIds = new Set(existing.map(e => e.id));
        let newTransits = 0;
        transits.forEach(r => {
          const id = `COM-${r.blockId}-${r.timestamp}`;
          if (!existingIds.has(id)) {
            existing.push({
              id,
              type: r.type,
              blockId: r.blockId,
              timestamp: r.timestamp,
              speed: r.speed,
              lat: r.lat,
              lng: r.lng,
              driverId: 'community',
            });
            newTransits++;
          }
        });
        // Keep max 2000
        if (existing.length > 2000) existing.length = 2000;
        Store.set(STORE_KEYS.BLOCK_TRANSIT_LOG, existing);
        console.log(`[FirebaseSync] Merged ${newBlocks} blocks + ${newTransits} transits from community`);

        // Build community speed profiles for ETA calculations
        if (typeof SpeedEstimator !== 'undefined') {
          SpeedEstimator.buildCommunityProfiles(transits);
        }
      }

      return { newBlocks, transits: transits.length };
    } catch (err) {
      console.error('[FirebaseSync] downloadCommunityData failed:', err);
      return null;
    }
  },

  // ═══════════════════════════════════════════
  // DRIVERS — Register driver in Firestore
  // ═══════════════════════════════════════════

  async pushDriver(driver) {
    if (!this.isReady()) return;
    try {
      await this._db.collection('drivers').doc(driver.id).set({
        id: driver.id,
        mobile: driver.mobile,
        registeredAt: driver.registeredAt,
        lastLogin: driver.lastLogin,
        totalSessions: driver.totalSessions || 1,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    } catch (err) {
      console.error('[FirebaseSync] pushDriver failed:', err);
    }
  },

  // ═══════════════════════════════════════════
  // ADMIN SYNC — Full sync from localStorage to Firestore
  // ═══════════════════════════════════════════

  async fullAdminSync() {
    if (!this.isReady()) return { providers: 0, shops: 0 };
    try {
      const providers = Store.getProviders();
      const shops = typeof ShopRegistry !== 'undefined' ? ShopRegistry.getShops() : [];

      let pCount = 0, sCount = 0;

      // Push all providers
      for (const p of providers) {
        await this.pushProvider(p);
        pCount++;
      }

      // Push all shops
      for (const s of shops) {
        await this.pushShop(s);
        sCount++;
      }

      // Push all menus
      for (const s of shops) {
        const menu = typeof MenuManager !== 'undefined' ? MenuManager.getMenu(s.id) : [];
        if (menu.length > 0) {
          await this.pushMenu(s.id, menu);
        }
      }

      // Push config version
      const version = parseInt(localStorage.getItem('apara_config_version') || '1');
      await this.pushConfigVersion(version, { action: 'full_sync', detail: `${pCount} providers, ${sCount} shops` });

      console.log(`[FirebaseSync] Full admin sync: ${pCount} providers, ${sCount} shops`);
      return { providers: pCount, shops: sCount };
    } catch (err) {
      console.error('[FirebaseSync] fullAdminSync failed:', err);
      return { providers: 0, shops: 0 };
    }
  },
};
