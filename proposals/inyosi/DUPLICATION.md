# Inyosi proposal — duplication manifest

Build: `proposals/inyosi/index.html`. Date: 9 September 2026.

## Declared references (all captured, all read before writing)

| Layer | Reference | Path | What was duplicated |
|---|---|---|---|
| Structure | Lab TQA HIV RT proposal | `proposals/labtqa-hivrt/index.html` | Section spine: fixed nav with jump links + confidential tag, numbered `section-label` sections alternating `--dark`/`--alt`, `grid-2` heading/lede split, `.timeline` with `data-n` cropped numerals, `.pricing-grid` with a `recommended` card and `feature-list`, `.feature-table` in a focusable `.table-wrap`, `.sec-note` caveat block, `.cta-section` with `steps-list` + mailto form, print stylesheet. **Trimmed on instruction** ("not toooo detailed"): the 11-item side rail, the `.occ` status-card wall, the mock product screens, the package builder and the derivation table are all dropped. 6 numbered sections instead of 10. |
| Graphic style | The Local introduction & capability | `proposals/the-local/index.html` | Bottom-aligned full-height hero over a radial ground with a directional veil; `.eyebrow` with 2px rules either side; `<em>` accent on the closing phrase of every heading; **solid-accent intro band** with an oversized numeral and ink text (not LabTQA's warm-paper gradient); `.r` reveal (opacity 0 / translateY(24px)) driven by GSAP; pointer-tracked spotlight + rAF-lerped tilt depth cards; inline `hero-meta` label/value row instead of LabTQA's glass card; one full-bleed breaker line. |
| Interaction | SPAR house-brands game engine | `clients/spar/proposal-game-engine/index.html` | The `.gcard` > `.stage` poster-then-play pattern: a static poster with a circular play button overlay, the live game swapped in on click, `.playing` class toggling the meta row. Reproduced for an inline canvas rather than an iframe, because the game is ~150 lines and needs no build step. |
| Content | Inyosi proposal v2 | `github.com/uxconstellation/constellation-proposal-inyosi-v2` | Situation, needs, the three options and their prices, how-it-works, payment terms, care plan. Plus the 8 Sep meeting: Azure/Afrihost migration, cron jobs, mailboxes, Prism CMS, MCP/CLI. |
| Brand | Inyosi proposal v2 assets | `assets/inyosi-honeycomb.svg`, `assets/favicon.svg` | Hex mark, honeycomb pattern, deep green `#06201E` + honey `#FFB22E`. |

## Deviation

Constellation branding is **removed**, on instruction: no house orange `#FE6E36`, no Constellation logo in nav or footer. The accent token is Inyosi honey throughout. Authorship survives only as a text credit in the footer and one "Prepared by" meta row, because a proposal with no sender cannot be acted on.

## Contrast

Computed, not estimated, with alpha composited against the real ground. Every text pair clears AA: honey on deep 9.46:1, honey on alt 8.41:1, body 0.72 white on deep 9.26:1, dim 0.62 white on deep 7.18:1, ink on honey fills 10.29:1, print accent `#7A4E00` on white 7.20:1.

## Verification (9 September 2026)

AA sweep PASS, 0 violations, 12,327 element-checks across 30 of 30 states. The 2,209 checks axe left UNDECIDED were measured by hand against the real composited ground: 27 pairs, all pass, lowest 7.18:1. Game asserted running rather than screenshotted static: three distinct canvas signatures, score 0 to 3, a life consumed on a miss. All 7 nav jumps clear the fixed bar. No horizontal overflow at 390/768/1440. Nothing hidden under reduced motion.

Harnesses kept for re-runs, in `_refs/design-library/.tools/`: `_inyosi-proof.mjs` (motion), `_inyosi-gates.mjs` (anchors, overflow, mobile), `_inyosi-contrast.mjs` (the undecided pairs), `_inyosi-fonts.mjs` (font delivery).

## Design-hook findings

The `bounce-easing` rule fired on six transitions carried over verbatim from the Lab TQA reference (`cubic-bezier(0.34,1.56,0.64,1)` and `(0.34,1.26,0.64,1)`). Rather than waive them, all six were replaced with the house expo.out equivalent `cubic-bezier(0.16, 1, 0.3, 1)`. The motion language of the reference is preserved — the disc still scales on hover, the stage still indents — only the overshoot is gone.
