# 📋 CHANGELOG — DRISHYTOX / APARA

All notable changes to this project will be documented in this file.

> **⚠️ RULE:** Every contributor MUST add an entry here before pushing or merging.
> See [CONTRIBUTING.md](CONTRIBUTING.md) for the format and rules.

---

## [Unreleased]

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
