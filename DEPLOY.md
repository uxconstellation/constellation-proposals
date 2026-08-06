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

## First-time setup (Aldo, once)

```bash
cd "C:/Users/aldoc/Documents/UX CONSTELLATION/constellation-proposals"
npx wrangler login
npx wrangler pages project create constellation-proposals --production-branch main
node tools/proposal-link.mjs --new-secret        # copy the output
npx wrangler pages secret put GATE_SECRET --project-name constellation-proposals
npx wrangler pages deploy . --project-name constellation-proposals
```

Then in the Cloudflare dashboard, point `proposals.uxconstellation.com` at the project.

**Keep the secret.** It is not recoverable, and rotating it invalidates every link already
sent. Store it in `C:\Dev\.secrets\`.

## Sending a proposal

```bash
GATE_SECRET=<the secret> node tools/proposal-link.mjs le-sol
```

Prints the full link. That is the only thing the client needs, and it is the only thing that
opens the page.

## Redeploying after an edit

```bash
npx wrangler pages deploy . --project-name constellation-proposals
```

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

## Verified 2026-08-06 against a real `wrangler pages dev` runtime

| Request | Result |
|---|---|
| `/` | 200, neutral page, lists no client |
| `/proposals/` | 404 |
| `/proposals/le-sol/` no key | 404 |
| `/proposals/le-sol/index.html` no key | 404 |
| `/proposals/le-sol/?k=wrong` | 404 |
| `/proposals/greennotes/?k=<le-sol key>` | 404 |
| `/proposals/le-sol/?k=<valid>` | 302, cookie set, key stripped from the URL |
| then `/proposals/le-sol/` with cookie | 200, 278 KB, real proposal |
| `/proposals/greennotes/` with le-sol cookie | 404, cookie is path-scoped |
| any request with `GATE_SECRET` unset | 404, fails closed |

Gated responses carry `Cache-Control: private, no-store`, `x-robots-tag: noindex, nofollow`
and `Referrer-Policy: no-referrer`.

## Outstanding

**The Le Sol link already sent to Chelsea Gray points at GitHub Pages** and will break the
moment `uxconstellation.github.io` is retired. Either keep Pages alive until she has
accepted, or send her the new keyed link. Aldo's call, and it should be made before the
GitHub Pages source is switched off.
