/**
 * The proposal gate. One implementation, shared by the Worker entry (src/worker.js) and the
 * Pages middleware (functions/_middleware.js), so the two can never drift apart.
 *
 * A proposal opens only with a key: /proposals/<slug>/?k=<key>, where the key is
 * HMAC-SHA256(GATE_SECRET, slug), base64url, first 32 chars. Nothing is stored per proposal,
 * so adding one needs no config and there is no key list to leak. A valid key sets an
 * HttpOnly cookie scoped to that single proposal and redirects to the clean URL.
 *
 * Everything unauthorised returns 404, never 403, because a 403 confirms the thing exists.
 * A missing secret fails closed.
 */

const COOKIE_PREFIX = 'csp_';
const MAX_AGE = 60 * 60 * 24 * 60; // 60 days
const enc = new TextEncoder();

export async function expectedKey(secret, slug) {
  const cryptoKey = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(slug));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    .slice(0, 32);
}

/** Constant-time compare. Length alone leaks, so compare the full width. */
export function safeEqual(a, b) {
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

export const NOT_FOUND_HTML = `<!doctype html>
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

export const notFound = () => new Response(NOT_FOUND_HTML, {
  status: 404,
  headers: {
    'content-type': 'text/html; charset=utf-8',
    'cache-control': 'no-store',
    'x-robots-tag': 'noindex, nofollow',
  },
});

/**
 * Decide what to do with a request.
 * Returns either a Response to send straight back, or {pass: true} meaning
 * "authorised, serve the asset" with headers to apply to it.
 */
export async function guard(request, secret) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Everything outside /proposals/ is public chrome: the neutral index, favicon, 404.
  if (!path.startsWith('/proposals/')) {
    return { pass: true, headers: { 'x-robots-tag': 'noindex, nofollow' } };
  }

  const slug = path.split('/')[2];
  if (!slug) return { response: notFound() };
  if (!secret) return { response: notFound() };   // fail closed

  const cookieName = COOKIE_PREFIX + slug.replace(/[^a-z0-9-]/gi, '');
  const want = await expectedKey(secret, slug);

  if (safeEqual(readCookie(request.headers.get('cookie'), cookieName) || '', want)) {
    return {
      pass: true,
      headers: {
        'cache-control': 'private, no-store',
        'x-robots-tag': 'noindex, nofollow',
        'referrer-policy': 'no-referrer',
      },
    };
  }

  const given = url.searchParams.get('k');
  if (given && safeEqual(given, want)) {
    const clean = new URL(url);
    clean.searchParams.delete('k');
    return {
      response: new Response(null, {
        status: 302,
        headers: {
          location: clean.pathname + (clean.search || ''),
          'set-cookie': `${cookieName}=${want}; Path=/proposals/${slug}/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`,
          'cache-control': 'no-store',
        },
      }),
    };
  }

  return { response: notFound() };
}
