# 🛡️ APARA — Complete Feature Documentation

> **Project:** APARA / APARA  
> **Purpose:** GPS-based emergency response platform for India's highway dead zones  
> **Tagline:** *Works where every other system fails*  
> **Built for:** National Road Safety Hackathon · IIT Madras · 2026  

---

## 📌 Overview

APARA is a fully offline-capable, browser-based emergency response system designed for India's 1,750 km of highway dead zones. It connects distressed drivers with verified service providers even in areas with zero mobile signal, using dead reckoning, V2V relay, and ultra-compressed SOS packets.

**The core problem it solves:**
| Statistic | Source |
|---|---|
| 1,750 km of confirmed dead zones across 424 highway locations | NHAI, Jan 2026 |
| 29,018 highway deaths in H1 2025 | TRAI / MoRTH |
| 60+ min average emergency wait time on remote stretches | NHAI Survey 2025 |
| 40–50% die at scene before help arrives in hilly regions | WHO Road Safety |

---

## 🏗️ System Architecture — Three-Window Ecosystem

The app is split into **4 HTML files** and **1 shared data file**:

```
index.html      → Landing / Info page
driver.html     → Driver Mobile App
provider.html   → Service Provider Dashboard
admin.html      → Admin Control Panel
data.js         → Shared localStorage data store
shared.css      → Global design system
```

All three apps share data through **`localStorage`** — no backend server is needed. The data flows:

```
Driver App ──→ localStorage ──→ Provider App
                   ↕
              Admin Panel
```

---

## 📄 Page 1 — Landing Page ([index.html](file:///c:/Users/anshul%20prajapati/OneDrive/Desktop/APARA/index.html))

### Purpose
Marketing/info homepage that explains the platform to the public.

### Features

#### 1. Hero Section
- Animated headline: *"Works where every other system fails"*
- Two CTA buttons: **Download App** (→ driver.html) and **Register as Provider** (→ provider.html)
- **Live animated counters** that count up on load:
  - SOS Events Resolved: **4,287**
  - Corridors Covered: **6**
  - Community Crossings: **18,472**

#### 2. Animated Road Strip
- Visual simulation of how the system works — blocks cycle through states:
  - 🟢 **Online** (GPS active, highlighted in cyan)
  - 🟡 **Dead zone** (signal lost, amber)
  - 🚨 **SOS** (flashing red block)
  - 📡 **V2V Relay** (purple relay vehicle)
  - 🟢 **Resolved** (restored)

#### 3. The Problem Section
- 4 statistics cards with large numbers and source citations
- Hover animation on each card

#### 4. How It Works — 7-Step Flow
1. 🟢 Online — GPS Tracking (history built silently, <120 bytes/crossing)
2. 🟡 Signal drops — Dead Reckoning activates
3. ⏸ Stop Detected — Accelerometer/OBD-II pauses block counter
4. 🚨 SOS Triggered — Ultra-compressed packet built (<50 bytes)
5. 📡 V2V Relay — Passing vehicles carry AES-256 encrypted packets via BLE
6. 🖥 Server Decodes — Provider matched by category + zone + availability
7. ✅ Provider Dispatched — ETA confirmed, event tracked until resolution

#### 5. Dead Zone Corridors Display
Renders corridor strip bars for 6 major Indian highways:
- NH44 Banihal Pass (J&K) — 84 km, 42 blocks
- Chenani-Nashri Tunnel (J&K) — 9.2 km, 18 blocks
- NH48 Western Ghats (Maharashtra) — 70 km, 35 blocks
- NH66 Kannur Stretch (Kerala) — 56 km, 28 blocks
- Char Dham Route (Uttarakhand) — 110 km, 55 blocks
- NH39 Northeast Corridor (Nagaland) — 76 km, 38 blocks

#### 6. Positioning Accuracy Table
| Tier | Data Source | Error @ 5 min | Error @ 30 min | Confidence |
|---|---|---|---|---|
| Tier 1 | Personal History + OBD-II | ±50m | ±300m | 90–97% |
| Tier 2 | Community Average + OBD-II | ±100m | ±600m | 80–92% |
| Tier 3 | Personal History + Phone Sensors | ±200m | ±1.2km | 65–85% |
| Tier 4 | Community Average + Phone Sensors | ±400m | ±2.5km | 50–75% |

#### 7. Technology Stack Diagram
`📱 Mobile App → 🔌 OBD-II/Sensors → 🧠 Offline Engine → 📡 V2V BLE/WiFi → 🖥 Server → 🚑 Provider`

#### 8. V2V Relay Explainer
Visual flowchart: Distressed Vehicle → BLE Broadcast → Passing Vehicle → Exits Dead Zone → Auto-Forwards → Server → Provider Dispatched

#### 9. Key Differentiators — 10 Cards
- Offline-First Positioning
- History-Driven Accuracy
- Stop-Aware (prevents position drift)
- V2V Encrypted Relay (AES-256)
- Verified Responders (admin-only registration)
- Ultra-Compressed Packets (<50 bytes)
- OBD-II Integration
- Block Code System (linear reference, not 2D maps)
- Community Network Effect
- Minimal Storage (120 bytes/crossing)

---

## 📱 Page 2 — Driver App ([driver.html](file:///c:/Users/anshul%20prajapati/OneDrive/Desktop/APARA/driver.html))

### Purpose
Mobile-optimized web app for drivers. Works offline after first GPS lock.

### App Structure
The app uses a **screen-switching** pattern (SPA-style). Screens:
1. **Login** (initial)
2. **Main App** (post-login) with 4 sub-screens:
   - Home / GPS
   - Block History
   - V2V Relay
   - Settings

---

### Feature A — Driver Login
- **Entry:** User enters their 10-digit mobile number
- **Processing:** `DriverRegistry.loginDriver(mobile)` hashes mobile to generate a unique, deterministic **Driver ID** (e.g., `DRV-A3F2B1`)
- **Session persistence:** Driver ID saved in `sessionStorage` — survives page refresh
- **Auto-restoration:** On reload, existing session is auto-detected and login is skipped
- **Sign-out:** Flushes all buffered data to localStorage before logging out

---

### Feature B — Home Screen / GPS Dashboard

#### GPS Permission Flow
1. App requests device GPS permission
2. If denied → falls back to **Fallback GPS Mode** (uses demo coordinates: 20.5937°N, 78.9629°E for India)
3. If granted → starts `GPSTracker.watchPosition()`

#### Live GPS Display
| Element | Description |
|---|---|
| Coordinates | Live lat/lng in degrees (e.g., `20.53421° N, 78.96120° E`) |
| Block Code | Current 1km block ID (e.g., `NH48-B32`), color: cyan (online) / amber (offline) |
| Speed | Real-time speed in km/h |
| Confidence Gauge | Semi-circular canvas gauge showing position confidence % |
| GPS Accuracy | GPS fix accuracy in meters (±Xm) |
| Heading | Compass heading in degrees |
| Blocks Explored | Count of unique 1km blocks visited |
| Relays | Total V2V packets relayed lifetime |
| Status Strip | Shows mode: 🟢 GPS Active / 🟡 Offline - Dead Reckoning |
| Mini Map | Leaflet.js OpenStreetMap showing current position with marker |
| Buffer Indicator | Shows pending blocks/transits queued for sync (updates every 5 min) |

#### Active SOS Banner
When an SOS is active, a **persistent red banner** appears on the home screen showing:
- SOS Code (packet string)
- Resolution PIN (4-digit PIN to give to provider)
- **SMS** button (pre-fills native SMS app with emergency details)
- **Copy** button (copies code to clipboard)
- **Cancel** button (driver can cancel their own SOS)

#### Offline Mode (Signal Lost)
When network is detected as offline:
1. `offlineLastPos` is saved (position when went offline)
2. `DeadZoneHistory.recordEntry()` is called
3. [startOfflineEstimation()](file:///c:/Users/anshul%20prajapati/OneDrive/Desktop/APARA/driver.html#596-603) polls every 2 seconds
4. `GPSTracker.getEstimatedPosition()` runs **4-tier estimation**:
   - Tier 1: Personal crossing history + OBD-II speed
   - Tier 2: Community average + OBD-II
   - Tier 3: Personal history + phone sensors
   - Tier 4: Basic dead reckoning (speed × heading × time)

#### Back Online / Retro-Generation
When network is restored:
1. `OfflineRetroGenerator.retroGenerateBlocks()` runs
2. Reconstructs all 1km blocks traversed while offline (based on start pos + end pos + speed)
3. Retro-blocks are tagged `source: 'offline_retrogenerated'` and sent to admin block registry
4. Toast: *"Retro-generated X blocks from offline path"*

#### Simulate Offline Button
A developer tool button `⚡ Simulate Offline` in the header allows toggling offline mode for testing without actually losing signal.

---

### Feature C — SOS Emergency Flow

#### Step 1 — Category Selection
Driver taps the floating red **🚨 SOS EMERGENCY** button. Grid of 5 emergency types appears:
| Code | Type | Icon |
|---|---|---|
| ACC | Accident | 🚨 |
| MED | Medical Emergency | 🏥 |
| TYR | Tyre Puncture | 🔴 |
| FUL | Out of Fuel | ⛽ |
| TOW | Tow Required | 🚗 |

#### Step 2 — Confirm SOS
- System builds an **ultra-compressed SOS packet** (<50 bytes):
  ```
  Format: BLOCKCODE|TYPECODE|TIME|conf:CONFIDENCE
  Example: NH48-B32|ACC|15:24:29|conf:87
  ```
- Shows packet string, byte count, GPS coordinates, transmission method (Data/SMS)
- **Hold-to-send button** (2 seconds) prevents accidental triggers — fill animation confirms progress

#### Step 3 — Provider Search (3 seconds)
- Spinner displayed while system searches for nearest provider
- Uses **Haversine distance formula** to find the closest active, available provider by GPS coordinates

#### Step 4 — Provider Confirmed
- Shows matched provider name, category, and **ETA in minutes** (calculated from distance at 40 km/h)
- Displays **Resolution PIN** (4-digit number) — driver must give this to the provider to confirm resolution
- Displays the **SOS Code** prominently
- Buttons: **Send SOS Code via SMS**, **Copy SOS Code**, **Cancel SOS**, **Back to Home**

#### SOS Persistence
- Active SOS is written to `sessionStorage` — survives tab refresh
- The SOS banner stays on home screen until: provider resolves it (enters correct PIN) or driver cancels

---

### Feature D — Block History Screen
- Lists all 1km blocks explored by this driver in reverse chronological order
- Each entry shows: Block Code, corridor, speed, date, lat/lng
- Storage bar shows total records and estimated KB used
- Empty state with guidance message

---

### Feature E — V2V Relay Screen
- Total relay count (lifetime)
- Info about BLE scanning running silently in background
- Relay history list (recent packets carried)
- Empty state if no relays yet

---

### Feature F — Settings Screen
| Setting | Description |
|---|---|
| Driver ID | Read-only display of current Driver ID |
| V2V Relay | Toggle to enable/disable carrying packets for others |
| SOS Confirmation | Dropdown: Hold 2s / Double Confirm / Single Tap |
| OBD-II Bluetooth | Pair button to connect to OBD-II adapter |
| Alert Sound | Toggle for audio on incoming events |
| Data Usage | Shows estimated KB used by block data |
| GPS Status | Live detailed GPS info (lat, lng, accuracy, speed, source) |
| Sign Out | Flushes data buffer, clears session |

---

## 🚑 Page 3 — Provider Dashboard ([provider.html](file:///c:/Users/anshul%20prajapati/OneDrive/Desktop/APARA/provider.html))

### Purpose
Mobile-optimized app for registered service providers (hospitals, mechanics, fuel stations, etc.) to receive and respond to SOS alerts.

### Login System
- Providers **cannot self-register** — credentials are provided only by the Admin
- Login requires:
  - **Registration ID** (format: `RSOS-HOSP-000001`)
  - **Password** (auto-generated 8-char alphanumeric string)
- Persistent session via `localStorage` — stays logged in across browser restarts
- On login: `lastLogin` timestamp is updated in the store

---

### Tab A — Live SOS Alerts
- Polls for new alerts every **3 seconds**
- Shows count badge: *"X active"*
- Each alert card shows:
  - Emergency type (icon + color-coded label)
  - Time elapsed (e.g., *"2 min ago"*)
  - Block code (large monospace text)
  - Confidence % (colored dot: cyan ≥85%, amber ≥60%, orange <60%)
  - Transmission method badge (SMS / USSD / LoRa / V2V Relay / Data)
  - GPS coordinates
- Newest alert pulses with urgent border animation
- Tap any alert to see full detail

#### Alert Detail View
- Full emergency card with map
- **Leaflet.js map** centered on the alert's GPS coordinates
- Accuracy circle drawn around the location
- Full details: Block Code, Confidence, Time, Transmission method
- **Accept & Dispatch** button (green, large)
- Decline with reason (Out of range / Unavailable / Already responding)

---

### Tab B — Lookup SOS Code
- Provider pastes an SOS code received via SMS
- System parses the packet format: `BLOCKCODE|TYPECODE|TIME|conf:XX`
- Also handles full SMS format: `APARA EMERGENCY: ... | PIN:XXXX | Loc:lat,lng`
- Extracts and displays:
  - Emergency type
  - Block code
  - Confidence %
  - Estimated GPS coordinates (from code or estimated from block position)
  - Resolution PIN (if available)
- Shows a **Leaflet map** with marker and accuracy circle at the decoded location
- Button to **Accept & Dispatch** directly from lookup result

---

### Tab C — Active Dispatch
When provider accepts an alert:
- **ETA countdown timer** (MM:SS format) counts down in real-time
- Elapsed dispatch time shown
- Emergency details + block code
- **Leaflet map** centered on the emergency location
- **Mark as Resolved** button → prompts for 4-digit PIN
  - Driver's PIN must match exactly — prevents false resolutions
  - On correct PIN: event marked resolved with resolution time recorded
  - On wrong PIN: error toast, input cleared

---

### Tab D — Provider Profile
- Provider name, category icon, Registration ID
- Registration details: phone, coverage corridor, status badge
- **Response history stats:** Total dispatches, Resolved count, Avg response time
- **Availability toggle** — provider can pause/resume receiving alerts
- Sign Out button

---

## 🛡️ Page 4 — Admin Panel ([admin.html](file:///c:/Users/anshul%20prajapati/OneDrive/Desktop/APARA/admin.html))

### Purpose
Full-featured desktop admin dashboard to manage all providers, view analytics, audit SOS events, and monitor the entire platform.

### Layout
- **Sidebar navigation** (collapsible on mobile via ☰ button)
- 8 sections: Dashboard, Register Provider, Provider Table, Drivers, Block Registry, Transit Log, Block Map, SOS Audit, V2V Relay Log
- Auto-refreshes active sections every **5 seconds**

---

### Section 1 — Platform Dashboard
Live stats grid with 8 KPI cards:
- Total Providers
- Active Providers
- Registered Drivers
- Blocks Explored
- Transit Records
- SOS Today
- SOS This Week
- Avg Response Time (minutes)

**Chart.js Charts:**
- **Bar chart** — SOS Events by Category (Accident, Medical, Tyre, Fuel, Tow)
- **Line chart** — SOS Events per day for the last 7 days

---

### Section 2 — Register Provider
Form to add new service providers:
| Field | Notes |
|---|---|
| Provider Name | Free text (e.g., "Lifeline Hospital") |
| Category | Dropdown: Hospital / Mechanic / Fuel Station / Tow Operator / Pharmacy / Puncture Shop |
| Phone | Contact number |
| Coverage Corridor | Optional: restrict to specific highway |
| GPS Coordinates | **Mandatory** — lat, lng for distance-based closest-provider matching |

On submit:
- Validates GPS format (`lat, lng` e.g. `28.6139, 77.2090`)
- Generates unique Registration ID: `RSOS-{CATEGORY}-{NUMBER}`
- Generates random 8-character alphanumeric password
- Saves to localStorage
- Shows credentials card with **Copy** buttons for ID and password

---

### Section 3 — Provider Management Table
- Searchable (by name, ID, or category)
- Paginated (10 per page)
- Columns: ID, Name, Category, Phone, GPS, Status
- **Actions per row:** Activate/Deactivate toggle, Delete (with confirmation modal)
- **Export CSV** button — downloads `providers.csv`

---

### Section 4 — Registered Drivers
Auto-populated when drivers log in via mobile number:
- Columns: Driver ID, Mobile Number, Registered Date, Last Login, Sessions count
- No manual driver registration needed

---

### Section 5 — Block Registry
- Auto-generated 1km grid blocks — **immutable once created**
- Shows: Block ID (e.g., `BLK-2292-8736`), Center Lat/Lng, Created timestamp, Created By (Driver ID), Source (📡 GPS / 📴 Offline), Transit count
- Sorted by newest first, shows up to 100 blocks
- **Export JSON** button — downloads full block registry
- **Import JSON** button — merges external block data (never overwrites existing blocks)

---

### Section 6 — Transit Log
Entry/exit timestamps for every block crossing:
- Columns: Time, Type (→ ENTER / ← EXIT), Block ID, Driver ID, Speed (km/h), Location
- Filterable by Block ID or Driver ID
- Shows up to 100 records
- **Export/Import JSON** for data sharing between admin instances

---

### Section 7 — Road Block Map
Visual display of all 6 corridor definitions with block strip visualizations (same as landing page)

---

### Section 8 — SOS Audit Trail
Complete event log with filtering:
- **Status filter:** All / Resolved / Active / Cancelled
- **Type filter:** All / Accident / Medical / Tyre / Fuel / Tow
- Columns: Time, Block Code, Type, Confidence %, Location, Status badge, Provider
- **Timeline drilldown** for each event — expandable view showing:
  - When SOS was triggered
  - Packet contents
  - Location coordinates
  - Transmission method
  - Provider assigned
  - Resolution status (Resolved in X min / Pending / Cancelled)
- **Export CSV** — downloads `sos_audit.csv`

---

### Section 9 — V2V Relay Log
- Total relay event count stat card
- List of all V2V relay events with telemetry

---

## ⚙️ Shared Data Engine ([data.js](file:///c:/Users/anshul%20prajapati/OneDrive/Desktop/APARA/data.js))

All data is stored in browser **`localStorage`** with these keys:

| Key | Content |
|---|---|
| `apara_providers` | Array of registered service providers |
| `apara_sos_events` | Array of all SOS events (active + resolved) |
| `apara_corridors` | Highway corridor definitions |
| `apara_crossings` | Driver crossing history |
| `apara_v2v_relays` | V2V relay event log |
| `apara_zone_history` | Dead zone traversal history for offline estimation |
| `apara_block_registry` | Immutable 1km grid block definitions |
| `apara_block_transit_log` | Block entry/exit timestamps with driver IDs |
| `apara_drivers` | Registered driver profiles |
| `apara_driver_buffer` | Pending data to sync every 5 minutes |
| `apara_settings` | Driver app settings |
| `apara_logged_provider` | Currently logged-in provider session |

### Key Modules

#### [BlockRegistry](file:///c:/Users/anshul%20prajapati/OneDrive/Desktop/APARA/admin.html#425-431) — 1km Immutable Grid
- Divides earth into 1,000m × 1,000m grid cells using lat/lng math
- [getBlockId(lat, lng)](file:///c:/Users/anshul%20prajapati/OneDrive/Desktop/APARA/data.js#703-708) → `BLK-{gridRow}-{gridCol}`
- [getOrCreateBlock()](file:///c:/Users/anshul%20prajapati/OneDrive/Desktop/APARA/data.js#718-743) → creates block if new, returns existing if already in registry
- Blocks tagged `locked: true` — never modified after creation
- **Retro-block generation** ([createRetroBlock](file:///c:/Users/anshul%20prajapati/OneDrive/Desktop/APARA/data.js#744-769)) for offline path reconstruction

#### `DataBuffer` — 5-Minute Sync
- Buffers block records and transit events in session
- [bufferBlock()](file:///c:/Users/anshul%20prajapati/OneDrive/Desktop/APARA/data.js#955-963) / [bufferTransit()](file:///c:/Users/anshul%20prajapati/OneDrive/Desktop/APARA/data.js#964-970) — queues items
- [flush()](file:///c:/Users/anshul%20prajapati/OneDrive/Desktop/APARA/data.js#971-1005) — writes buffer to persistent localStorage store
- Auto-flushes every 5 minutes; flushes on logout

#### `DeadZoneHistory` — Offline Positioning Engine
- Records every corridor traversal (entry block, exit block, speed, time)
- Builds per-block **average transit time profiles**
- When offline, [estimateFromHistory()](file:///c:/Users/anshul%20prajapati/OneDrive/Desktop/APARA/data.js#488-589) walks through block profiles using elapsed time to determine current block
- Falls back to **basic dead reckoning** (dead_reckoning source) if no history available
- Confidence degrades over time but slower than raw dead reckoning

#### `OfflineRetroGenerator` — Post-Reconnection Block Builder
- On GPS restoration, reconstructs the path taken while offline
- Uses start position, end position, and estimated speed to interpolate intermediate 1km blocks
- Tags them as `offline_retrogenerated`

#### `GPSTracker` — Position Tracker
- `watchPosition()` for continuous live GPS
- [getSpeedKmh()](file:///c:/Users/anshul%20prajapati/OneDrive/Desktop/APARA/data.js#244-258) — uses OBD-II if available, else calculates from position delta
- [getEstimatedPosition()](file:///c:/Users/anshul%20prajapati/OneDrive/Desktop/APARA/data.js#259-305) — tiered estimation pipeline (personal → community → dead reckoning)
- Keeps last 500 position samples in memory

#### `NetworkDetector` — Connectivity Monitor
- Listens to `window online/offline` events
- Reads `navigator.connection` for connection quality (type, downlink, RTT)
- [isWeakConnection()](file:///c:/Users/anshul%20prajapati/OneDrive/Desktop/APARA/data.js#196-200) — detects slow-2g / 2g / <0.5Mbps

#### `SOSPacket` — Emergency Packet Builder
- Builds compact packet: `BLOCKCODE|TYPECODE|HH:MM:SS|conf:XX`
- Generates 4-digit **resolutionPin** for secure resolution verification
- Selects transmission method: `Data` (online) or `SMS` (offline)

#### `BlockResolver` — Current Block Identifier
- Maps GPS lat/lng to the appropriate corridor and block number
- Uses latitude ranges to narrow corridor (J&K > 32°, Uttarakhand > 28°, Maharashtra > 18°, Kerala > 10°)

---

## 🔄 Complete Data Flow — End-to-End

```
1. Driver opens driver.html → enters mobile → gets Driver ID DRV-XXXXXX

2. Enables GPS → GPSTracker starts → block ID generated every ~10s

3. As driver moves:
   - BlockRegistry.getOrCreateBlock() creates 1km blocks
   - DataBuffer queues blocks + transit events
   - Every 5 min → buffer flushes to localStorage

4. Signal drops:
   - NetworkDetector fires 'offline'
   - offlineLastPos saved
   - DeadZoneHistory.recordEntry() called
   - Estimation starts every 2s using DeadZoneHistory

5. Driver sends SOS:
   - SOSPacket.build() creates <50-byte packet
   - Driver holds button 2 seconds → sendSOS()
   - System finds closest provider by Haversine distance
   - SOS event saved to localStorage with resolutionPin
   - SOS banner shown on driver home screen

6. Provider receives alert (polls every 3s):
   - Sees alert on tabAlerts
   - Views detail → map shows location
   - Accepts → dispatch timer starts

7. Provider arrives, asks for PIN:
   - Driver reads 4-digit PIN from their screen
   - Provider enters PIN in app → resolveDispatch()
   - Event marked resolved with time stamp

8. Signal restored:
   - OfflineRetroGenerator.retroGenerateBlocks() fills in offline path
   - DeadZoneHistory.recordExit() saves traversal data for future trips

9. Admin sees everything:
   - Dashboard shows live stats + charts
   - Audit trail shows event timeline
   - Block registry shows all explored 1km cells
```

---

## 🚀 Emergency Types Supported

| Code | Label | Icon | Color |
|---|---|---|---|
| ACC | Accident | 🚨 | Red |
| MED | Medical Emergency | 🏥 | Blue |
| TYR | Tyre Puncture | 🔴 | Orange |
| FUL | Out of Fuel | ⛽ | Yellow |
| TOW | Tow Required | 🚗 | Grey |

## 🏥 Service Provider Categories

| Code | Label | Icon |
|---|---|---|
| HOSP | Hospital | 🏥 |
| MECH | Mechanic | 🔧 |
| FUEL | Fuel Station | ⛽ |
| TOW | Tow Operator | 🚗 |
| PHAR | Pharmacy | 💊 |
| PUNC | Puncture Shop | 🔴 |

## 📡 Transmission Methods

| Method | Used When |
|---|---|
| Data | Online (standard internet) |
| SMS | Offline (basic cellular) |
| USSD | Deep offline (USSD codes) |
| LoRa | Remote areas (LoRa radio) |
| V2V Relay | BLE via passing vehicles |

---

## 🔑 Key Design Decisions

1. **No backend required** — all data in localStorage, sharable across tabs/windows
2. **Offline-first absolute priority** — every feature degrades gracefully without internet
3. **Immutable blocks** — once a 1km block is created, it is never changed (data integrity)
4. **History improves accuracy** — more trips through a corridor = better offline positioning
5. **Sub-50-byte SOS packets** — fits in a single SMS, USSD string, or BLE advertisement
6. **Community effect** — block data from all drivers improves accuracy for future drivers
7. **PIN-based resolution** — prevents providers from falsely marking events as resolved
8. **GPS-mandatory for providers** — required for Haversine-based closest-provider matching
9. **Retro-generation** — blocks are created retroactively when GPS returns, no pre-generation
10. **V2V relay is silent** — relay drivers see nothing, no privacy exposure, AES-256 encrypted
11. **Firebase is optional** — system works 100% with localStorage alone; Firebase adds cloud sync for scale
12. **SOS is always SMS-only** — zero Firebase dependency during emergencies

---

## ☁️ Firebase Sync Engine ([firebase.js](file:///c:/Users/anshul%20prajapati/OneDrive/Desktop/DRISHYTOX/firebase.js))

### Purpose
Hybrid cloud layer for scaling to 100,000+ drivers. **All SOS and order flows remain 100% offline SMS-based.** Firebase is only used for:
- Provider/Shop registration sync (admin → cloud → driver zones)
- Config version push (global version counter for data freshness)
- Block registry (immutable blocks shared across all drivers)
- Transit records (15-day batch upload for community speed profiles)
- Zone data download (100km provider/shop cache on driver login)

### Architecture

```
WHAT USES FIREBASE              WHAT STAYS SMS/LOCAL-ONLY
─────────────────────           ─────────────────────────
✅ Provider Registration        ❌ SOS Events (pure SMS)
✅ Shop Registration            ❌ Marketplace Orders (pure SMS)
✅ Menu Items                   ❌ SOS Provider Search (local zone cache)
✅ Config Push Versioning       ❌ Block Code Generation (local math)
✅ Block Registry (immutable)   ❌ Dead Reckoning (local history)
✅ Transit Records (15-day)     ❌ V2V Relay (BLE)
✅ Zone Data (100km download)
✅ Community Speed Profiles
```

### Key Module: `FirebaseSync`

| Method | Purpose |
|---|---|
| `init()` | Connect to Firestore; graceful fallback if no config |
| `isReady()` | Guard check before any Firebase call |
| `pushProvider / updateProvider / deleteProvider` | Admin CRUD → Firestore `providers` collection |
| `pushShop / updateShop / deleteShop` | Admin CRUD → Firestore `shops` collection |
| `pushMenu(shopId, items)` | Shop menu sync → Firestore `menus` collection |
| `pushConfigVersion(version)` | Global version bump → `config/apara_config` doc |
| `pollConfigVersion()` | Driver polls every 30 min; returns `{changed, remoteVersion}` |
| `initDriverZone(lat, lng)` | Download ALL providers/shops, filter to 100km, rebuild zone cache |
| `refreshOutdatedZones(newVersion)` | Re-download all zone data when config version changes |
| `pushBlock(block)` | Immutable block → Firestore (merge-only, never overwrites) |
| `pushTransitRecords(records)` | Batch upload transit records for community data |
| `uploadBatchTransit(driverId, payload)` | 15-day full sync: blocks + transits |
| `downloadCommunityData(lat, lng)` | Download community blocks + transits → build speed profiles |
| `fullAdminSync()` | One-click push all local data to Firestore |

### Data Flow for 100,000 Drivers

```
ADMIN registers provider
  └→ localStorage.set()
  └→ FirebaseSync.pushProvider() → Firestore
  └→ ConfigPush.bumpVersion() → Firestore version++

DRIVER logs in (1 of 100,000)
  └→ FirebaseSync.init()
  └→ FirebaseSync.initDriverZone(lat, lng) → downloads providers+shops
  └→ stores in localStorage zone cache (100km radius)
  └→ FirebaseSync.downloadCommunityData() → transit records
  └→ SpeedEstimator.buildCommunityProfiles() → speed profiles cached
  └→ starts 30-min config version polling

DRIVER triggers SOS
  └→ block code generated LOCALLY (zero Firebase)
  └→ searches LOCAL zone cache for top 5 providers in 10km
  └→ SpeedEstimator.calculateETA() computes smart ETAs
  └→ renders multi-provider picker with individual SMS buttons
  └→ SMS body includes: code, type, GPS, speed, PIN, Maps link
```

### Firebase Collections

| Collection | Documents | Write By | Read By |
|---|---|---|---|
| `providers` | One per provider | Admin | Drivers (zone download) |
| `shops` | One per shop | Admin | Drivers (zone download) |
| `menus` | One per shop | Shop owner | Drivers (zone download) |
| `config` | `apara_config` | Admin | All drivers (polling) |
| `block_registry` | One per 1km block | All drivers | All drivers |
| `transit_log` | Auto-generated IDs | All drivers | All drivers |
| `batch_uploads` | `{driverId}_{timestamp}` | Drivers | Admin |
| `drivers` | One per driver | Drivers | Admin |

---

## 🏎️ Speed Estimator — Smart ETA Engine ([data.js → SpeedEstimator](file:///c:/Users/anshul%20prajapati/OneDrive/Desktop/DRISHYTOX/data.js))

### Purpose
Calculates realistic provider ETAs during SOS using **6 layers of speed data**, falling through each until a match is found:

### 6-Layer Speed Estimation

| Layer | Source | Confidence | When Used |
|---|---|---|---|
| 1 | **Live GPS speed** | 95% | Driver is currently moving (>2 km/h) |
| 2 | **User's block average** | 80% | Driver has traversed this specific block before |
| 3 | **User's entry speed** | 75% | Driver's speed when entering this block previously |
| 4 | **Community average** | 50-85% | Speed data from ALL drivers who've crossed this block (from Firebase) |
| 5 | **User's overall average** | 50% | Driver's average speed across all blocks |
| 6 | **Default (40 km/h)** | 20% | No data available — generic highway estimate |

### Key Methods

| Method | Returns |
|---|---|
| `estimateSpeed(lat, lng, gpsSpeed, driverId)` | `{speed, source, confidence}` |
| `calculateETA(fromLat, fromLng, toLat, toLng, gpsSpeed, driverId)` | `{etaMinutes, distanceKm, estimatedSpeed, speedSource, confidence}` |
| `buildCommunityProfiles(transitRecords)` | Processes Firebase transit data → localStorage speed profiles |
| `getSpeedSummary(lat, lng, gpsSpeed, driverId)` | All speed layers for current position (for UI display) |

### Community Speed Profile Building
When driver downloads zone data:
1. `FirebaseSync.downloadCommunityData()` fetches transit records from Firestore
2. `SpeedEstimator.buildCommunityProfiles()` aggregates speeds per block
3. Uses **weighted merge**: 70% existing community data + 30% new data
4. Stored in `localStorage` key `apara_community_speeds` for offline use
5. Each profile: `{ avgSpeed, sampleCount, lastUpdated }`

### Speed Source Badges in SOS UI

| Badge | Color | Meaning |
|---|---|---|
| `LIVE` | 🟢 Green | Using current GPS speed |
| `YOUR` | 🔵 Blue | Using your own block history |
| `HIST` | 🔵 Light Blue | Using your entry speed for this block |
| `COMM` | 🟣 Purple | Using community average from all drivers |
| `AVG` | 🟡 Yellow | Using your overall speed average |
| `EST` | ⚪ Grey | Default 40 km/h estimate |

---

## 🚨 Multi-Provider SOS Picker (driver.html)

### How It Works
When driver triggers SOS, instead of showing a single "nearest provider", the system now:

1. **Scans all cached zones** (100km radius localStorage) for providers within 10km
2. **Checks both providers AND shops** (fuel stations, mechanics, pharmacies)
3. **Category-matches first**: Accident → Hospital/Tow/Mechanic, Medical → Hospital/Pharmacy, etc.
4. **Sorts**: category matches first, then by distance
5. **Shows top 5** as tappable cards, each with their own **📱 SMS** button

### SMS Message Format
Each SMS button opens the native messaging app pre-filled with:
```
APARA SOS K7M2N4AC
🚗 Accident
Loc: 22.30541,73.18126
Speed: 65km/h
Conf: 87%
PIN: 4832
Maps: https://maps.google.com/?q=22.30541,73.18126
```

### Provider Card Display
Each provider card shows:
- Name + category icon + MATCH badge (if category-relevant)
- Distance in km + **Smart ETA** (from SpeedEstimator, not simple distance/40)
- Phone number
- Speed source badge (LIVE/YOUR/COMM/AVG/EST + speed in km/h)
- Red **📱 SMS** button

### Fallback Chain
1. Zone cache providers within 10km → multi-provider list
2. localStorage providers (old-style) → 3 closest shown
3. No providers at all → Emergency 112 SMS button

---

## 🏪 Shop Provider Dashboard ([shop_provider.html](file:///c:/Users/anshul%20prajapati/OneDrive/Desktop/DRISHYTOX/shop_provider.html))

### Purpose
Dashboard for food stalls, fuel stations, mechanics, and other service shops to manage their menu, view orders, and update their profile.

### Features
- **Login** with Shop ID + Password (admin-issued)
- **Menu Management** — add/edit/delete items with name, price, category
- **Order Polling** — checks for incoming SMS-based orders
- **Profile Management** — view registration details, hours, location
- **Firebase Sync** — menu changes automatically push to Firestore via data.js hooks

---

## 📊 Updated File Structure

```
index.html           → Landing / Info page
driver.html          → Driver Mobile App (SOS, GPS, Marketplace)
provider.html        → Service Provider Dashboard (SOS Alerts, Dispatch)
shop_provider.html   → Shop Dashboard (Menu, Orders)
admin.html           → Admin Control Panel (Full management)
data.js              → Shared localStorage data store + SpeedEstimator
firebase.js          → Firebase Firestore sync engine (NEW)
shared.css           → Global design system
test_offline.html    → Offline testing tool
```

### localStorage Keys (Updated)

| Key | Content |
|---|---|
| `apara_providers` | Registered service providers |
| `apara_sos_events` | All SOS events (active + resolved) |
| `apara_corridors` | Highway corridor definitions |
| `apara_crossings` | Driver crossing history |
| `apara_v2v_relays` | V2V relay event log |
| `apara_zone_history` | Dead zone traversal history |
| `apara_block_registry` | Immutable 1km block definitions |
| `apara_block_transit_log` | Block entry/exit timestamps |
| `apara_drivers` | Registered driver profiles |
| `apara_driver_buffer` | Pending data to sync |
| `apara_settings` | Driver app settings |
| `apara_logged_provider` | Provider session |
| `apara_shops` | Registered shops |
| `apara_logged_shop` | Shop session |
| `apara_config_version` | Config push version counter |
| `apara_zone_index` | Zone cache index |
| `apara_zone_*` | Per-zone cached provider/shop data |
| `apara_community_speeds` | **Community speed profiles from Firebase** |

---

## 🔥 Firebase Setup Guide (Step-by-Step)

### 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add Project"**
3. Enter name: `APARA` (or your preferred name)
4. Disable Google Analytics (not needed) → Click **Create Project**

### 2. Register a Web App
1. On the project dashboard, click the **Web icon `</>`**
2. App nickname: `APARA Web`
3. **DO NOT** enable Firebase Hosting (we use static files)
4. Click **Register App**
5. Copy the `firebaseConfig` object shown:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "apara-xxxxx.firebaseapp.com",
  projectId: "apara-xxxxx",
  storageBucket: "apara-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

### 3. Enable Firestore Database
1. In Firebase sidebar → **Build → Firestore Database**
2. Click **Create Database**
3. Choose location: `asia-south1 (Mumbai)` for India
4. Start in **Production mode** (we'll set rules next)

### 4. Set Firestore Security Rules
Go to **Firestore → Rules** and paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Config — anyone can read, only admin can write
    match /config/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    // Providers & Shops — anyone can read (for zone download)
    match /providers/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /shops/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /menus/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    // Block registry — anyone can read/write (community data)
    match /block_registry/{doc} {
      allow read, write: if true;
    }
    // Transit logs — anyone can read/write
    match /transit_log/{doc} {
      allow read, write: if true;
    }
    match /batch_uploads/{doc} {
      allow read, write: if true;
    }
    match /drivers/{doc} {
      allow read, write: if true;
    }
  }
}
```

### 5. Paste Config into Code
Open `firebase.js` and replace lines 17-25:

```javascript
const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 6. Verify It Works
1. Open `admin.html` → the **☁️ LIVE** badge should appear in the sidebar
2. Click **"☁️ Sync All to Firebase"** → providers/shops push to cloud
3. Open `driver.html` → login → should download zone data from Firebase
4. Check Firestore console → documents should appear in `providers` and `shops`

---

## 📱 Compact SMS Order Format

### Format
```
ORD:BLOCKCODE:ITEMS:PIN:LAT,LNG
```

### Example
Driver orders 2 Roti (RT) and 1 Chai (CH):
```
ORD:K7M2N4AC:RT2CH1:4832:22.30,73.18
```

| Part | Meaning | Example |
|---|---|---|
| `ORD:` | Order prefix (3 chars) | `ORD:` |
| `K7M2N4AC` | 8-char block code (location) | `K7M2N4AC` |
| `RT2CH1` | Item codes + qty | Roti×2, Chai×1 |
| `4832` | Pickup PIN / OTP | `4832` |
| `22.30,73.18` | GPS coords (reference) | lat,lng |

**Total: ~35 characters** — fits in a single SMS.

### How It Works

```
DRIVER places order in marketplace
  └→ selects items from shop menu
  └→ OrderPacket.build() generates compact code
  └→ taps "📱 Send Order via SMS"
  └→ SMS opens pre-filled: ORD:K7M2N4AC:RT2CH1:4832:22.30,73.18

SHOP PROVIDER receives SMS
  └→ opens Shop Dashboard → "📋 Lookup" tab
  └→ pastes the SMS code into input
  └→ system decodes: items + location + PIN
  └→ shows items with prices from menu
  └→ shows customer location on Leaflet map
  └→ shows PICKUP OTP prominently
  └→ clicks "Accept & Prepare" → order appears in Orders tab

DRIVER arrives at shop
  └→ gives 4-digit PICKUP PIN to shop
  └→ shop enters PIN → order marked fulfilled
```
