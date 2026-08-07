// Worker entry. Serves the proposals site from static assets, with every /proposals/* path
// behind the gate in ./gate.js.
//
// Why a Worker rather than Cloudflare Pages: the account's OAuth token carries workers
// (write) but no pages scope, and re-authing for Pages needs an interactive browser flow.
// Workers serve static assets natively, so this gets the same result with the credentials
// that already exist. Moving to Pages later is a config change, not a rewrite: the gate is
// shared with functions/_middleware.js.

import { guard, notFound } from './gate.js';

export default {
  async fetch(request, env) {
    const decision = await guard(request, env.GATE_SECRET);
    if (decision.response) return decision.response;

    const asset = await env.ASSETS.fetch(request);

    // A missing asset under a valid key must still look like nothing, not like a 404 page
    // that confirms the directory exists.
    if (asset.status === 404) return notFound();

    const out = new Response(asset.body, asset);
    for (const [k, v] of Object.entries(decision.headers || {})) out.headers.set(k, v);
    return out;
  },
};
