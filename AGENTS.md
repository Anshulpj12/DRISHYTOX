# 🤖 AGENTS.md — Mandatory Rules for All AI Coding Assistants

> **This file is read by AI agents (Gemini, Copilot, Cursor, Claude, etc.) at the start of every session.**
> **These rules are NON-NEGOTIABLE. Failure to follow them is unacceptable.**

---

## 📋 RULE 1: Update CHANGELOG.md After Every Code Change

**Before finishing any session where you modified, created, or deleted code files, you MUST update `CHANGELOG.md`.**

### What to write:

Add a new entry **at the top** of the `[Unreleased]` section with:

1. **User's name** — Ask the user their name if you don't know it. Use git config if available.
2. **Date** — Current date in YYYY-MM-DD format.
3. **Title** — Short description of what was done.
4. **Before vs After table** — Comparison of what changed.
5. **Files changed** — Every file that was modified, added, or deleted.
6. **Why** — Reason for the change.

### Format:

```markdown
### 📝 Title of Change — YYYY-MM-DD

**Contributor:** Full Name (@GitHubUsername)
**AI Assistant:** [Name of AI tool used, e.g., Gemini Antigravity, GitHub Copilot, Cursor]

| Category | Before | After |
|---|---|---|
| What changed | Old behavior/state | New behavior/state |

**Why:** Brief explanation of the problem solved or feature added.

**Files Changed:**
- `path/to/file` — What was modified
- `path/to/file` — [NEW] Why it was added
- `path/to/file` — [DELETED] Why it was removed
```

### Example:

```markdown
### 📝 Fixed GPS not working on mobile — 2026-05-07

**Contributor:** Anshul Prajapati (@Anshulpj12)
**AI Assistant:** Gemini Antigravity

| Category | Before | After |
|---|---|---|
| GPS Timeout | 8 seconds (too short for mobile) | 35 seconds on mobile |
| GPS Fallback | IP location only, no retry | Retries GPS 6 times in background |

**Why:** Mobile phones need 15-30 seconds for cold GPS start. The old timeout was too short.

**Files Changed:**
- `pages/driver.html` — Rewrote GPS acquisition flow with mobile detection
```

---

## 📋 RULE 2: Get the User's Name

At the start of the session, if you are about to make code changes:
- Check `git config user.name` to get the contributor's name
- If not available, **ask the user** for their name before making changes
- Never write "Unknown" or skip the contributor name

---

## 📋 RULE 3: Commit Message Format

When committing changes, use this format:
```
type: short description

Detailed explanation of what changed and why.

Contributor: Full Name (@GitHubUsername)
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

---

## 📋 RULE 4: Never Break These Files

These files are critical. Extra caution required:
- `js/firebase-config.js` — Firebase credentials (MUST stay in repo, NOT in .gitignore)
- `js/firebase.js` / `js/firebase_v2.js` — Core sync engine
- `js/data.js` — Shared data store, GPS tracker, utilities
- `css/shared.css` — Global design system

---

## 📋 RULE 5: CDN Scripts

All external CDN `<script>` and `<link>` tags MUST have `crossorigin="anonymous"` attribute.

✅ Correct: `<script src="https://cdn.example.com/lib.js" crossorigin="anonymous"></script>`
❌ Wrong: `<script src="https://cdn.example.com/lib.js"></script>`

---

## 📋 RULE 6: Design System

This project uses the **Tactical Horizon** glassmorphic design system.
- Use CSS variables from `css/shared.css`
- Dark theme with cyan (`--cyan`) and orange (`--accent-orange`) accents
- Glassmorphic panels with `backdrop-filter: blur()`
- Keep the premium, tactical aesthetic

---

## 📋 RULE 7: Mobile First

- Driver app (`pages/driver.html`) is mobile-first — max-width 480px
- Always test GPS changes with mobile user-agent detection
- Use `enableHighAccuracy: false` first for fast cell/wifi position
- Keep GPS timeouts at 15-35 seconds for mobile

---

## 📁 Project Structure Reference

```
DRISHYTOX/
├── index.html              # Landing page
├── CHANGELOG.md            # ⚠️ MUST UPDATE after every change
├── CONTRIBUTING.md         # Human contributor guidelines
├── AGENTS.md               # ⚠️ THIS FILE — AI agent rules
├── CLAUDE.md               # Claude AI pointer → reads AGENTS.md
├── GEMINI.md               # Gemini AI pointer → reads AGENTS.md
├── .cursorrules            # Cursor AI pointer → reads AGENTS.md
├── css/shared.css          # Global design tokens
├── js/
│   ├── firebase-config.js  # Firebase client config (committed, safe)
│   ├── firebase.js         # Sync engine for driver app
│   ├── firebase_v2.js      # Sync engine for provider/shop/admin
│   └── data.js             # Store, GPS, network, SOS utilities
├── pages/
│   ├── driver.html         # Driver mobile app (2700+ lines)
│   ├── provider.html       # Service provider dashboard
│   ├── shop_provider.html  # Shop provider dashboard
│   └── admin.html          # Admin control panel
└── .github/
    ├── CODEOWNERS           # @Anshulpj12 reviews everything
    ├── copilot-instructions.md  # Copilot AI pointer → reads AGENTS.md
    └── pull_request_template.md
```
