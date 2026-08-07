# Deploying the proposals site

The site moved off GitHub Pages because Pages served every proposal to anyone who trimmed a
URL, and the root page listed the whole client book. Cloudflare Pages runs a gate in front of
`/proposals/*`.

## The gate, in one paragraph
A proposal opens only with a key: `/proposals/<slug>/?k=<key>`. The key is
`HMAC-SHA256(GATE_SECRET, slug)`, base64url, first 32 characters. Nothing is stored per
proposal, so adding one needs no config and there is no key list to leak. A valid key sets an
HttpOnly cookie scoped to that single proposal and redirects to the clean URL, so the key
leaves the address bar. Everything unauthorised returns **404**, never 403, because a 403
confirms the proposal exists. If `GATE_SECRET` is missing the gate fails closed.

It is not identity. A forwarded link still works. It stops guessing, trimming and
enumeration. For real per-person auth, put Cloudflare Access in front of `/proposals/*`.

## Where it runs now

**Cloudflare Worker `constellation-proposals`**, serving the site from static assets.
Live at `https://constellation-proposals.aldo-144.workers.dev`.

Not Cloudflare Pages: the account's OAuth token carries `workers (write)` but no `pages`
scope, and re-authing for Pages needs an interactive browser flow. The gate is shared
(`src/gate.js`), so moving to Pages later is a config change, not a rewrite.

**`run_worker_first: true` in `wrangler.jsonc` is load-bearing.** Without it Cloudflare's
asset handler answers first and the gate never runs. Verified: with it false, every proposal
returned 200 with no key. Do not remove it.

## Publishing a change

```bash
node tools/stage.mjs      # assembles ./public from an explicit proposal list
npx wrangler deploy
```

`stage.mjs` publishes only the slugs listed inside it, so a proposal goes live on purpose
rather than because it happens to sit in the repo. It also fails if the public index links to
any client.

## Sending a proposal

```bash
GATE_SECRET=$(cat C:/Dev/.secrets/constellation-proposals-gate.txt)   node tools/proposal-link.mjs le-sol --host constellation-proposals.aldo-144.workers.dev
```

**The secret lives at `C:\Dev\.secrets\constellation-proposals-gate.txt`.** It is not
recoverable from Cloudflare, and rotating it invalidates every link already sent.

## Custom domain

Point `proposals.uxconstellation.com` at the Worker in the Cloudflare dashboard
(Workers > constellation-proposals > Settings > Domains & Routes), then use that host in
`proposal-link.mjs` instead of the workers.dev address.

## Local development

`.dev.vars` holds a throwaway `GATE_SECRET` and is git-ignored.

```bash
npx wrangler pages dev . --port 8788
GATE_SECRET=local-test-secret-not-for-production node tools/proposal-link.mjs le-sol --host 127.0.0.1:8788
```

## Tests

```bash
node tools/test-key-parity.mjs
```

Asserts the Node generator and the Workers gate derive byte-identical keys across 1,000
derivations. They use different crypto APIs; if they ever drift, every link we send 404s and
nobody finds out until a client complains.

## Verified on the deployed Worker, 2026-08-07

| Request | Result |
|---|---|
| all 12 proposals, `GATE_SECRET` unset | 404, fails closed |
| `/` | 200, neutral page, lists no client |
| `/proposals/` | 404 |
| `/proposals/le-sol/` no key | 404 |
| `/proposals/le-sol/index.html` no key | 404 |
| `/proposals/le-sol/assets/logo.png` no cookie | 404, assets are gated too |
| `/proposals/le-sol/?k=wrong` | 404 |
| `/proposals/le-sol/?k=<greennotes key>` | 404 |
| `/proposals/le-sol/?k=<valid>` | 302, then 200, 278,847 bytes, real page |
| `/proposals/greennotes/` with le-sol cookie | 404, cookie is path-scoped |

Gated responses carry `Cache-Control: private, no-store`, `x-robots-tag: noindex, nofollow`
and `Referrer-Policy: no-referrer`.

## Outstanding

**The Le Sol link already sent to Chelsey Grey points at GitHub Pages** and will break the
moment `uxconstellation.github.io` is retired. Either keep Pages alive until she has
accepted, or send her the new keyed link. Aldo's call, and it should be made before the
GitHub Pages source is switched off.
