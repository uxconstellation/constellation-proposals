#!/usr/bin/env node
// Assemble ./public, the directory the Worker serves. Keeping it explicit means a new
// proposal is published on purpose, never because it happened to be in the repo.
import { cpSync, rmSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const OUT = join(ROOT, 'public');

// Every proposal that should exist behind the gate. Add a slug to publish it.
const PROPOSALS = [
  'le-sol', 'le-sol-retainer', 'le-sol-campaign',
  'greennotes', 'spar-house-brands', 'labtqa',
  'conexxus', 'sigma-wealth', 'sara-sian', 'mealign',
  'my-mobile', 'euroseat', 'euroseat-roadmap', 'butcherbird',
  'sigma-wealth-direction', 'behangexpert', 'the-pottery', 'labtqa-hivrt',
  'monkey-and-river', 'the-local', 'inyosi',
];

// This repo lives in a Drive-synced folder, so the sync client intermittently holds a
// handle and rmSync throws EPERM. Retry, then fall back to emptying the directory.
function clean(dir) {
  for (let attempt = 0; attempt < 4; attempt++) {
    try { rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 250 }); return; }
    catch (e) { if (attempt === 3) break; }
  }
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir)) {
    try { rmSync(join(dir, entry), { recursive: true, force: true, maxRetries: 5, retryDelay: 250 }); }
    catch { console.warn(`could not remove ${entry}, it will be overwritten`); }
  }
}
clean(OUT);
mkdirSync(join(OUT, 'proposals'), { recursive: true });

for (const f of ['index.html', '404.html', 'favicon.svg', 'robots.txt']) {
  if (existsSync(join(ROOT, f))) cpSync(join(ROOT, f), join(OUT, f));
}

// The client intake form is deliberately OUTSIDE /proposals/, so the gate lets it through.
// Clients fill it in without a key; there is nothing confidential on it.
// Public email assets: inline images referenced by hosted URL from client emails.
if (existsSync(join(ROOT, 'assets'))) {
  cpSync(join(ROOT, 'assets'), join(OUT, 'assets'), { recursive: true, force: true });
  console.log('staged public assets at /assets/');
}

if (existsSync(join(ROOT, 'intake'))) {
  cpSync(join(ROOT, 'intake'), join(OUT, 'intake'), { recursive: true, force: true });
  console.log('staged the client intake form at /intake/');
}

// Unlisted but ungated pages under /sites/: shareable direction work (mood boards) that
// carries no pricing or client-book information. The gate leaves non-/proposals/ paths
// public, and the Worker still stamps them noindex. Explicit list, same as PROPOSALS.
const SITES = ['sun-savings-moodboard'];
for (const slug of SITES) {
  const src = join(ROOT, 'sites', slug);
  if (!existsSync(src)) { console.error(`ERROR: sites/${slug} not found`); process.exit(1); }
  cpSync(src, join(OUT, 'sites', slug), { recursive: true, force: true });
}
console.log(`staged ${SITES.length} site(s): ${SITES.join(', ')}`);

// A proposal folder also holds working files: DUPLICATION.md, internal mapping notes,
// tool caches, render proofs. Those are NOT client-facing, and the gate does not save us,
// because the key we send the client unlocks every path under that client's own slug. So a
// working note beside index.html is reachable by the person it is about. Copy the web build
// only, and let anything else stay out of ./public by default.
const WEB = new Set(['.html', '.css', '.js', '.mjs', '.svg', '.png', '.jpg', '.jpeg',
                     '.webp', '.avif', '.gif', '.ico', '.woff', '.woff2', '.mp4', '.webm']);
const SKIP_DIRS = new Set(['.impeccable', '_verify', 'node_modules', '.git']);

function stageProposal(src, dst) {
  mkdirSync(dst, { recursive: true });
  for (const entry of readdirSync(src, { withFileTypes: true })) {
    if (entry.name.startsWith('.') && entry.name !== '.well-known') {
      if (SKIP_DIRS.has(entry.name)) continue;
    }
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      stageProposal(join(src, entry.name), join(dst, entry.name));
      continue;
    }
    const ext = entry.name.slice(entry.name.lastIndexOf('.')).toLowerCase();
    if (!WEB.has(ext)) continue;                 // .md, .json, .py and friends stay behind
    cpSync(join(src, entry.name), join(dst, entry.name), { force: true });
  }
}

const missing = [];
for (const slug of PROPOSALS) {
  const src = join(ROOT, 'proposals', slug);
  if (!existsSync(src)) { missing.push(slug); continue; }
  stageProposal(src, join(OUT, 'proposals', slug));
}

const staged = readdirSync(join(OUT, 'proposals'));
console.log(`staged ${staged.length} proposal(s): ${staged.join(', ')}`);
if (missing.length) console.log(`NOT FOUND, skipped: ${missing.join(', ')}`);

// The index must not link to any proposal: the gate makes those links 404 anyway, and a
// public list of client names is the exact hole this whole migration exists to close.
const idx = join(OUT, 'index.html');
if (existsSync(idx)) {
  const html = (await import('node:fs')).readFileSync(idx, 'utf8');
  const links = [...html.matchAll(/href="proposals\/([a-z0-9-]+)\//g)].map(m => m[1]);
  if (links.length) {
    console.error(`ERROR: the public index links to ${links.join(', ')}. Remove them.`);
    process.exit(1);
  }
}
console.log('index links to no client. ok');
