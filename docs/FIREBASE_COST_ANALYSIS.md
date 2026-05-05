# APARA — Firebase Cost & Architecture Analysis

## Scale: 15,000 Providers/Shops · 100,000 Drivers

> Last Updated: April 29, 2026

---

## 1. What Does APARA Use Firebase For?

| Feature | Firebase Service | Purpose |
|---------|-----------------|---------|
| Provider/Shop registration | Firestore | Admin writes once |
| Menu management | Firestore | Shop writes, bundled into zone every 2 days |
| Config version push | **Realtime Database** | Instant push to all drivers (**FREE**) |
| Zone bundle download | Firestore | **ONE-TIME** download per driver per zone |
| Block registry | Firestore | Immutable GPS grid blocks |
| Transit batch upload | Firestore | **Single file** per driver every 15 days |
| Community speed profiles | Zone bundle | Pushed every 2 days via config |

---

## 2. How The System Works

```
┌──────────────────────────────────────────────────────────────┐
│                        DATA FLOW                             │
│                                                              │
│  ZONE BUNDLE = ONE-TIME DOWNLOAD                             │
│  ─────────────────────────────────────────────               │
│  Driver enters Zone Z-22-73 for first time                   │
│    → Downloads zone_bundles/Z-22-73 (1 Firestore read)       │
│    → Gets: providers + shops + menus + community speeds      │
│    → Saved to localStorage                                   │
│    → NEVER re-downloaded (unless driver clears cache)        │
│                                                              │
│  ALL CHANGES AFTER THAT = CONFIG PUSH (FREE)                 │
│  ─────────────────────────────────────────────               │
│  New provider registered?  → Config push via RTDB (FREE)     │
│  Shop opens/closes?        → Config push via RTDB (FREE)     │
│  New menu items added?     → Config push via RTDB (FREE)     │
│  Community speeds updated? → Config push via RTDB (FREE)     │
│                                                              │
│  Driver receives push → applies delta to localStorage        │
│  No Firestore read needed for these changes                  │
│                                                              │
│  ZONE FILE REBUILD (every 2 days by admin):                  │
│  ─────────────────────────────────────────────               │
│  Admin rebuilds zone bundles with latest:                    │
│    - All new registrations                                   │
│    - Updated menus                                           │
│    - Latest community speed averages                         │
│  Pushes config version → drivers DON'T re-download           │
│  Zone file only re-downloaded by NEW drivers entering zone   │
│                                                              │
│  TRANSIT UPLOAD (every 15 days per driver):                  │
│  ─────────────────────────────────────────────               │
│  Driver uploads SINGLE FILE with:                            │
│    - Block entries/exits + speeds                            │
│    - Feeds into community speed calculation                  │
│  = 1 Firestore write per driver per 15 days                  │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. What is Community Data?

Community data = **collective speed intelligence** from all drivers.

```
STEP 1 — COLLECTION (automatic, stored locally):
  Driver A → Block BLK-22-73 at 40 km/h  → saved in phone
  Driver B → Block BLK-22-73 at 50 km/h  → saved in phone
  Driver C → Block BLK-22-73 at 42 km/h  → saved in phone

STEP 2 — UPLOAD (every 15 days, single file per driver):
  Driver A uploads single transit file → 1 Firestore write
  Driver B uploads single transit file → 1 Firestore write
  Driver C uploads single transit file → 1 Firestore write

STEP 3 — CALCULATION (admin rebuilds zone bundles every 2 days):
  Admin calculates: BLK-22-73 avg = (40+50+42)/3 = 44 km/h
  Stored in zone_bundles/Z-22-73.communityProfiles

STEP 4 — DISTRIBUTION (config push, FREE):
  Admin pushes config version via RTDB
  Driver D receives push → checks if they have this zone
    → If YES: gets delta community speeds via config push (FREE)
    → If NEW to zone: downloads zone bundle (1 read, ONE-TIME)

Used for:
  ✅ ETA calculation: "12 min to Shop X at avg 44 km/h"
  ✅ Offline dead-reckoning: "GPS lost, estimating at 44 km/h"
```

### Speed Estimation Priority:

| Priority | Source | When Used |
|----------|--------|-----------|
| 1️⃣ | Live GPS speed | Moving with GPS on |
| 2️⃣ | Driver's own block history | Been to this block before |
| 3️⃣ | **Community average** | Other drivers' data available |
| 4️⃣ | Driver's overall average | Has general speed history |
| 5️⃣ | Default 30 km/h | No data at all |

---

## 4. Firebase Pricing

### Firestore (document read/write charges)
| Action | Price | Free Tier (Spark) |
|--------|-------|-------------------|
| Reads | $0.06 per 100K | 50,000/day |
| Writes | $0.18 per 100K | 20,000/day |
| Storage | $0.18 per GB/month | 1 GB |

### Realtime Database (bandwidth only — no per-read charge)
| Action | Price | Free Tier (Spark) |
|--------|-------|-------------------|
| **Data push** | **$0 per read** | **UNLIMITED** |
| Download bandwidth | $5 per GB | 10 GB/month |
| Storage | $5 per GB | 1 GB |
| Connections | $0 | 100 (Spark) / 200K (Blaze) |

> **Config push via RTDB = $0 per push.** Only bandwidth is charged.

---

## 5. Daily WRITES Breakdown (100K drivers, 15K shops/providers)

| Operation | Who | Frequency | Writes | Daily Total |
|-----------|-----|-----------|--------|-------------|
| New provider/shop registration | Admin | 50/day | 1 write (Firestore doc) | **50** |
| Shop menu update (new items) | Shop Owner | 1,500/day (10%) | 1 write (menu doc) | **1,500** |
| Zone bundle rebuild | Admin (every 2 days) | 50/day avg | 1 write per bundle | **50** |
| Transit batch upload (15-day) | Driver | 6,667/day | **1 write (single file)** | **6,667** |
| Shop open/close toggle | Shop | 500/day | 1 write (status doc) | **500** |
| Config push to RTDB | Admin/Shop | 20/day | RTDB write (FREE) | **0** ⭐ |
| | | | **TOTAL WRITES/DAY** | **8,767** |
| | | | **COST** | **$0.016/day** |

> ✅ **8,767 writes/day is well within the FREE tier of 20,000 writes/day!**

---

## 6. Daily READS Breakdown (100K drivers, 15K shops/providers)

| Operation | Who | Frequency | Reads | Daily Total |
|-----------|-----|-----------|-------|-------------|
| Config version listen | Driver | Always-on | **RTDB push = 0 reads** | **0** ⭐ |
| Zone bundle download (ONE-TIME) | New Driver | ~200 new zone entries/day | 1 read (single doc) | **200** |
| Zone refresh on config push | Driver | **NO re-download** (delta via RTDB) | 0 reads | **0** ⭐ |
| Community speed refresh (2-day) | Driver | **Pushed via config** | 0 reads | **0** ⭐ |
| Shop open/close update | Driver | **Pushed via config** | 0 reads | **0** ⭐ |
| New registration notification | Driver | **Pushed via config** | 0 reads | **0** ⭐ |
| Admin dashboard load | Admin | 10/day | ~100 reads | **1,000** |
| | | | **TOTAL READS/DAY** | **~1,200** |
| | | | **COST** | **$0.00072/day** |

> ✅ **1,200 reads/day is massively under the FREE tier of 50,000 reads/day!**

---

## 7. RTDB Bandwidth (Config Push)

All changes pushed via RTDB WebSocket (no Firestore reads):

| Push Type | Data Size | Pushes/Day | Listeners | Daily Bandwidth |
|-----------|-----------|------------|-----------|----------------|
| New registration | ~200 bytes | 50 | 100K drivers | **1 GB** |
| Shop open/close | ~80 bytes | 500 | 100K drivers | **4 GB** |
| Menu update notification | ~50 bytes | 20 | 100K drivers | **100 MB** |
| Community speed batch | ~500 bytes | 1 (every 2 days) | 100K drivers | **25 MB** |
| **DAILY TOTAL** | | | | **~5.1 GB** |
| **MONTHLY TOTAL** | | | | **~153 GB** |
| **COST** ($5/GB) | | | | **$765/month** ⚠️ |

### ⚠️ Optimization: Batch Config Pushes

Instead of pushing every individual change, batch them:

| Strategy | Pushes/Day | Monthly Bandwidth | Monthly Cost |
|----------|-----------|-------------------|-------------|
| ❌ Every change individually | 570 pushes | 153 GB | **$765** |
| ✅ Batch every 30 minutes | 48 pushes | ~24 GB | **$120** |
| ✅ Batch every 1 hour | 24 pushes | ~12 GB | **$60** |
| ✅ Batch every 2 hours | 12 pushes | ~6 GB | **$30** |
| ✅✅ Batch every 2 days (with zone rebuild) | 1 push | ~500 MB | **$2.50** |

> **Recommended**: Batch changes every 1-2 hours. Immediate config push only for critical events (new SOS provider). Result: **~$30-60/month**.

---

## 8. TOTAL Monthly Cost Summary

### With Hourly Batched Config Pushes:

| Service | Daily | Monthly |
|---------|-------|---------|
| Firestore Reads | $0.001 | **$0.03** |
| Firestore Writes | $0.016 | **$0.48** |
| Firestore Storage (~200 MB) | - | **$0.04** |
| RTDB Bandwidth (hourly batch) | $2 | **$60** |
| **TOTAL** | | **~$61/month** |

### With 2-Day Batched Config Pushes:

| Service | Daily | Monthly |
|---------|-------|---------|
| Firestore Reads | $0.001 | **$0.03** |
| Firestore Writes | $0.016 | **$0.48** |
| Firestore Storage (~200 MB) | - | **$0.04** |
| RTDB Bandwidth (2-day batch) | $0.08 | **$2.50** |
| **TOTAL** | | **~$3/month** |

---

## 9. Comparison: Before vs After

| | Before (Old Architecture) | After (Zone Bundle + RTDB Push) |
|--|--------------------------|-------------------------------|
| Zone entry | 20,000 Firestore reads per driver | **1 read (ONE-TIME)** |
| Config check | 288 Firestore reads/day per driver | **0 reads (RTDB push FREE)** |
| Community speeds | 1,000 Firestore reads per refresh | **0 reads (via config push)** |
| Shop status | Firestore poll | **0 reads (via config push)** |
| Transit upload | 100 writes per driver | **1 write (single file)** |
| **Monthly cost at 100K** | **$5,928/month** | **$3–61/month** |
| **Savings** | | **99.0% – 99.95%** |

---

## 10. Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    ADMIN PANEL                           │
│                                                          │
│  Register Provider/Shop                                  │
│    → 1 Firestore write (provider/shop doc)               │
│    → 1 RTDB push: { action: "new_provider", data: {...}} │
│    → All 100K drivers get instant notification (FREE)    │
│                                                          │
│  Rebuild Zone Bundles (every 2 days)                     │
│    → Aggregates all providers + shops + menus + speeds   │
│    → 1 Firestore write per zone bundle                   │
│    → 1 RTDB push: { action: "zone_rebuild", version: N } │
│    → New drivers entering zone get latest bundle         │
└─────────────────┬───────────────────────────────────────┘
                  │
                  │ RTDB WebSocket Push (FREE)
                  ↓
┌─────────────────────────────────────────────────────────┐
│                 100,000 DRIVERS                          │
│                                                          │
│  FIRST TIME entering zone:                               │
│    → fetchZoneBundle("Z-22-73") = 1 Firestore read       │
│    → Saved to localStorage permanently                   │
│                                                          │
│  AFTER THAT — all updates via RTDB push (FREE):          │
│    → New provider registered  → applied to localStorage  │
│    → Shop opened/closed       → applied to localStorage  │
│    → New menu items           → applied to localStorage  │
│    → Community speed update   → applied to localStorage  │
│                                                          │
│  EVERY 15 DAYS:                                          │
│    → Upload single transit file = 1 Firestore write      │
│    → Contains: block speeds for community calculation    │
│                                                          │
│  EVERYTHING WORKS OFFLINE from localStorage:             │
│    ✅ Marketplace map (shops + providers)                 │
│    ✅ SOS (nearest hospital/mechanic)                     │
│    ✅ ETA (community avg speed)                           │
│    ✅ Dead-reckoning (offline speed estimation)           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  SHOP OWNERS                             │
│                                                          │
│  Add new menu items → Sync to Cloud                      │
│    → 1 Firestore write (menu doc)                        │
│    → 1 RTDB push: { action: "menu_update", shopId: ... } │
│    → All drivers in zone get notification (FREE)         │
│    → Items appear in zone bundle on next 2-day rebuild   │
│                                                          │
│  Toggle Open/Close                                       │
│    → 1 Firestore write (status)                          │
│    → 1 RTDB push: { action: "shop_status", status: ... } │
│    → All drivers see status change instantly (FREE)      │
└─────────────────────────────────────────────────────────┘
```

---

## 11. Firebase Free Tier Compatibility

| Resource | Free Limit | Your Usage | Fits? |
|----------|-----------|------------|-------|
| Firestore Reads | 50,000/day | **~1,200/day** | ✅ YES |
| Firestore Writes | 20,000/day | **~8,767/day** | ✅ YES |
| Firestore Storage | 1 GB | ~200 MB | ✅ YES |
| RTDB Storage | 1 GB | ~1 KB | ✅ YES |
| RTDB Download | 10 GB/month | 0.5–12 GB/month | ⚠️ Depends on batching |
| RTDB Connections | 100 (Spark) | 100K (need Blaze) | ⚠️ Need Blaze at scale |

### Scale Thresholds:

| Drivers | Plan Needed | Estimated Cost |
|---------|------------|---------------|
| < 100 | Spark (FREE) | **$0/month** |
| 100 – 1,000 | Spark (FREE) | **$0/month** |
| 1,000 – 10,000 | Blaze (pay-as-you-go) | **$1–5/month** |
| 10,000 – 50,000 | Blaze | **$10–30/month** |
| 50,000 – 100,000 | Blaze | **$30–61/month** |

---

## 12. Setup Required

### Firebase Console:
1. **Firestore** — Already configured ✅
2. **Realtime Database** — Create:
   - Firebase Console → Build → Realtime Database → Create Database
   - Start in **test mode**
   - URL: `https://apara-c5959-default-rtdb.firebaseio.com`

### RTDB Security Rules (for production):
```json
{
  "rules": {
    "apara_config": {
      ".read": true,
      ".write": true
    }
  }
}
```

### Files Modified:
| File | Change |
|------|--------|
| `firebase-config.js` | Added `databaseURL` |
| `firebase.js` | RTDB init + `listenConfigVersion()` + zone bundles |
| `firebase_v2.js` | Same RTDB + zone bundle changes |
| `driver.html` | RTDB SDK + push listener (replaced polling) |
| `admin.html` | RTDB SDK + auto zone bundle building |
| `shop_provider.html` | RTDB SDK |
