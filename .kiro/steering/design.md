---
inclusion: fileMatch
fileMatchPattern: ["apps/**", "packages/star/**", "design/**"]
---

# Tinkr — Design

**`DESIGN.md` at the repo root is the design authority** (tokens, type, frames, motion, rules),
derived from the approved report screen. `.impeccable/design.json` holds the same system as data.
Read it before building any screen. Product truth lives in `PRODUCT.md`.

References:
- `design/mockups/report.html` — **the approved report screen (Nov 26)**: navy pixel look from the
  builder's "Pixo" reference, plain checks layout (claims list left, selected claim right with
  steps, screenshot and the evidence sent to Kiro), "You weren't told", "What your app does now".
- `design/mascot/crew-pixel.html` — the pixel star and ghost crew (Thief, Listener, Grandma,
  Night Owl, Trickster) and their waiting / checking / found / kept states.
- Superseded, history only: `design/mockups/index.html`, `design/mascot/crew.html`,
  `design/mascot/star-directions.html` (the old cream and soft-ink look).

## Rules that matter most
- Navy `#13235f` shell on a light grid ground; Jersey 15 display, Atkinson Hyperlegible Next body,
  Atkinson Hyperlegible Mono only for URLs, paths and logs.
- Pixel-stepped frames (24px SVG border-images on a 4px cell grid, sliced at 8). No rounded
  corners, no blurred shadows, no emojis; icons are pixel SVGs.
- Verdict colours (True green, False rose, Misleading amber, Couldn't check slate) mark outcomes only.
- Motion moves in whole steps (`steps()`), never smooth tweens; all of it stops under reduced motion.
- Plain words: "False: clicking 'Create account' shows an error", never "the AI lied". No security
  jargon in the main view.
- Tinkr checks other apps for accessibility, so its own UI must pass its own Listener:
  WCAG AA contrast, full keyboard use, visible focus, no horizontal scroll at 360px.
