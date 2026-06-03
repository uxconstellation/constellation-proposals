# Constellation Proposals

Master repository for all Constellation client proposals, hosted on GitHub Pages.

**Live at:** `https://uxconstellation.github.io/constellation-proposals/`

---

## Adding a New Proposal

### Quick Start (3 steps)

1. **Copy the template:**
   ```bash
   cp -r proposals/sigma-wealth proposals/[client-name-lowercase]
   ```

2. **Edit the proposal:**
   ```bash
   cd proposals/[client-name-lowercase]
   # Edit index.html with new client details, investment, timeline, etc.
   ```

3. **Update the master index:**
   Edit the root `index.html` and add to the `proposals` array:
   ```javascript
   {
     id: 'client-name-lowercase',
     name: 'Client Name',
     tagline: 'Project Tagline',
     description: 'Brief description of the engagement.',
     date: 'Month Year'
   }
   ```

4. **Deploy:**
   ```bash
   git add .
   git commit -m "Add [Client Name] proposal"
   git push origin main
   ```

   GitHub Pages updates automatically (2-5 minutes).

---

## Directory Structure

```
constellation-proposals/
├── index.html                    ← Master listing page
├── proposals/
│   ├── sigma-wealth/
│   │   ├── index.html           ← Proposal (use as template)
│   │   └── assets/
│   │       └── logo.png
│   ├── [client-name]/           ← Add new proposals here
│   │   ├── index.html
│   │   └── assets/
│   │       └── logo.png
│   └── ...
├── README.md
└── .gitignore
```

---

## Sharing a Proposal

Each proposal has its own URL:

- Sigma Wealth: `https://uxconstellation.github.io/constellation-proposals/proposals/sigma-wealth/`
- New Client: `https://uxconstellation.github.io/constellation-proposals/proposals/[client-name]/`

Or send them the master index if you want to showcase multiple proposals at once.

---

## Customizing the Sigma Wealth Template

Edit `proposals/sigma-wealth/index.html`:

**Find and replace:**
- `Sigma Wealth` → Client name
- `R18,000` → Monthly investment
- `Digital transformation...` → Your value prop
- `Week 1–2` → Your timeline
- Dates, team members, etc.

The HTML is self-contained — no build tools needed. Edit, save, commit, done.

---

## Asset Management

Each proposal folder has its own `assets/` directory:
- `logo.png` — Constellation logo (same for all)
- Add client logos, icons, or custom assets here

---

## GitHub Pages Settings

- **Repository:** `uxconstellation/constellation-proposals`
- **Branch:** `main`
- **Root:** `/` (entire repo serves as root)
- **URL:** `https://uxconstellation.github.io/constellation-proposals/`

GitHub Actions auto-deploys on every push to `main`.

---

## Tips

- **Don't commit node_modules** — Only HTML, CSS, images needed
- **Use relative URLs** — All assets load via relative paths
- **Test locally** — Run `python -m http.server 8000` and visit `http://localhost:8000`
- **Mobile-first** — Proposals are fully responsive
- **No build required** — Edit HTML directly, no transpiling

---

## Workflow for Future Proposals

1. Create `proposals/[client-name]/` folder
2. Copy `sigma-wealth/index.html` into it
3. Edit details (client, investment, timeline, scope)
4. Update master `index.html` with new entry
5. Push to main
6. Share the proposal URL

Total time: ~10 minutes per proposal.

---

## Troubleshooting

**Proposal not loading?**
- Check that folder name matches the `id` in master index
- Verify relative paths in HTML (should be `assets/logo.png`, not `../assets/logo.png`)
- Check browser console for 404 errors

**Styles not loading?**
- Fonts are loaded from FontShare API (needs internet)
- Images must exist in the `assets/` folder

**Deployment slow?**
- GitHub Pages can take 2–5 minutes to update
- Check the Actions tab in the repo for deploy status

---

## Future Enhancements

- [ ] Proposal generator script (auto-creates HTML from config)
- [ ] Custom domain (`proposals.constellation.agency`)
- [ ] Search/filter on master index
- [ ] Archive old proposals
- [ ] Template versioning

---

**Questions?** Check the individual proposal `index.html` files — they're heavily commented.
