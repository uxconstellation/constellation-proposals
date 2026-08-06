/**
 * Cloudflare Pages middleware: gates every client proposal.
 *
 * The problem it solves: on GitHub Pages every proposal was readable by anyone who
 * guessed or trimmed a URL, and the root page listed our whole client book.
 *
 * How it works
 *   - A proposal is reachable only with a valid key: /proposals/<slug>/?k=<key>
 *   - The key is HMAC-SHA256(GATE_SECRET, slug), base64url, truncated. Nothing is stored
 *     per proposal, so adding a proposal needs no config change and there is no key list
 *     to leak.
 *   - A valid key sets an HttpOnly cookie scoped to that one proposal, then redirects to
 *     the clean URL. The key disappears from the address bar, from screenshots, and from
 *     anything the client forwards by copying what they see.
 *   - Anything unauthorised returns 404, never 403. A 403 confirms the proposal exists.
 *
 * What it deliberately is not: identity. A forwarded link still works, exactly like the
 * unlisted-link model, but the link now cannot be guessed, trimmed, or enumerated. Put
 * Cloudflare Access in front of /proposals/* when a client needs real per-person auth.
 */

const COOKIE_PREFIX = 'csp_';
const MAX_AGE = 60 * 60 * 24 * 60; // 60 days

const enc = new TextEncoder();

async function expectedKey(secret, slug) {
  const cryptoKey = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(slug));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    .slice(0, 32);
}

/** Constant-time compare. A length check alone leaks, so compare the full width. */
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

function readCookie(header, name) {
  if (!header) return null;
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return null;
}

const notFound = () => new Response(NOT_FOUND_HTML, {
  status: 404,
  headers: {
    'content-type': 'text/html; charset=utf-8',
    'cache-control': 'no-store',
    'x-robots-tag': 'noindex, nofollow',
  },
});

export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // Everything outside /proposals/ is public chrome: the neutral index, favicon, 404.
  if (!path.startsWith('/proposals/')) {
    const res = await next();
    const out = new Response(res.body, res);
    out.headers.set('x-robots-tag', 'noindex, nofollow');
    return out;
  }

  // /proposals/ itself must never enumerate.
  const slug = path.split('/')[2];
  if (!slug) return notFound();

  if (!env.GATE_SECRET) {
    // Fail closed. A missing secret must not silently publish the whole book.
    return notFound();
  }

  const cookieName = COOKIE_PREFIX + slug.replace(/[^a-z0-9-]/gi, '');
  const want = await expectedKey(env.GATE_SECRET, slug);

  // Already let in on this device.
  if (safeEqual(readCookie(request.headers.get('cookie'), cookieName) || '', want)) {
    const res = await next();
    const out = new Response(res.body, res);
    out.headers.set('cache-control', 'private, no-store');
    out.headers.set('x-robots-tag', 'noindex, nofollow');
    out.headers.set('referrer-policy', 'no-referrer');
    return out;
  }

  // Arriving with a key: set the cookie and bounce to the clean URL.
  const given = url.searchParams.get('k');
  if (given && safeEqual(given, want)) {
    const clean = new URL(url);
    clean.searchParams.delete('k');
    return new Response(null, {
      status: 302,
      headers: {
        location: clean.pathname + (clean.search || ''),
        'set-cookie': `${cookieName}=${want}; Path=/proposals/${slug}/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`,
        'cache-control': 'no-store',
      },
    });
  }

  return notFound();
}

const NOT_FOUND_HTML = `<!doctype html>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="robots" content="noindex,nofollow" />
<title>Not found</title>
<style>
  body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0B0B0C;color:#fff;
       font-family:ui-sans-serif,system-ui,sans-serif;text-align:center;padding:2rem;line-height:1.6}
  p{color:#9AA0A6;max-width:44ch;font-size:.95rem}
  a{color:#C9CFD4}
</style>
<div>
  <h1 style="font-size:1.25rem;margin:0 0 .75rem">Not found</h1>
  <p>If you are looking for a proposal we prepared for you, use the link we sent you.
  If you have mislaid it, email <a href="mailto:hello@uxconstellation.com">hello@uxconstellation.com</a> and we will resend it.</p>
</div>`;
