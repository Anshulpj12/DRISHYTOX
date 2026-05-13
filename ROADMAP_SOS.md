# 🚨 ROAD SOS — Implementation Roadmap

> **PURPOSE**: This file is the single source of truth for the Road SOS Emergency Response System expansion.
> Any AI agent or developer should read this file FIRST before doing any SOS-related work.
> If a task is marked ✅, it is DONE — do not redo it. If marked 🔲, it needs implementation.
> If marked 🔄, it is IN PROGRESS — check the code to see what's already written before continuing.

---

## 📁 Key Files

| File | Purpose |
|---|---|
| `pages/road-sos.html` | Main SOS UI — 6-screen emergency flow (activation → body map → assessment → triage → guidance → status) |
| `js/sos-protocols.js` | Rule-based triage engine, conditions, treatments, combo rules, BodyMapEngine, SearchEngine |
| `css/sos.css` | Tactical Emergency Design System — dark glassmorphic HUD aesthetic |
| `road_sos_system.json` | Master metadata: body regions, protocols, priority matrix, assessment framework, voice cues |
| `js/data.js` | GPSTracker, BlockResolver, DeadZoneHistory, NetworkDetector, SOSPacket, Store |
| `js/block-code-encoder.js` | [PLANNED] Block Code encode/decode for offline emergency location |
| `js/sos-provider-engine.js` | [PLANNED] Provider emergency dispatch engine |

---

## 🏗️ Architecture Rules (NON-NEGOTIABLE)

1. **NO LLM for medical decisions** — All triage/treatment is rule-based from medically reviewed protocols
2. **Offline-first** — Every emergency feature MUST work without internet
3. **Mobile-first** — Max-width 480px, large buttons (min 70px), 1-hand operation
4. **Panic-mode UI** — High contrast, minimal text, large tap targets, color-coded severity
5. **Design system** — Use `css/sos.css` tokens (--red, --p1-p4, --mono font, glassmorphic cards)
6. **CDN scripts** — Must have `crossorigin="anonymous"` attribute
7. **No voice input** — Skipped for now (Web Speech API has limited mobile support)

---

## 📊 Current System State

### Existing (Already Built & Working):
- ✅ 22 emergency conditions with icons, severity, categories
- ✅ 14 treatment protocols (CPR, bleeding, airway, spine, fracture, burns, shock, recovery, seizure, head injury, chest pain, eye injury, allergic reaction, crush injury)
- ✅ 72 combo rules (6 triple-combos + 44 two-condition + 22 single-condition)
- ✅ ABCDE assessment framework (5 questions: AVPU, breathing, pulse, bleeding severity, movement)
- ✅ Triage engine (`SOSTriageEngine.calculatePriority()`) — scores conditions + assessments → P1-P4
- ✅ Step-by-step guidance renderer with timers, DO NOT warnings
- ✅ GPS tracking (`GPSTracker` in data.js) with dead reckoning, speed calculation, position smoothing
- ✅ Block resolver (`BlockResolver` in data.js) with corridor mapping
- ✅ Dead zone history (`DeadZoneHistory` in data.js) with block-by-block transit profiles
- ✅ Network detection, SOS packet builder, V2V relay support
- ✅ Tactical Emergency Design System CSS (sonar SOS button, LED bars, glassmorphic cards)
- ✅ 6-screen UI flow in road-sos.html

---

## 🔄 PHASE 1: Body Map + Injury Selection UI (IN PROGRESS)

**Goal**: Replace flat condition grid with interactive SVG body map + searchable condition selector

### Status:
- ✅ **CSS** — Body map styles added to `css/sos.css` (lines 428-693):
  - `.bodymap-wrap`, `.bodymap-toggle`, `.bodymap-svg-container`
  - `.body-region` with hover/selected/pulse states
  - `.search-bar-wrap`, `.search-bar` with focus states
  - `.quick-chips` for category quick-filters
  - `.cond-btn-v2` enhanced cards with severity left-border (P1-P4 colors)
  - `.region-filter-bar` showing active body region filters
  - Responsive rules for 360px screens

- ✅ **JavaScript Engines** — Added to `js/sos-protocols.js` (lines 365-494):
  - `BodyMapEngine` — region-to-condition mapping, multi-select, front/back view toggle
  - `SearchEngine` — fuzzy substring search across condition labels, IDs, and categories

- 🔄 **HTML** — Screen 2 overhaul in `pages/road-sos.html` (NEEDS IMPLEMENTATION):
  - 🔲 Inline SVG body figure with tappable regions (front view)
  - 🔲 Inline SVG body figure (back view) with toggle
  - 🔲 Search bar with real-time filtering
  - 🔲 Category quick-filter chips (neuro, airway, cardiac, trauma, bleeding, etc.)
  - 🔲 Enhanced condition grid using `.cond-btn-v2` cards
  - 🔲 Region filter indicator bar showing selected body parts
  - 🔲 Selected conditions pill display
  - 🔲 JavaScript: wire body map clicks → filter grid, search input → filter, chip toggles

### Implementation Details for Screen 2:
```
Layout (top to bottom):
1. Header bar with "INJURY SELECTION" title + back button
2. Body Map (SVG front/back toggle) — tap regions to filter
3. Search bar — type to search conditions
4. Category chips — quick filter by injury type
5. Region filter bar — shows "Filtering: Head, Chest" with clear button
6. Condition grid (2-column) — enhanced cards with severity border + checkmark
7. Selected conditions pills — shows what's been picked
8. Navigation buttons — "Skip Assessment" and "Continue"
```

### SVG Body Map Specification:
- Width: 180px, Height: 340px (fits mobile viewport)
- Simplified human silhouette with clear region boundaries
- Regions: HEAD (circle), NECK (small rect), CHEST (rect), ABDOMEN (rect), PELVIS (trapezoid), LEFT_ARM/RIGHT_ARM (paths), LEFT_LEG/RIGHT_LEG (paths)
- BACK view: same silhouette with BACK region replacing CHEST+ABDOMEN
- Selected state: red fill (rgba(220,38,38,.2)) + red stroke + glow pulse animation
- Label text centered in each region (7px mono font)

---

## 🔲 PHASE 2: Dynamic Metadata Sections + Response Engine (NOT STARTED)

**Goal**: Add context/detail sections between condition selection and assessment, enhance triage output

### Tasks:
- 🔲 Add new Screen 2.5 "Context & Details" between condition select and assessment
- 🔲 Pain Level selector — horizontal slider (0-4) with emoji + color gradient
- 🔲 Accident Type grid — icon buttons (Head-on, Rear-end, Rollover, etc.)
- 🔲 Contextual Flags — toggle chips (Fire/Smoke, Pregnancy, Child/Elderly, Hazmat, Weather)
- 🔲 Passenger Count — stepper (1-6+)
- 🔲 Vehicle Damage — 5-level visual selector
- 🔲 Enhanced triage output: severity score (0-100), transport recommendation, risk escalation prediction
- 🔲 Response caching in localStorage for offline access
- 🔲 "Read Aloud" button with Web Speech Synthesis (TTS)
- 🔲 Multi-language voice output (en, hi, ta)

### Dataset Required:
Add `emergency_response_metadata` section to `road_sos_system.json` with:
- `symptoms` array (dizziness, nausea, blurred vision, numbness, chest tightness)
- `pain_levels` array (0-4 with labels and colors)
- `consciousness_levels` (Alert, Voice, Pain, Unresponsive)
- `accident_types` (Head-on, Rear-end, Side Impact, Rollover, etc.)
- `contextual_flags` (fire_smoke, pregnancy, child_elderly, hazmat, weather)
- `passenger_count_options` (1-6+)
- `transport_recommendations` (P1→ALS Ambulance, P2→BLS, P3→Self-drive, P4→Self-care)

---

## 🔲 PHASE 3: Offline GPS + Block Code + Safety Logic (NOT STARTED)

**Goal**: Block Code emergency location, location-disabled safety, immobility detection

### Tasks:
- 🔲 Create `js/block-code-encoder.js` — encode(lat,lng,type) → max 15-char code, decode(code) → location+type
- 🔲 Block Code format: `RR-NNN-TTT` (Region 2 + Block 3 + Type 3)
- 🔲 Enhance GPSTracker in data.js:
  - 🔲 Route history cache (1000 positions in localStorage)
  - 🔲 Sync queue for reconnection
  - 🔲 Sudden stop detection (>20km/h → 0 in 3s = potential accident)
  - 🔲 Abnormal deceleration → auto SOS prompt
- 🔲 Location Disabled Safety:
  - 🔲 Monitor GPS permission continuously
  - 🔲 If OFF >5 min → emergency popup with 60s countdown
  - 🔲 3 buttons: "I'm Safe", "Need Help", auto-SOS on timeout
  - 🔲 Generate Block Code from last known position + pre-fill SMS
- 🔲 Immobility Detection:
  - 🔲 Detect <10m movement over 5 minutes while GPS is ON
  - 🔲 Popup: "Stationary for 5 min" with Safe/Help/auto-SOS options
  - 🔲 Status states: driving, parked, emergency, unknown
  - 🔲 "Start Driving" resume button

---

## 🔲 PHASE 4: Provider Architecture + Communication (NOT STARTED)

**Goal**: Provider emergency dispatch, Block Code decoder, multi-channel SOS

### Tasks:
- 🔲 Create `js/sos-provider-engine.js`:
  - 🔲 `receiveEmergency(sosPacket)` — process incoming SOS
  - 🔲 `decodeBlockCode(code)` — decode and display location
  - 🔲 `getNearestProviders(lat, lng, radiusKm)` — filter within 100km
  - 🔲 `priorityDispatch(providers, severity)` — auto-sort by distance + capability
- 🔲 Update `pages/provider.html`:
  - 🔲 Emergency Dispatch panel with incoming SOS alerts
  - 🔲 Block Code decoder input
  - 🔲 Severity viewer with color-coded priority
  - 🔲 Emergency data cache (100km radius, stored locally)
- 🔲 Communication module in road-sos.html:
  - 🔲 SMS pre-fill via `sms:` URI (cannot auto-send, opens native app)
  - 🔲 Offline message queue (localStorage)
  - 🔲 Delayed sync batch (send when internet reconnects)
  - 🔲 Firebase push notification to providers (when online)
  - 🔲 V2V relay integration (uses existing data.js system)
  - 🔲 Bluetooth mesh — UI placeholder only ("Coming in native app")

### Emergency Message Format:
```
BLOCK_CODE | INJURY_PRIORITY | LAT,LNG | TIME | EMERGENCY_TYPE | MOVEMENT_STATE
MH-028-ACC | P1 | 18.5204,73.8567 | 15:32 | Cardiac+Bleeding | STATIONARY
```

### Provider Radius:
Uses existing Zone Bundle system (100km radius data download + local cache).
Reuses `Store.getProviders()` from data.js — no separate emergency-specific cache needed.

---

## 📝 Notes for AI Agents

1. **Before coding**: Read `AGENTS.md` for mandatory rules (CHANGELOG, CDN crossorigin, design system)
2. **Before modifying road-sos.html**: Check the screen numbering (screen1-screen6) — new screens go between existing ones
3. **Before modifying sos-protocols.js**: The `SOS_COMBO_RULES` array is order-sensitive (most specific first)
4. **Testing**: Open `pages/road-sos.html` directly in browser — it's a standalone page
5. **JSON metadata**: `road_sos_system.json` is the canonical data source but currently the JS uses hardcoded condition arrays — keep both in sync
6. **CHANGELOG.md**: MUST be updated after every code change per AGENTS.md rules
