# 📋 CHANGELOG — DRISHYTOX / APARA

All notable changes to this project will be documented in this file.

> **⚠️ RULE:** Every contributor MUST add an entry here before pushing or merging.
> See [CONTRIBUTING.md](CONTRIBUTING.md) for the format and rules.

---

## [Unreleased]

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
