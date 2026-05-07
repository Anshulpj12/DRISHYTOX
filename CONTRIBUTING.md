# 🤝 Contributing to DRISHYTOX / APARA

## ⚠️ Mandatory Rule: Document Every Change

**Every contributor MUST follow these rules before pushing or creating a PR:**

### 1. Update `CHANGELOG.md`

Add an entry **at the top** of the `[Unreleased]` section using this format:

```markdown
### 📝 Short Title of Your Change

**Contributor:** Your Full Name (@GitHubUsername)

| Category | Before | After |
|---|---|---|
| What you changed | How it worked before | How it works now |

**Why:** Brief explanation of why this change was needed.

**Files Changed:**
- `path/to/file.html` — What was modified
- `path/to/new-file.js` — [NEW] Why it was added
- `path/to/old-file.js` — [DELETED] Why it was removed
```

### 2. Sign Your Commits

Use descriptive commit messages with your intent:
```
feat: add voice-activated SOS for hands-free emergency
fix: GPS timeout too short on mobile cold starts
docs: update API documentation for zone bundles
style: improve dark mode contrast on provider dashboard
refactor: extract GPS retry logic into reusable module
```

### 3. Never Skip These Files in Your PR

| File | Action Required |
|---|---|
| `CHANGELOG.md` | Add your change entry with your name |
| Changed files | Add a comment at the top of major changes with your name and date |

---

## 📁 Project Structure

```
DRISHYTOX/
├── index.html              # Landing page
├── CHANGELOG.md            # Change tracking (ALWAYS UPDATE)
├── CONTRIBUTING.md         # This file
├── css/
│   └── shared.css          # Global design system
├── js/
│   ├── firebase-config.js  # Firebase client config
│   ├── firebase.js         # Firebase sync engine (driver)
│   ├── firebase_v2.js      # Firebase sync engine (provider/shop/admin)
│   └── data.js             # Shared data store & GPS utilities
├── pages/
│   ├── driver.html         # Driver mobile app
│   ├── provider.html       # Service provider dashboard
│   ├── shop_provider.html  # Shop provider dashboard
│   └── admin.html          # Admin control panel
└── .github/
    ├── CODEOWNERS           # Review requirements
    ├── CONTRIBUTING.md      # → Points here
    └── pull_request_template.md  # PR checklist
```

---

## 🔒 Code Review Rules

1. **All PRs require review by @Anshulpj12** (enforced via CODEOWNERS)
2. **No direct pushes to `main`** — use feature branches and PRs
3. **Critical files** (`js/firebase*.js`, `js/data.js`) require extra scrutiny
4. **Test on mobile** before marking PR as ready — most users are on mobile

---

## 🎨 Design System

This project uses the **Tactical Horizon** glassmorphic design system. When making UI changes:

- Use CSS variables from `css/shared.css` (e.g., `--bg-deep`, `--cyan`, `--accent-orange`)
- Maintain the dark glassmorphic aesthetic
- Test on both 360px (mobile) and 1920px (desktop) viewports
- Preserve all existing animations and transitions

---

## 🧪 Testing Checklist

Before submitting a PR, verify:

- [ ] Pages load correctly on GitHub Pages (`https://anshulpj12.github.io/DRISHYTOX/`)
- [ ] No console errors on page load
- [ ] GPS/Location works on mobile Chrome and Safari
- [ ] Firebase sync initializes without errors
- [ ] Offline mode gracefully degrades (no crashes)
- [ ] All CDN scripts have `crossorigin="anonymous"` attribute
- [ ] `CHANGELOG.md` updated with your name and changes
