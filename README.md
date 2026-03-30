# Constellation Proposals

Hosted at [proposals.uxconstellation.com](https://proposals.uxconstellation.com)

## Structure

Each client proposal lives in its own folder under `/proposals/`:

```
proposals/
  behangexpert/     → proposals.uxconstellation.com/proposals/behangexpert
  client-name/      → proposals.uxconstellation.com/proposals/client-name
```

## Adding a New Proposal

1. Build the proposal using the `constellation-proposal` Manus skill
2. Run `bundle.py` to generate `proposal_standalone.html`
3. Create a new folder: `proposals/client-name/`
4. Copy the standalone file as `proposals/client-name/index.html`
5. Commit and push to `main` — Netlify auto-deploys within 30 seconds

## Deployment

Auto-deployed via Netlify on every push to `main`.  
Custom domain: `proposals.uxconstellation.com` (CNAME → Netlify)
