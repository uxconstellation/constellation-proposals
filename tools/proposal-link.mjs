#!/usr/bin/env node
/**
 * Print the shareable link for a proposal. The key is derived, never stored.
 *
 *   GATE_SECRET=... node tools/proposal-link.mjs le-sol
 *   GATE_SECRET=... node tools/proposal-link.mjs le-sol --host proposals.uxconstellation.com
 *
 * The same secret must be set on the Cloudflare Pages project:
 *   wrangler pages secret put GATE_SECRET --project-name constellation-proposals
 *
 * To generate a fresh secret:  node tools/proposal-link.mjs --new-secret
 * Rotating the secret invalidates every link already sent. Do it deliberately.
 */
import { createHmac, randomBytes } from 'node:crypto';

const args = process.argv.slice(2);

if (args.includes('--new-secret')) {
  console.log(randomBytes(32).toString('base64url'));
  process.exit(0);
}

const slug = args.find((a) => !a.startsWith('--'));
const hostIdx = args.indexOf('--host');
const host = hostIdx > -1 ? args[hostIdx + 1] : 'proposals.uxconstellation.com';
const secret = process.env.GATE_SECRET;

if (!slug) {
  console.error('usage: GATE_SECRET=... node tools/proposal-link.mjs <slug> [--host <host>]');
  process.exit(1);
}
if (!secret) {
  console.error('GATE_SECRET is not set. It must match the secret on the Pages project.');
  process.exit(1);
}

// Must match functions/_middleware.js exactly: HMAC-SHA256, base64url, first 32 chars.
const key = createHmac('sha256', secret).update(slug).digest('base64url').slice(0, 32);

console.log(`https://${host}/proposals/${slug}/?k=${key}`);
