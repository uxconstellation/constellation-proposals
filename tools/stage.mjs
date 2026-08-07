#!/usr/bin/env node
// Assemble ./public, the directory the Worker serves. Keeping it explicit means a new
// proposal is published on purpose, never because it happened to be in the repo.
import { cpSync, rmSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const OUT = join(ROOT, 'public');

// Every proposal that should exist behind the gate. Add a slug to publish it.
const PROPOSALS = [
  'le-sol', 'greennotes', 'spar-house-brands', 'labtqa',
  'conexxus', 'sigma-wealth', 'sara-sian', 'mealign',
  'my-mobile', 'euroseat', 'euroseat-roadmap', 'butcherbird',
  'sigma-wealth-direction', 'behangexpert',
];

rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, 'proposals'), { recursive: true });

for (const f of ['index.html', '404.html', 'favicon.svg', 'robots.txt']) {
  if (existsSync(join(ROOT, f))) cpSync(join(ROOT, f), join(OUT, f));
}

const missing = [];
for (const slug of PROPOSALS) {
  const src = join(ROOT, 'proposals', slug);
  if (!existsSync(src)) { missing.push(slug); continue; }
  cpSync(src, join(OUT, 'proposals', slug), { recursive: true });
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
