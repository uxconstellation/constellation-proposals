// The generator (Node crypto) and the gate (Web Crypto) must derive byte-identical keys,
// or every link we send 404s. This asserts they do.
import { createHmac, randomBytes } from 'node:crypto';
import assert from 'node:assert';

const enc = new TextEncoder();
async function workerKey(secret, slug) {           // copy of functions/_middleware.js
  const k = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', k, enc.encode(slug));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '').slice(0, 32);
}
const nodeKey = (secret, slug) => createHmac('sha256', secret).update(slug).digest('base64url').slice(0, 32);

for (let i = 0; i < 200; i++) {
  const secret = randomBytes(32).toString('base64url');
  for (const slug of ['le-sol', 'greennotes', 'spar-house-brands', 'a', 'x'.repeat(64)]) {
    const a = await workerKey(secret, slug), b = nodeKey(secret, slug);
    assert.strictEqual(a, b, `MISMATCH slug=${slug}\n worker=${a}\n node  =${b}`);
    assert.strictEqual(a.length, 32, 'key must be 32 chars');
    assert.match(a, /^[A-Za-z0-9_-]+$/, 'key must be URL-safe');
  }
}

// Different slugs must not collide, and the key must actually depend on the secret.
const s = randomBytes(32).toString('base64url');
assert.notStrictEqual(nodeKey(s, 'le-sol'), nodeKey(s, 'greennotes'), 'slugs must differ');
assert.notStrictEqual(nodeKey(s, 'le-sol'), nodeKey(randomBytes(32).toString('base64url'), 'le-sol'), 'secret must matter');

// safeEqual must reject on length as well as content.
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  let d = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) d |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return d === 0;
}
assert.ok(safeEqual('abc', 'abc'));
assert.ok(!safeEqual('abc', 'abd'));
assert.ok(!safeEqual('abc', 'abcd'));
assert.ok(!safeEqual('abc', ''));
assert.ok(!safeEqual(null, 'abc'));

console.log('PASS: 1000 key derivations agree across both runtimes; compare and collision checks hold.');
