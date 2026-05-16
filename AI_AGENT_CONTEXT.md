# 🤖 APARA/DRISHYTOX — Complete AI Agent Handoff Document
## Last Updated: 2026-05-16 by Gemini Antigravity

> **PURPOSE**: This document gives any AI coding agent FULL CONTEXT to continue development on the APARA platform. Read this BEFORE making any changes.

---

## 📋 TABLE OF CONTENTS
1. Project Overview
2. Architecture & Technology Stack
3. File-by-File Documentation
4. Design System
5. Completed Work (What's Done)
6. Pending Work (What Needs To Be Built)
7. Critical Rules & Gotchas
8. Data Flow Diagrams
9. Testing & Deployment

---

## 1. Project Overview

**APARA** (codename DRISHYTOX) is a **mobile-first emergency assistance platform** for Indian highways. It connects **drivers** in distress with nearby **service providers** (hospitals, mechanics, fuel stations, tow operators, pharmacies, puncture shops).

### Core Product Pages
| Page | Purpose | Users |
|------|---------|-------|
| `pages/driver.html` | Driver mobile app — GPS tracking, SOS alerts, marketplace | Drivers |
| `pages/road-sos.html` | Advanced injury triage — body map, condition selection, first-aid protocols | Drivers in emergency |
| `pages/provider.html` | Service provider dashboard — receive SOS, manage profile | Hospitals, mechanics, etc. |
| `pages/shop_provider.html` | Shop/food provider dashboard — menu management, orders | Restaurants, shops |
| `pages/admin.html` | Admin control panel — manage providers, view SOS events | Platform admin |
| `index.html` | Landing/marketing page | Public |

### Key Innovation
The platform works **offline** using a **Block Code System** — a 15-character alphanumeric code that encodes GPS coordinates + emergency type. This code can be transmitted via SMS, voice call, or even written on paper, allowing emergency location sharing without internet.

---

## 2. Architecture & Technology Stack

### Stack
- **Frontend**: Pure HTML + Vanilla CSS + Vanilla JavaScript (NO frameworks)
- **Backend**: Firebase (Firestore + Realtime Database + Auth)
- **Hosting**: GitHub Pages (static, no server)
- **CDN Scripts**: All must have `crossorigin="anonymous"`

### Data Architecture
- **localStorage** is the PRIMARY data store (offline-first)
- **Firebase** syncs in background when online
- **Zone Bundles**: Drivers download provider data for 100km radius ONCE
- **Config push via RTDB**: Changes pushed to drivers (NO polling, NO repeated reads)
- Designed to work within Firebase Free Tier for 100K+ drivers

### Sync Strategy (CRITICAL — DO NOT CHANGE)
- Drivers download provider data for 100km radius ONCE as a "Zone Bundle"
- Changes are pushed via Firebase RTDB config version listener (NO polling)
- Reads/Writes are minimized — the system is designed for Firebase Free Tier
- Offline-first: Everything works without internet via localStorage

---

## 3. File-by-File Documentation

### JavaScript Core (`js/`)

#### `js/data.js` (94KB, 2507 lines) — THE CORE
The shared data layer. Contains:
- `Store` — localStorage CRUD helpers for all entities
- `NetworkDetector` — Online/offline detection + connection quality
- `GPSTracker` — GPS watchPosition with smoothing, speed calculation, dead reckoning
- `BlockResolver` — Maps lat/lng to highway corridor blocks
- `SOSPacket` — Builds standardized SOS data packets
- `DeadZoneHistory` — Records corridor traversal timing for offline position estimation
- `Utils.haversine()` — Distance calculation

**GPSTracker Key Details:**
- Uses `watchPosition` + 5-second `getCurrentPosition` backup
- Rejects accuracy >50m readings
- Calculates speed from position delta (NOT coords.speed which is unreliable)
- Applies jitter filter: <3m movement in <3s = stationary
- Caps at 200 km/h to reject GPS jumps
- Smooths position with weighted average when accuracy >15m
- Tracks driver average speed (rolling 100 samples, saved to localStorage)
- `getEstimatedPosition()` — Dead reckoning using driver/community speed averages

#### `js/block-code-encoder.js` (6.4KB) — Offline Location Encoding
- `BlockCodeEncoder.encode(lat, lng, type)` returns `"RR-NNN-TTT"` (11 chars)
- `BlockCodeEncoder.decode(code)` returns `{lat, lng, type, accuracy_km}`
- `BlockCodeEncoder.buildSMSMessage()` returns SMS-ready emergency text
- `BlockCodeEncoder.buildSMSUri()` returns `sms:` URI for native app
- Region grid: India divided into 50 lat/lng buckets (10 lat x 5 lng)
- Block precision: ~10km per block

#### `js/sos-protocols.js` (42KB) — Medical Triage Engine
- `SOS_CONDITIONS` — 22 injury conditions with icons, severity, body regions
- `SOS_TREATMENTS` — First-aid protocol steps for each condition
- `BodyMapEngine` — Maps body regions to condition IDs
- `TriageEngine` — Priority calculation (P1-P4) from selected conditions
- `AssessmentEngine` — Follow-up assessment questions per condition

#### `js/sos-provider-engine.js` (10KB) — Emergency Dispatch
- `SOSProviderEngine.receiveEmergency(packet)` — Process incoming SOS
- `SOSProviderEngine.getNearestProviders(lat, lng, 100)` — 100km radius search
- `SOSProviderEngine.priorityDispatch(providers, severity)` — Score-based sorting
- `SOSMessageQueue` — Offline message queue with auto-flush on reconnect

#### `js/firebase-config.js` (435B) — Firebase credentials (NEVER remove from repo)
#### `js/firebase.js` (40KB) — Driver app Firebase sync engine
#### `js/firebase_v2.js` (43KB) — Provider/shop/admin Firebase sync engine

### CSS (`css/`)

#### `css/shared.css` — Global design tokens (Tactical Horizon theme)
- Dark theme: `--bg-primary: #0A0F1C`, `--bg-card: #111827`
- Accents: `--cyan: #00F5FF`, `--accent-orange: #FF6B35`
- Glassmorphism: `backdrop-filter: blur()` panels
- Font: Inter (Google Fonts)

#### `css/sos.css` — Road SOS specific styles
- Screen transitions with fadeUp animation
- Body map SVG styling
- Condition card grid (2 columns)
- Detail panel with protocol steps

### Pages (`pages/`)

#### `pages/road-sos.html` (985 lines) — Road SOS Triage System
**Screen Flow:**
Screen 1 (Activation) > Screen 2 (Body Map + Conditions) > Screen 2.5 (Context) > Screen 3 (Assessment) > Screen 4 (Triage Results) > Screen 5 (First-Aid Guidance)

**Critical Bug Fixed (2026-05-16):**
The condition grid was not rendering due to a **JavaScript temporal dead zone** error. The boot IIFE called `buildQuickChips()`, `renderCondGrid()`, and `initScreen25()`, but the `const`/`let` variables they used were declared AFTER the IIFE. Fix: moved all declarations before the IIFE.

---

## 4. Design System

**Theme**: Tactical Horizon — Premium dark glassmorphic
- Background: Deep navy/black gradients
- Primary accent: Cyan (#00F5FF)
- Secondary accent: Orange (#FF6B35)
- Cards: Glass panels with backdrop-filter blur + subtle borders
- Fonts: Inter (body), Roboto Mono (data/codes)
- Mobile-first: max-width 480px for driver app

---

## 5. Completed Work

### Road SOS Triage System (Fully Working)
- 22 medical conditions with severity-coded cards
- Interactive body map (SVG front/back with click regions)
- 9 category filter chips, search bar with live filtering
- Condition detail panel showing protocol steps, timers, DO NOT warnings
- Pain level selector, accident type grid, context flags, damage level
- Assessment questions engine, triage priority calculator (P1-P4)
- Step-by-step first-aid guidance with TTS support
- JSON dataset integration (road_sos_system.json) with 42 protocols

### Block Code System (Basic — needs enhancement)
- Encode lat/lng to 11-char code, decode back
- SMS message builder, provider-side decode engine

### GPS Tracking System (Working)
- watchPosition + backup, speed from position delta
- Dead reckoning, driver/community average speed

### Firebase Sync Architecture (Working)
- Zone Bundle system, config push via RTDB, offline message queue

---

## 6. Pending Work (WHAT NEEDS TO BE BUILT NEXT)

### PRIORITY 1: Location Watchdog System (NEW FILE: `js/location-watchdog.js`)

Smart safety monitor that runs in the driver app background.

#### Case 1: GPS OFF Detection
1. GPSTracker detects geolocation errors (permission denied / timeout)
2. LocationWatchdog starts 5-minute timer
3. After 5 minutes: Show WARNING MODAL with countdown (1 minute)
   - Modal text: "Your GPS has been off for 5 minutes. Are you safe?"
   - Buttons: [I'M OK] [NO - SEND SOS]
4. If [I'M OK] pressed: Reset timer, continue monitoring
5. If [NO] pressed: Immediately trigger Auto-SOS (SMS)
6. If NO button pressed within 1 minute: Auto-trigger SOS via SMS
7. Auto-SOS uses LAST KNOWN position + community average fallback
8. Block code format: "RR-NNN-TTT-GOFF" (GOFF = GPS Off reason)

#### Case 2: Stationary Detection
1. GPSTracker reports positions continuously
2. LocationWatchdog checks: has driver moved >50m in last 5 minutes?
3. If stationary for 5 minutes AND location is ON:
   - Show WARNING MODAL: "You haven't moved for 5 minutes. Are you parked?"
   - Buttons: [STAY] [NO - SEND SOS]
4. If [STAY] pressed: Enter PARKED state, show "START DRIVING" button
5. If "START DRIVING" pressed: Resume DRIVING state
6. If [NO] pressed: Immediately trigger Auto-SOS
7. If nothing pressed within 1 minute: Auto-trigger SOS
8. Block code: "RR-NNN-TTT-STAT" (STAT = Stationary reason)

#### State Machine
```
DRIVING -> (no movement 5min) -> STATIONARY_WARNING -> (no STAY press 1min) -> AUTO_SOS
DRIVING -> (GPS off 5min) -> GPS_OFF_WARNING -> (no OK press 1min) -> AUTO_SOS
STATIONARY_WARNING -> (STAY pressed) -> PARKED -> (START pressed) -> DRIVING
```

### PRIORITY 2: Enhanced Block Code Encoder

Modify `js/block-code-encoder.js`:
- Current format: `RR-NNN-TTT` (11 chars)
- New format: `RR-NNN-TTT-RRRR` (15 chars max)
- RRRR = Reason code (NRSP=No Response, STAT=Stationary, GOFF=GPS Off, MANU=Manual, AUTO=Auto)
- Add `encodeWithReason(lat, lng, type, reason)` function
- Add `decodeWithReason(code)` function
- Add `getOfflineEstimatedCode(type, reason)` using cached position + averages

### PRIORITY 3: Driver App Warning Modal UI

Modify `pages/driver.html`:
- Add import for `js/location-watchdog.js`
- Add warning modal HTML (glassmorphic emergency styled)
- Add STAY/START buttons UI
- Add parked mode banner
- Start watchdog after driver login

### PRIORITY 4: Provider Block Code Decoder

Modify `pages/provider.html`:
- Add block code paste/input field
- Add decode button showing: map coordinates, SOS type, reason, distance, ETA
- One-tap dispatch button

### PRIORITY 5: GPS Smoothing Enhancements

Modify `js/data.js` GPSTracker:
- Add `_isGPSActive` flag, `_gpsLostTime` timestamp
- Add `onGPSStateChange(callback)` listener
- Add `getTimeSinceLastMovement()` and `isStationary()` methods
- Emit `gps_lost` / `gps_restored` events

---

## 7. Critical Rules & Gotchas

### MANDATORY (from AGENTS.md)
1. ALWAYS update CHANGELOG.md after code changes
2. NEVER modify: `js/firebase-config.js`, `js/firebase.js`, `js/firebase_v2.js`
3. ALL CDN scripts must have `crossorigin="anonymous"`
4. Use CSS variables from `css/shared.css`
5. Mobile-first: Driver app max-width 480px
6. Contributor name: Anshul Prajapati (@Anshulpj12)

### JavaScript Gotchas
- **Temporal Dead Zone**: NEVER use `const`/`let` variables before they are declared. Boot IIFEs run immediately — all constants must be ABOVE them.
- **GPS on mobile**: Use `enableHighAccuracy: false` first. Timeout 15-35 seconds for cold start.
- **`coords.speed`** is unreliable — always calculate from position delta.
- **Firebase reads are expensive** — Zone Bundle architecture minimizes reads. Don't add new listeners.

---

## 8. Data Flow Diagrams

### Auto-SOS Flow (TO BE BUILT)
```
LocationWatchdog._checkState() runs every 10 seconds
  -> Checks GPSTracker.isStationary() -> true for >5 min?
    -> YES: Show STATIONARY_WARNING modal (1 min timer)
      -> STAY pressed: Enter PARKED state
      -> NO pressed: triggerAutoSOS()
      -> Timer expires: triggerAutoSOS()
  -> Checks GPSTracker._isGPSActive -> false for >5 min?
    -> YES: Show GPS_OFF_WARNING modal (1 min timer)
      -> OK pressed: Reset timer
      -> NO pressed: triggerAutoSOS()
      -> Timer expires: triggerAutoSOS()

triggerAutoSOS():
  1. Get position (last known GPS or estimated from block averages)
  2. Encode block code with reason: BlockCodeEncoder.encodeWithReason()
  3. Get nearest provider phones: SOSProviderEngine.getProviderPhoneNumbers()
  4. Build SMS: BlockCodeEncoder.buildSMSMessage()
  5. Open SMS app: window.location.href = sms:URI
  6. Queue in SOSMessageQueue for Firebase sync when online
```

### Provider Decode Flow (TO BE BUILT)
```
Provider receives SMS with code "AD-142-ACC-NRSP"
  -> Opens provider.html
  -> Pastes code into input field
  -> Clicks DECODE
  -> BlockCodeEncoder.decodeWithReason("AD-142-ACC-NRSP")
    -> Returns {lat: 23.4567, lng: 78.1234, type: "ACC", reason: "NRSP"}
  -> SOSProviderEngine.receiveEmergency(decodedPacket)
  -> UI shows: map pin, distance, ETA, dispatch button
```

---

## 9. Testing & Deployment

### Local Development
```bash
npx http-server . -p 8090
# Then open http://127.0.0.1:8090/pages/driver.html
```

### Syntax Validation
```bash
node -e "const fs=require('fs'); new Function(fs.readFileSync('js/location-watchdog.js','utf8')); console.log('OK')"
```

### GitHub Pages
Push to `main` branch -> auto-deploys. All paths are relative.

---

## Quick Start for AI Agents

1. Read `AGENTS.md` in project root — mandatory rules
2. Read this document for full context
3. Check `CHANGELOG.md` for recent changes
4. Start server: `npx http-server . -p 8090`
5. Begin with: `js/location-watchdog.js` (new file, no dependencies to break)
6. Test in browser: `http://127.0.0.1:8090/pages/driver.html`
7. Update CHANGELOG.md before finishing

CAUTION: NEVER modify `js/firebase-config.js` or the Firebase sync engines. The Zone Bundle architecture is critical for cost control.
