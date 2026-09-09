# Inyosi proposal — status

**Updated:** 9 September 2026
**State:** built, verified, ready to deploy behind the gate. Not sent.

## What this is

A replacement for `uxconstellation.github.io/constellation-proposal-inyosi-v2`, which was a
bespoke page on a dead host. Same commercial content, restructured onto the Lab TQA spine
with The Local's graphic style, branded to Inyosi rather than to Constellation, and extended
with the 8 September meeting: the Azure and Afrihost migration, cron jobs, mailboxes, Prism
and the MCP/CLI layer.

Full reference manifest in `DUPLICATION.md`.

## Decisions taken, and the reasoning

| Decision | Why |
|---|---|
| **R36,000 as one combined quote**, split on the page as R32,000 rebuild + R4,000 migration | The meeting recorded Erin leaning toward one combined quote. The split is shown so the parts are legible, in a single card, so they cannot be read as separately purchasable. |
| **Option B foregrounded, A and C kept** | Option B is the agreed route and the page is priced for it. A and C survive only in the comparison table, as the reason B was chosen. |
| **No Azure monthly running cost stated** | That figure is Eric's to give from the current iHive portal. Inventing one would put a number next to a client's name that nobody measured. |
| **R4,000 marked as an estimate, not a fixed quote** | The meeting says Afrihost access is needed *before* migration scoping. The page says so in the hosting note and again under "what the price assumes". |
| **The R5,000 Afrihost figure and the 50% saving are attributed to Eric** | Both came from him on the call. The intro band says so in as many words. |
| **Constellation branding removed, authorship kept** | "Not branded to us" was the instruction. The house orange is gone at all three layers, the logo is gone from nav and footer. Authorship survives as one footer line, because a proposal with no sender cannot be acted on. |

## Verification

- **AA sweep** (`_refs/design-library/.tools/aa.mjs`): **PASS, 0 violations**, 12,327
  element-checks across 30 of 30 states at 1440x900 — 16 scroll offsets, 6 hover states,
  4 focus states, 4 tabwalk depths, plus the game mid-play.
- The first run reported 1 violation on `.timeline-item:nth-child(1)`. It was the entrance
  fade caught mid-flight: GSAP tweens are not Web Animations, so aa.mjs's animation-stop
  wait cannot see them and the default 600ms settle sampled the fade. Settled, those same
  elements measure 9.46 / 17.03 / 9.26 / 8.02:1. States now carry `settle: 2500`.
- **The 2,209 UNDECIDED checks** axe could not resolve (text over gradients and translucency)
  were measured by hand against the real composited ground with
  `.tools/_inyosi-contrast.mjs`: 27 pairs, **all pass**, lowest 7.18:1 (footer).
- **Motion proof** (`.tools/_inyosi-proof.mjs`): the game is asserted running, not
  screenshotted static — three distinct canvas signatures, score 0 to 3 on catches, a life
  consumed on a miss, canvas focusable, zero console errors.
- **Reduced motion:** 0 elements left hidden under `prefers-reduced-motion: reduce`.
- **Anchors:** all 7 nav jumps land content at 204px against a 68px nav. `scroll-margin-top`
  was added after the first pass showed targets landing underneath the fixed bar.
- **Responsive:** no horizontal overflow at 390, 768 or 1440.
- **Fonts:** Clash Display and Satoshi both load, promoted from preload, no render-blocking
  stylesheet in the critical path.

## Open, and whose it is

1. **Eric** — share the Afrihost iHive environment. Until then R4,000 is an estimate.
2. **Eric** — the Azure cost estimate off the current iHive portal. Erin needs it for Evan.
3. **Aldo** — confirm R36,000 and the R3,000/month care plan before this goes out.
4. **Aldo** — "Option B, which is the other title" was read as *Option B is the agreed route*.
   If it meant Option B should be **retitled**, say what to, and it is a one-line change.
5. **Aldo** — the care plan is v2's monitoring plan at R3,000. If "take things further" meant
   a development retainer with a day allocation (the Lab TQA shape), that is a different
   product and needs a price.

## Next

`node tools/stage.mjs` then `npx wrangler deploy`, then
`node tools/proposal-link.mjs inyosi` with `GATE_SECRET` from
`C:\Dev\.secrets\constellation-proposals-gate.txt`. Send with Tim copied.
