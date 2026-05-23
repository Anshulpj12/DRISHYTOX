# 📋 CHANGELOG — DRISHYTOX / APARA

All notable changes to this project will be documented in this file.

> **⚠️ RULE:** Every contributor MUST add an entry here before pushing or merging.
> See [CONTRIBUTING.md](CONTRIBUTING.md) for the format and rules.

---

## [Unreleased]

### 📝 Fixed Offline SOS Provider/Shop Visibility & Leaflet Crash Prevention — 2026-05-23

**Contributor:** Anshul Prajapati (@Anshulpj12)
**AI Assistant:** Claude Opus 4.6 (Thinking)

| Category | Before | After |
|---|---|---|
| Offline Boot Position | Defaulted to center of India (20.5937°N, 78.9629°E) — no cached zone data there, SOS list always empty | Restores driver's actual last known GPS coordinates from `localStorage` (`apara_last_known_pos`) |
| Leaflet CDN Failure | `L is not defined` ReferenceError crashes all JavaScript execution, breaking SOS, marketplace, and settings | Graceful `typeof L` guards in `initMap()` and `initMktMap()` show "Map unavailable offline" placeholder |
| Fallback GPS | `startFallbackGPS()` always overwrote position with center-of-India default | Now preserves restored position; only uses default if no position was ever saved |
| Map Init Safety | `startGPSTracking()` called `initMap()` without error handling | Wrapped in `try-catch` so GPS tracking starts even if map fails |
| Position Persistence | GPS position was only held in memory (`state.lastKnownPos`) | Every `onGPSUpdate()` now persists coordinates to `localStorage` for next boot |

**Why:** When a driver loses internet connectivity on a highway (dead zone, tunnel, rural area), the cached 100km zone data containing providers and shops was inaccessible because: (1) the position defaulted to India's center where no zone data exists, and (2) Leaflet's CDN failure crashed all downstream JavaScript. This fix ensures SOS provider lists populate from cached data regardless of network state.

**Files Changed:**
- `pages/driver.html` — Added position restore on startup, position persistence in `onGPSUpdate`, Leaflet availability guards in `initMap`/`initMktMap`, try-catch in `startGPSTracking`, conditional fallback default
- `context/offline_location_watchdog.md` — Added sections D (Startup Position Restoration) and E (Safe Leaflet Map Decoupling) to Section 4

### 📝 Added Mandatory Rule for Feature Context Documentation — 2026-05-23

**Contributor:** Anshul Prajapati (@Anshulpj12)
**AI Assistant:** Gemini Antigravity (Gemini 3.5 Flash)

| Category | Before | After |
|---|---|---|
| AI Agent Rules | No codified requirement for context-file documentation of new features | Codified RULE 8: Feature Context Files, making it mandatory to create/update detailed markdown files inside `context/` for any new features or on-demand |
| Project Structure | `context/` folder not officially listed in `AGENTS.md` | Listed `context/` folder as a critical folder in Project Structure Reference |

**Why:** To ensure that all new features and major components are thoroughly documented by AI assistants, keeping modular architectural guides up-to-date and maintaining absolute clarity on workings and usage.

**Files Changed:**
- `AGENTS.md` — Added RULE 8 for Feature Context Files and updated Project Structure Reference.

### 📝 Documented Advanced Cockpit Subsystems & Secondary Engines — 2026-05-22

**Contributor:** Anshul Prajapati (@Anshulpj12)
**AI Assistant:** Gemini Antigravity

| Category | Before | After |
|---|---|---|
| Advanced Cockpit Docs | Secondary driver systems like Voice SOS, OBD-II Bluetooth, Screen Wake Lock, and GPS Retro-Generation were not documented in the context guides | Created a comprehensive new guide detailing Voice SOS accelerometer triggers, Indian speech optimizations, OBD-II GATT Bluetooth, Screen Wake Lock visible loops, and recovery vector projections |

**Why:** Rigorous analysis showed that secondary driver cockpit engines were missing from the context folder, necessitating a dedicated architectural spec to ensure thorough feature coverage.

**Files Changed:**
- `context/advanced_cockpit_subsystems.md` — [NEW] Complete guide for Shock Voice SOS, OBD-II Bluetooth, Wake Locks, Retro-Gen, and Parked Mode.
- `docs/APARA_FEATURE_ARCHITECTURE.md` — Added Section 7 detailing secondary low-level cockpit systems and auxiliary triggers.

### 📝 Documented Driver Proximity Map & Active SOS Responders — 2026-05-22

**Contributor:** Anshul Prajapati (@Anshulpj12)
**AI Assistant:** Gemini Antigravity

| Category | Before | After |
|---|---|---|
| Proximity Mapping Docs | Map documentation did not cover driver-side active provider markers | Added complete documentation of Leaflet-based driver proximity map, covering color coding, proximity queries, Haversine filters, and direct-call anchors |

**Why:** The user requested to document the driver-side Leaflet proximity map showing active shops and nearby emergency service providers in the context files.

**Files Changed:**
- `context/driver_telemetry_hud.md` — Added Section 7 detailing visual color coding, discovery queries, and invalidation guards for the driver's Leaflet HUD map.
- `context/marketplace_and_shops.md` — Added Section 5 detailing integration, styling, and popup structures of active commercial shops and SOS responders.
- `docs/APARA_FEATURE_ARCHITECTURE.md` — Added Section 5.5 specifying the architectural pipeline, geodesic filters, and UI safeguards for active driver SOS mapping.

### 📝 Created Contextual Feature Architecture Guides — 2026-05-22

**Contributor:** Anshul Prajapati (@Anshulpj12)
**AI Assistant:** Gemini Antigravity

| Category | Before | After |
|---|---|---|
| Platform Feature Documentation | Missing detailed modular feature blueprints | Implemented comprehensive guides covering Driver HUD telemetry, Provider maps, Shop OTP flow, Admin console control, Landing Page presentation, and Offline Test Harness simulations |

**Why:** The user requested separate, highly detailed feature guides in a dedicated `context/` folder. These files have been expanded to include precise triage mathematical formulas, transport recommendations, clinical risk predictors, landing page bento layouts, and background Firebase fallback polling sync models.

**Files Changed:**
- `context/driver_telemetry_hud.md` — [NEW] Detailed guide covering Driver mobile portal layouts, HUD telemetry indicators, HTML5 DeviceMotion shock thresholds, speech recognition triggers, and location watchdog integrations.
- `context/provider_shop_dashboards.md` — [NEW] Detailed guide covering Provider Emergency Lookup, Leaflet dynamic maps, Shop catalog sync flow with FAB triggers, and security OTP verification.
- `context/admin_control_center.md` — [NEW] Detailed guide covering Admin dashboard metrics, Chart.js templates, database backup JSON/CSV streams, and configuration version pushing.
- `context/testing_and_diagnostics.md` — [NEW] Detailed guide covering the Offline Test Harness sandbox iframe structure, Geolocation and Permission mocking with Object.defineProperty, and auto-login velocity vectors.
- `context/landing_page_portal.md` — [NEW] Detailed guide covering visual presentation layout, Tailwind configs, 12-column Bento Grid structure, counter setInterval animations, and scroll viewport triggers.
- `context/road_sos_triage.md` — Extended to cover the exact severity score algebraic equation ($S$), priority transport recommendations matrix, and clinical risk hazard predictors.
- `context/firebase_data_sync.md` — Extended to cover the technical push version sync via Realtime Database and the 30-minute Cloud Firestore fallback polling loop.

### 📝 Fixed Dispatch Map & SOS Code Decoding in Provider Dashboard — 2026-05-21

**Contributor:** Anshul Prajapati (@Anshulpj12)
**AI Assistant:** Gemini Antigravity (Claude Opus 4.6 Thinking)

| Category | Before | After |
|---|---|---|
| SMS Coordinate Parsing | Only matched `Loc:` keyword | Matches `Loc:`, `Coords:`, and `Location:` keywords |
| Google Maps URL | Single URL pattern only | Handles multiple Google Maps URL formats |
| Block Code Extraction | Failed on `Code: XX-NNN-TTT` prefix | Strips `Code:` prefix correctly |
| Lookup Map Init | Leaflet race condition — map often blank | Uses `requestAnimationFrame` + double `invalidateSize()` |
| Dispatch Map | Only showed driver marker | Shows driver (red) + provider (blue pulsing dot) with auto-fit bounds |
| Provider GPS | No GPS tracking for provider | Starts `watchPosition` on login, updates dispatch map in real-time |
| Provider on Lookup Map | Not shown | Blue dot shows provider's location alongside driver marker |
| Map Bounds | Fixed zoom level | Auto-fits to show both driver and provider positions |
| Debug Logging | No parsing debug output | Console logs raw input and parsed data for debugging |
| Error Handling | No try-catch — `BlockCodeEncoder.decode()` and `Store.getSOSEvents()` crashed silently killing entire function | Full try-catch wrapping with visible error UI, safe `typeof` guards on all external deps |

**Why:** When pasting an SOS code with coordinates and clicking "Decode Location", the map didn't render because `BlockCodeEncoder` and `Store` calls crashed silently with no error handling, killing the entire `lookupSOSCode()` function before it could render the result card or map. Added comprehensive try-catch at 3 levels (global, BlockCodeEncoder, Store) plus `typeof` guards.

**Files Changed:**
- `pages/provider.html` — Added provider GPS tracking (`startProviderGPS()`), fixed `lookupSOSCode()` with 3-level try-catch error handling (global + BlockCodeEncoder + Store), safe `typeof` guards on external dependencies, coordinate extraction (Loc/Coords/Location keywords, Code: prefix, multiple Maps URL formats), rewrote `showLookupMap()` with `requestAnimationFrame` and provider blue dot, enhanced `renderDispatch()` map with dual markers and live provider tracking
- `docs/APARA_FEATURE_ARCHITECTURE.md` — [NEW] Complete Feature Architecture & Workflow Blueprint detailing all 6 primary core system engines, grid partitioning math, warning modals, and cost-control synchronization strategies.

### 📝 Apex Tactical HUD — Full Driver App Visual Redesign — 2026-05-19

**Contributor:** Anshul Prajapati (@Anshulpj12)
**AI Assistant:** Gemini Antigravity

| Category | Before | After |
|---|---|---|
| Background | Flat `var(--bg-deep)` solid color | Volumetric lighting with radial cyan spotlight + orange glow + subtle scanline overlay |
| Glass Panels | Basic `rgba(255,255,255,0.03)` flat cards | Heavy glassmorphism with `blur(12-32px)`, inner bevel `border-top`, radial gradient overlays |
| Color Palette | CSS variable-based (muted tones) | Direct neon palette: `#00e5ff` cyan, `#F97316` orange, `#fbbf24` amber, `#00e5ff` glow halos |
| Text Shadows | Minimal | Multi-layer neon text-shadow on block IDs, speed, SOS codes, countdown timers |
| SOS Button | Basic pulsing box-shadow | Sonar ripple halo animation with inner glass shine overlay (`::before`) |
| Login Screen | Flat card with basic gradient | Volumetric spotlight cone + heavy blur card (32px) + gradient border-top bevel |
| GPS Coordinates | Static muted pill | Pulsing cyan border animation (`coordsPulse`) with neon cyan text |
| Speed Display | 3.5rem weight 800 | 4rem weight 900 with subtle white text-shadow glow |
| Nav Bar | Flat active state | Radial gradient glow + animated dot indicator + icon drop-shadow on active |
| SOS Categories | Flat cards | Glass cards with `::before` radial overlay + inner glow on selection |
| Voice SOS | Basic overlay | Cinematic overlay with saturated blur (120%) + larger mic (110px) + 100px outer glow |
| Watchdog Modal | Basic alert | Cinematic glass panel with 80px red glow halo + enhanced timer text-shadow |
| Toast | Basic glass | Elevated glass with cyan border tint + deeper shadow |
| Batch Progress | Basic cyan-green gradient | Tri-color gradient (cyan → teal → purple) with glow shadow |

**Why:** Complete visual overhaul to achieve a premium $1M sci-fi tactical HUD aesthetic. Every panel uses heavy glassmorphism with backdrop blur, inner bevels, and volumetric light effects. The design creates a cockpit/command center feel while preserving 100% of existing functionality.

**Files Changed:**
- `pages/driver.html` — Complete CSS rewrite (350+ lines): new background effects with volumetric gradients and scanlines, glassmorphic info boxes with radial overlays, neon text-shadow system, sonar pulse SOS animation, upgraded login/nav/overlay/watchdog styles. All class names and JS hooks preserved — zero functional changes.

### 📝 SOS Copy + Provider Decode Fix — 2026-05-19

**Contributor:** Anshul Prajapati (@Anshulpj12)
**AI Assistant:** Gemini Antigravity

| Category | Before | After |
|---|---|---|
| Copy SOS Code | Copied only 8-char block code (no coordinates) | Copies full packet with embedded GPS coordinates, Maps link, PIN |
| Provider Input | Single-line `<input>` (80 char max, strips newlines) | Multi-line `<textarea>` (500 char max, preserves full SMS body) |
| Provider Decode | Failed on multi-line SMS paste (coordinates on separate lines) | Pre-extracts Loc:, Maps URL, and PIN from full body before parsing |

**Why:** When copying the SOS code from driver app, only the short block code was copied (e.g. `CE512ACC`) which doesn't contain GPS coordinates. The provider couldn't decode location from this. Now the copy function builds and copies the full pipe-separated packet with embedded coordinates, and the provider's decoder handles multi-line SMS body pastes correctly.

**Files Changed:**
- `pages/driver.html` — Rewrote `copySOSCode()` and `copyBannerSOSCode()` to build full decodable packets with coordinates
- `pages/provider.html` — Changed input to textarea for multi-line paste, enhanced `lookupSOSCode()` with pre-extraction of Loc/Maps/PIN from full SMS body

### 📝 Clean Single-Line SOS Packet — 2026-05-20

**Contributor:** Anshul Prajapati (@Anshulpj12)
**AI Assistant:** Gemini Antigravity

| Category | Before | After |
|---|---|---|
| Copy format | Multi-line SMS with Loc:, PIN:, Maps: lines | Single line: `APARA SOS code\|TYR\|18:29:54\|23.1314,79.9215\|conf:92` |
| Provider decode | Needed multi-line parsing + Loc: extraction | Strips `APARA SOS ` prefix → pipe parser extracts coordinates directly |
| Server dependency | None (but format was complex) | None — 100% offline. Driver embeds GPS, provider reads coordinates |

**Why:** Driver is offline when generating SOS. The code should be a clean single line with embedded coordinates that the provider (who has internet) can paste and instantly see the location on a map. No server lookup needed.

**Files Changed:**
- `pages/driver.html` — Simplified `copySOSCode()` and `copyBannerSOSCode()` to produce single-line packet
- `pages/provider.html` — Added `APARA SOS ` prefix stripping in `lookupSOSCode()`

### 📝 Provider Unified Decode + Driver Paginated Providers — 2026-05-20

**Contributor:** Anshul Prajapati (@Anshulpj12)
**AI Assistant:** Gemini Antigravity

| Category | Before | After |
|---|---|---|
| Provider decode sections | Two separate decode UIs (Lookup tab + Dispatch tab) | Single unified Lookup tab handles all formats |
| Provider map after decode | Map failed to render (race condition + no invalidateSize) | Reusable `showLookupMap()` with proper cleanup, delay, and invalidateSize |
| Block code Format 2 | Switched to Dispatch tab, different UI | Decodes inline in Lookup tab with full map |
| Driver provider list | Static top-5, no pagination | Paginated (5 at a time) with "Show More" button |
| Driver radius expansion | Auto-expanded only if zero results | Manual "Expand to 100km" button always available |

**Why:** Provider had two confusing decode sections (Dispatch tab's `bcDecodeInput` + Lookup tab's `lookupCodeInput`). Merged into one. Map wasn't rendering because of Leaflet race conditions. Driver needed pagination and manual radius control.

**Files Changed:**
- `pages/provider.html` — Removed duplicate decode section from Dispatch tab, added `showLookupMap()` helper, made Format 2 decode inline in Lookup tab
- `pages/driver.html` — Added `renderSOSProviderPage()` with pagination, `showMoreSOSProviders()`, `expandSOSRadius()` for manual 100km expansion



**Contributor:** Anshul Prajapati (@Anshulpj12)
**AI Assistant:** Gemini Antigravity

| Category | Before | After |
|---|---|---|
| Road SOS Button | Opens `road-sos.html` (full first-aid triage) | Opens inline provider search with radius control |
| Provider Search | No local provider search for drivers | Searches cached zones + local providers within adjustable radius (10-100km) |
| Provider Sorting | N/A | Shows user's SOS type matches FIRST (green "MATCH" badge), then others by distance |
| Pagination | N/A | Shows 5 providers at a time with Next/Prev buttons |
| SMS Pre-fill | Manual SMS composition | One-tap "📱 SMS" opens native SMS with pre-filled SOS code + coordinates + Maps link |
| Radius Control | No UI control | ± buttons to adjust: 10km → 25km → 50km → 100km |
| Provider Map (provider.html) | Falls back to India center (20.5937, 78.9629) when coords missing | Shows "LOCATION NOT FOUND" error with guidance instead of wrong location |
| Provider Lookup (8-char codes) | Could not decode 8-char codes in pipe-packets | Now decodes 8-char block codes + extracts coords from Google Maps links |
| First Aid Access | Only via Road SOS button | Accessible from "🩺 Need First Aid? → Open" banner inside Road SOS screen |
| Call 112 | Hidden | Always visible as fixed bottom button on Road SOS screen |

**Why:** Drivers needed a quick way to find and SMS nearby emergency providers without navigating away from the app. The provider dashboard was showing incorrect locations (India center) when coordinates were missing from pasted codes. This change adds full local provider search with category-priority sorting, pagination, and one-tap SMS dispatch.

**Files Changed:**
- `pages/driver.html` — Renamed Road SOS button; added `#screenRoadSOS` screen with GPS chip, radius selector, provider cards, pagination, 112 call button, first-aid banner; rewrote `openRoadSOS()` to search local providers; added `searchRoadSOSProviders()`, `renderRoadSOSPage()`, `roadSosPage()`, `adjustRoadSOSRadius()`, `openFirstAidGuide()`, `closeRoadSOS()`
- `pages/provider.html` — Fixed `lookupSOSCode()` to decode 8-char block codes in pipe-packets; added Google Maps link extraction; replaced India-center fallback with "LOCATION NOT FOUND" error UI

### 📝 SOS System Refinements — Unified Block Code, Provider SMS, First Aid UX — 2026-05-17

**Contributor:** Anshul Prajapati (@Anshulpj12)
**AI Assistant:** Gemini Antigravity

| Category | Before | After |
|---|---|---|
| First Aid Auto-Open | Auto-opens with 4s countdown after SOS sent | Manual "Open →" button only — no forced auto-open |
| First Aid Navigation | No back button on Guidance (Screen 5) and Active Status (Screen 6) | ← BACK buttons added on both screens |
| Provider Block Code | Shows two separate codes: raw `blockCode` + `packet` | Shows ONE unified packet with embedded coordinates |
| SOS Packet Format | `blockCode\|typeCode\|time\|conf:N` (no coordinates) | `blockCode\|typeCode\|time\|lat,lng\|conf:N` (coordinates embedded) |
| SMS Target | Falls back to 112 when no provider within 10km | Extends search to 100km zone bundle; 112 is absolute last resort |
| Provider Lookup | Two separate inputs (8-char code + legacy packet) | Single unified input accepts ALL formats: pipe packets, block codes, 8-char codes |
| Provider Lookup Parse | Could not extract coordinates from pasted packets | Auto-detects and extracts embedded coordinates from any format |
| SMS Body | Sends 8-char code only | Sends full unified packet with coordinates + Google Maps link |
| Provider Dispatch | Shows duplicate `blockCode` in multiple places | Shows only the unified packet code everywhere consistently |

**Why:** Emergency providers were confused by seeing multiple code formats. Drivers could not find nearby providers when none were within 10km. First aid auto-opening was disruptive during SOS triage. These changes unify the code format, improve provider lookup, and give drivers control over the first aid flow.

**Files Changed:**
- `js/data.js` — SOSPacket.build() now embeds GPS coordinates in packet string as 4th field
- `pages/driver.html` — Removed first aid auto-open countdown; added 100km extended provider search; updated SMS body to include unified packet with coordinates; banner SMS uses nearest provider phone
- `pages/road-sos.html` — Added ← BACK buttons on Screen 5 (Guidance) and Screen 6 (Active Status) headers
- `pages/provider.html` — Alert list shows unified packet; detail view shows ONE code format with Google Maps link; removed separate `blockCode` display; dispatch card shows packet; unified lookup function handles all formats (pipe packets, block codes, 8-char); removed legacy lookup input/button



### 📝 Premium Problem-Focused Landing Page Redesign — 2026-05-17

**Contributor:** Soniya Meena (@SoniyaMeena)
**AI Assistant:** Gemini Antigravity

| Category | Before | After |
|---|---|---|
| Focus | Technical specs (hashes, latency) | Problem-solving scenarios (Dead zones, lost hikers) |
| UI Interactivity | Basic glowing cards | Deeply scrollable, cinematic 3D feel with reveal-on-scroll |
| Feature Cards | Static | Hover-tilt animations with expandable `<details>` views |
| Visual Depth | Flat blurs | Advanced optical refraction, 1px ghost borders, dynamic gradients |

**Why:** To create a highly immersive, premium AI startup aesthetic that focuses on the human impact of the DRISHYTOX platform rather than raw technical jargon.

**Files Changed:**
- `index.html` — Fully regenerated with Stitch MCP for a deeply futuristic layout, integrated reveal-on-scroll Javascript, and re-added live counter IDs.
### 📝 Redesigned Landing Page with Stitch MCP — 2026-05-17

**Contributor:** Soniya Meena (@SoniyaMeena)
**AI Assistant:** Gemini Antigravity

| Category | Before | After |
|---|---|---|
| Landing Page UI | Basic HTML/CSS with standard styling | Fully redesigned, highly futuristic, 3D interactive, glassmorphic layout |
| Design Assets | No centralized design system for index | Migrated to APARA Tactical Design System (Stitch MCP) with dark multiverse theme |
| Visual Components | Static counters and simple hero section | Animated 3D HUD radar, glowing cards, pipeline timeline, and dynamic tech readouts |

**Why:** To ensure the landing page reflects the mission-critical, high-tech nature of the APARA DRISHYTOX platform and wows users with a premium, animated, and professional experience, matching the brand's aesthetic.

**Files Changed:**
- `index.html` — Completely replaced the UI structure with the Stitch-generated HTML/CSS while preserving the `js/data.js` script and live counter logic.

### 📝 Location Watchdog + Auto-SOS Emergency System — 2026-05-16

**Contributor:** Anshul Prajapati (@Anshulpj12)
**AI Assistant:** Gemini Antigravity

| Category | Before | After |
|---|---|---|
| Auto-SOS | No automatic emergency detection | Full watchdog: GPS-off detection (5min) + stationary detection (5min) + 60s countdown → auto-SMS |
| Block Code Format | 11-char `RR-NNN-TTT` only | 15-char `RR-NNN-TTT-RRRR` with reason codes (GOFF, STAT, NRSP, MANU, AUTO, FALL) |
| Driver UI | No safety warning modals | Glassmorphic warning modal with countdown timer + STAY/START parked mode banner |
| Provider Decode | Basic 11-char decoder, no map | Enhanced decoder supports 15-char codes, shows reason labels, map pin, and one-tap dispatch |
| GPS Tracking | No state change events | GPSTracker emits GPS on/off events, tracks movement >50m, saves last position to localStorage |
| SMS Target | No auto-SMS dispatch | Auto-sends SOS to nearest provider phone numbers from locally-cached data |

**Why:** Drivers on Indian highways can become unconscious, unresponsive, or lose GPS in dead zones. This watchdog system autonomously detects danger and auto-dispatches emergency SMS to nearby providers — even when offline.

**Files Changed:**
- `js/location-watchdog.js` — [NEW] Core watchdog engine: state machine (DRIVING→STAT_WARN→PARKED/SOS_SENT), GPS-off and stationary detection, auto-SMS dispatch
- `js/block-code-encoder.js` — Added `encodeWithReason()`, `decodeWithReason()`, `getOfflineEstimatedCode()`, 15-char format support, reason code dictionary
- `js/data.js` — Added GPSTracker: `_isGPSActive`, `_gpsLostTime`, `_gpsStateListeners`, `_lastMovementPos/Time`, `onGPSStateChange()`, `isStationary()`, `isGPSActive()`, movement detection in `_processRawPosition()`, localStorage position save
- `pages/driver.html` — Added watchdog modal HTML/CSS, parked banner, script imports (block-code-encoder, sos-provider-engine, location-watchdog), `initWatchdog()`, `watchdogSafe()`, `watchdogSOS()`, `resumeDriving()`
- `pages/provider.html` — Enhanced block decoder: 15-char support, reason labels, inline map with Leaflet, one-tap dispatch, updated Lookup tab to route dash-codes to enhanced decoder
- `AI_AGENT_CONTEXT.md` — [NEW] Complete AI agent handoff document

### 📝 Fixed Condition Grid Not Rendering — Temporal Dead Zone Bug — 2026-05-16

**Contributor:** Anshul Prajapati (@Anshulpj12)
**AI Assistant:** Gemini Antigravity

| Category | Before | After |
|---|---|---|
| Condition Cards | 0 cards visible — grid completely empty | All 22 injury conditions render correctly |
| Quick Chips | Not showing (ALL, BRAIN, AIRWAY, etc.) | 9 category filter chips render and function |
| Screen 2.5 (Context) | PAIN_LEVELS error — context screen broken | Pain, accident type, and damage selectors work |
| Root Cause | `const`/`let` declarations AFTER boot IIFE — temporal dead zone | All constants moved BEFORE boot IIFE |

**Why:** The boot function was an IIFE (Immediately Invoked Function Expression) that ran at script parse time. It called `buildQuickChips()`, `renderCondGrid()`, and `initScreen25()`, which all referenced `const`/`let` variables (`CHIP_CATS`, `searchQuery`, `PAIN_LEVELS`, `ACCIDENT_TYPES`, `CTX_FLAGS`, `DAMAGE_LEVELS`) that were declared AFTER the IIFE. JavaScript's temporal dead zone prevents accessing `const`/`let` before their declaration line, causing silent `ReferenceError`s that crashed all three functions.

**Files Changed:**
- `pages/road-sos.html` — Moved all `const`/`let` variable declarations (CHIP_CATS, activeChip, searchQuery, PAIN_LEVELS, ACCIDENT_TYPES, CTX_FLAGS, DAMAGE_LEVELS) from after the boot IIFE to before it, resolving the temporal dead zone

### 📝 Road SOS — Instant Condition Detail Panel + Body Map Fix — 2026-05-14

**Contributor:** Anshul Prajapati (@Anshulpj12)
**AI Assistant:** Gemini Antigravity

| Category | Before | After |
|---|---|---|
| Condition Selection | Selecting a condition only added a checkmark — no info shown | Selecting a condition instantly shows a rich detail panel with protocol steps, DO NOT warnings, timers, and medical source citations |
| Body Map Size | Body map was 340px tall, pushing condition grid off-screen on mobile | Reduced to 200px — conditions are now visible without scrolling |
| Protocol Data | JSON dataset protocols were loaded but never displayed to the user | Protocols from `road_sos_system.json` are now rendered with step-by-step cards when any condition is tapped |
| CSS Bug | `~` sibling selector colored ALL body region labels when one was selected | Fixed to `+` adjacent sibling selector — only the selected region's label is highlighted |
| Comm Chips | SMS chip `<a>` tag had underline decoration | Added `text-decoration: none` to `.comm-chip` |

**Why:** Users could not see any treatment details, prevention info, or "what to do" steps after selecting body parts and conditions. The full dataset was being loaded but never displayed. Now tapping any condition immediately shows the complete protocol.

**Files Changed:**
- `pages/road-sos.html` — Added `#condDetail` panel div, `showCondDetail()` function that renders JSON protocol data with steps/warnings/sources
- `css/sos.css` — Added `.cond-detail-panel` styles (header, steps, DO NOT warnings, source citations), reduced body map height, fixed CSS sibling selector bug

### 📝 Road SOS — Phases 2, 3 & 4: Context Screen, GPS Safety, Provider Dispatch — 2026-05-13

**Contributor:** TejaswiniKhelkar
**AI Assistant:** Gemini Antigravity

| Category | Before | After |
|---|---|---|
| Injury Context | Conditions selected, no additional context | Screen 2.5 with pain level (0–4), accident type grid, contextual flags, passenger count stepper, vehicle damage selector |
| Triage Output | Priority P1-P4 + treatment list | + Severity score (0–100), transport recommendation (ALS/BLS/Self), risk escalation predictions |
| Voice Guidance | Auto-speak in English only | Toggleable TTS with EN/HI/TA language selector |
| Location Encoding | Basic SOS code | Block Code Encoder (RR-NNN-TTT format) with encode/decode + SMS pre-fill |
| GPS Safety | Basic GPS tracking | Route history cache (1000 pts), sync queue, sudden stop detection (>20→0 km/h in 3s), immobility detector (5 min stationary), GPS-off monitor with 60s countdown popup |
| Communication | SOS broadcast only | SMS pre-fill (`sms:` URI), V2V relay, Firebase push notification, offline message queue, Bluetooth mesh placeholder |
| Provider Dispatch | Manual alert review only | SOSProviderEngine with automatic nearest-provider matching (100km), priority dispatch scoring, Block Code decoder panel |
| Offline Support | Basic localStorage | Response caching, offline message queue with auto-flush on reconnect, GPS sync queue |

**Why:** To complete the ROADMAP_SOS.md remaining phases — giving emergency responders richer context data for better triage decisions, ensuring driver safety through automated GPS monitoring, and enabling multi-channel emergency communication including offline scenarios.

**Files Changed:**
- `road_sos_system.json` — Added `emergency_response_metadata` section (symptoms, pain levels, accident types, flags, transport recommendations)
- `css/sos.css` — Added 550+ lines: Screen 2.5 components, safety overlays, provider dispatch panel, communication chips
- `js/sos-protocols.js` — Enhanced `SOSTriageEngine.calculatePriority()` with context data; added `calculateSeverityScore()`, `getTransportRecommendation()`, `getRiskEscalation()`
- `js/block-code-encoder.js` — [NEW] Block Code Encoder/Decoder (RR-NNN-TTT format) with SMS message builder
- `js/sos-provider-engine.js` — [NEW] Emergency dispatch engine with provider matching, priority dispatch, offline message queue
- `js/data.js` — Added GPSRouteCache, GPSSyncQueue, SuddenStopDetector, SafetyMonitor, ImmobilityDetector modules
- `pages/road-sos.html` — Added Screen 2.5 HTML/JS, enhanced Screen 4 triage, TTS + language toggle on Screen 5, communication module on Screen 6
- `pages/provider.html` — Added Emergency Dispatch panel with Block Code decoder, dispatch engine alert list

### 📝 Phase 1: Interactive Body Map & Search UI — 2026-05-13

**Contributor:** Anshul Prajapati (@Anshulpj12)
**AI Assistant:** Gemini Antigravity

| Category | Before | After |
|---|---|---|
| Injury Selection | Flat static grid of 22 conditions | Interactive SVG body map with 11 regions |
| Filtering | Hardcoded category tabs | Search bar (fuzzy match) + category chips |
| Visuals | Basic cards | Enhanced cards with severity indicators (P1-P4) |
| Architecture | Basic UI mapping | Added `BodyMapEngine` and `SearchEngine` |

**Why:** To allow users to select injuries faster during panic situations by visually tapping the affected body area rather than reading through a long list.

**Files Changed:**
- `ROADMAP_SOS.md` — [NEW] Added master roadmap file for AI agents
- `css/sos.css` — Added body map, search, and enhanced card styles
- `js/sos-protocols.js` — Added `BodyMapEngine` and `SearchEngine`
- `pages/road-sos.html` — Replaced Screen 2 with new 3-panel layout (body map, search, grid)


### 📝 Road SOS — Full Triage Coverage + Multi-Injury Combos — 2026-05-12

**Contributor:** Anshul Prajapati (@Anshulpj12)
**AI Assistant:** Gemini Antigravity (Claude Opus)

| Category | Before | After |
|---|---|---|
| Combo Rules | 20 rules, 5 orphaned conditions | 72 rules — every condition + 50 multi-injury pairs |
| Treatment Protocols | 11 protocols | 14 protocols (added eye injury, allergic reaction, crush injury) |
| Coverage Gaps | crush_injury, trapped, dizziness, eye_injury, allergic had 0 treatments | 100% coverage — every selectable condition produces guidance |
| Multi-Injury | Only 6 two-condition combos | 6 triple-combos + 44 two-condition combos for real road accidents |

**Why:** Users selecting conditions like eye injury, allergic reaction, crush injury, or dizziness got an empty triage result with 0 treatments. Now every condition and common multi-injury combination produces correct prioritized first-aid guidance.

**Files Changed:**
- `js/sos-protocols.js` — Added 3 new treatment protocols, expanded combo rules from 20 to 72, added orphan conditions to existing treatment forConditions



**Contributor:** Anshul Prajapati (@Anshulpj12)
**AI Assistant:** Gemini Antigravity

| Category | Before | After |
|---|---|---|
| Stitch Design Coverage | Screen 1 (Activation) only | All 6 screens designed (Activation, Condition Selection, Assessment, Triage Result, Step Guidance, Active Status) |
| Design Assets | Single activation screen | Full cinematic HUD flow with glassmorphic cards, LED progress bars, and red volumetric glows |

**Why:** Completed the full Stitch Tactical Emergency Design System reference set for all 6 Road SOS screens so developers and stakeholders can see the complete UI flow before implementation.

**Files Changed:**
- `pages/road-sos.html` — Reference implementation for all 6 screens (existing)
- Stitch Project `3251675908950809849` — 5 new screens added: Screen 2 (Condition Selection), Screen 3 (Assessment), Screen 4 (Triage P1), Screen 5 (CPR Step Guidance), Screen 6 (Active SOS Status)



### 📝 Road SOS — Intelligent Emergency Response & First-Aid System — 2026-05-11

**Contributor:** Anshul Prajapati (@Anshulpj12)
**AI Assistant:** Gemini Antigravity

| Category | Before | After |
|---|---|---|
| Emergency Flow | Simple SOS: select category → hold → send SMS | Full 6-screen triage: activate → select injuries → assessment → priority → step-by-step guidance → active status |
| Medical Guidance | None — just sends location to provider | Rule-based first-aid engine with 22 conditions, 11 treatment protocols, DO NOT warnings |
| Injury Selection | Single category (Accident/Tow/Tyre/Fuel) | Multi-select with body-region categories, severity indicators, 30+ conditions from JSON |
| Assessment | None | ABCDE-based triage: consciousness, breathing, pulse, bleeding, movement checks |
| First Aid Steps | None | Step-by-step cards with timers, voice readout (TTS), warnings, and progress tracking |
| Offline Support | SOS required GPS only | Full protocol engine embedded — works 100% offline, no LLM dependency |
| UI Design | N/A | Stitch Tactical Emergency Design System — sonar SOS button, LED bars, JetBrains Mono, glassmorphic HUD |
| Auto-open | N/A | Road SOS auto-opens 4s after SOS SMS sent with countdown banner + cancel option |

**Why:** Accident victims and bystanders need guided first-aid instructions, not just location sharing. This system provides deterministic, medically-reviewed protocols (AHA/Red Cross/ILCOR) with panic-optimized large-button UI. Auto-open ensures first-aid begins immediately after SOS dispatch.

**Files Changed:**
- `js/sos-protocols.js` — [NEW] Rule-based medical guidance engine (conditions, assessments, priority scoring, treatments)
- `css/sos.css` — [NEW] Stitch Tactical Emergency Design System — sonar button, LED progress bars, volumetric bg glow
- `pages/road-sos.html` — [NEW] Full 6-screen emergency interface — redesigned with Stitch design tokens
- `pages/driver.html` — Added "Road SOS" button + openRoadSOS() + auto-open countdown banner after SOS send + cancelRoadSosAuto()

<!-- Add new changes here ABOVE the latest release -->

### 📝 Fixed & improved AI agent config files — 2026-05-07

**Contributor:** TejaswiniKhelkar
**AI Assistant:** Gemini Antigravity (Claude Opus 4.6 Thinking)

| Category | Before | After |
|---|---|---|
| GEMINI.md | Missing — Gemini CLI/Studio wouldn't pick up rules | ✅ Created, points to AGENTS.md |
| AI config file format | Used `#` comment syntax (unreliable as Markdown) | Proper Markdown prose with ⚠️ alert |
| AGENTS.md project structure | Missing CLAUDE.md, GEMINI.md, .cursorrules, copilot-instructions.md | All AI config files listed |

**Why:** AI config files (`.cursorrules`, `CLAUDE.md`, `copilot-instructions.md`) were using `#` comment syntax which some tools might skip. Also, `GEMINI.md` was missing entirely, so Gemini CLI/Studio wouldn't auto-read the rules. Project structure in AGENTS.md didn't document these files.

**Files Changed:**
- `GEMINI.md` — [NEW] Gemini AI pointer to AGENTS.md
- `.cursorrules` — Rewritten as proper Markdown prose
- `CLAUDE.md` — Rewritten as proper Markdown prose
- `.github/copilot-instructions.md` — Rewritten as proper Markdown prose
- `AGENTS.md` — Updated project structure to list all AI config files
- `CHANGELOG.md` — This entry

---

## [1.2.0] — 2026-05-07

### 🛰️ GPS & Mobile Reliability Overhaul

**Contributor:** Anshul Prajapati (@Anshulpj12)

| Category | Before | After |
|---|---|---|
| GPS Permission Check | Used `navigator.permissions.query()` which fails on many mobile browsers | Skipped — calls GPS API directly |
| GPS Timeout (mobile) | 8-10 seconds (too short for cold GPS) | 15-35 seconds (auto-detects mobile) |
| GPS Strategy | High-accuracy first (slow on mobile) | Low-accuracy first (cell/wifi), then upgrades to GPS |
| IP Fallback Recovery | Once IP fallback activated, GPS never retried | Background GPS retry (6 attempts over ~1 min), auto-upgrades |
| User Feedback | "Using IP-based location" (confusing) | "GPS acquiring in background..." → "✅ GPS acquired!" |
| CDN Scripts | No `crossorigin` attribute | `crossorigin="anonymous"` on all CDN scripts (Firebase, Leaflet, Chart.js) |
| JS Disabled | Blank white page | `<noscript>` fallback message |

**Files Changed:**
- `pages/driver.html` — GPS flow rewrite, CDN crossorigin, noscript fallback
- `pages/provider.html` — CDN crossorigin fixes
- `pages/shop_provider.html` — CDN crossorigin fixes
- `pages/admin.html` — CDN crossorigin fixes

---

## [1.1.0] — 2026-05-07

### 🔧 GitHub Pages Deployment Fix

**Contributor:** Anshul Prajapati (@Anshulpj12)

| Category | Before | After |
|---|---|---|
| `firebase-config.js` | Git-ignored, missing on GitHub Pages | Committed to repo (client-side key is safe) |
| All pages on GitHub Pages | Blank — JS crashed due to missing config | ✅ Fully functional |

**Root Cause:** `js/firebase-config.js` was in `.gitignore`, so it never got pushed to GitHub. Every page depends on this file — without it, `FIREBASE_CONFIG` is undefined and all JS crashes.

**Security Note:** Firebase client-side API keys are designed to be public. Security is enforced via Firebase Security Rules, not by hiding the key.

**Files Changed:**
- `.gitignore` — Removed `js/firebase-config.js` from ignore list
- `js/firebase-config.js` — Added to git tracking (new file in repo)

---

## [1.0.0] — 2026-05-06

### 🚀 Initial Platform Release

**Contributor:** Anshul Prajapati (@Anshulpj12)

- APARA Driver App with GPS tracking, SOS, V2V relay, dead zone navigation
- Provider Dashboard with SOS alert reception and dispatch
- Shop Provider Dashboard with menu management and order processing
- Admin Panel with analytics, provider/shop management, zone bundles
- Firebase Realtime Database + Firestore integration
- Tactical Horizon glassmorphic design system
- Offline-first architecture with dead reckoning positioning
- Block Registry for 1km grid immutable positioning
- Zone Bundle architecture (100km radius data download)

---

<!-- 
═══ TEMPLATE FOR NEW ENTRIES ═══
Copy this template when adding a new version:

## [X.X.X] — YYYY-MM-DD

### 📝 Short Title of Change

**Contributor:** Your Name (@GitHubUsername)

| Category | Before | After |
|---|---|---|
| What changed | Old behavior | New behavior |

**Files Changed:**
- `path/to/file` — What was changed

-->
