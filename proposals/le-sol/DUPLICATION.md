# Le Sol & Co proposal — duplication manifest

skills-run: client-onboarding (pending, client not yet in Bonsai), pitch-creative (evidence
laws applied to all claims about Le Sol's own artwork). NOTE: `skill-proposal-generation` is
referenced by the L2 pipeline but is **not installed anywhere on this machine**; the Rapid
Launch ladder survives only in the `constellation-website-pricing` memory. Flagged, not
worked around.

## Content / structure reference
`proposals/greennotes/index.html` — the won proposal, commit `cc49d6f`. Chosen over the
newer Sun Savings because Sun Savings is a single-offer rebuild that has been retired from
the public index, while GreenNotes carries the multi-tier ladder, the market-comparison
table, the deposit model and the "open for discussion" block that Le Sol needs.

Carried over unchanged: the six-section arc (`found / apple / direction / make / investment /
how`), the cursor spotlight and 8° tilt with the `prefers-reduced-motion` kill, the
self-contained base64 inlining, the FormSubmit CTA with the `?sent=1` swap.

## Craft reference
NOT YET CAPTURED. Required before any build code is written, per the house rule. The client's
own packaging supplies the surface language (bone board, mirror foil, black type, gold only
on fragrance names) but a captured award-site craft reference is still outstanding for the
scroll choreography and the signature motion.

## Deviation
- Tokens retinted off the client's own packaging: bone, mirror silver, black, warm gold.
- All copy rewritten. Nothing from the GreenNotes argument survives.
- NEW section, no precedent in the repo: the package builder. Toggle cards, live total,
  partner-mode switch, selection serialised into the CTA. Extends the Sun Savings calculator
  pattern (`proposals/sun-savings/index.html`), not invented from scratch.
- All prices in one `PRICING` object so a rate change is a small diff.

## Gates
- WCAG 2.2 AA is a ship-blocker and is not inherited from the template.
- qa-verifier closes from a fresh context. Never self-close.
- Nothing published, indexed or pushed without Aldo.
