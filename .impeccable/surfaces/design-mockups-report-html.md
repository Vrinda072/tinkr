---
version: 1
slug: "design-mockups-report-html"
primary_target: "design/mockups/report.html"
related_targets: []
---

# Report screen

Scope: the full Tinkr report for one AI turn, opened in a browser tab from the agent chat summary.
Mode: Operate.

Audience and job: vibe coders of every level checking whether the agent's claims for this turn are
true on the live app, seeing the proof for anything false, and knowing it was already sent back
to the agent. Content: claims (what you asked / what the AI said / what happened), verdicts,
replay steps, the evidence sent to Kiro, "You weren't told", "What your app does now".
Constraints: plain words, no emojis, demo content labelled as a demo, WCAG AA, keyboard use.

## Direction contract

THESIS: A checks page vibe coders already understand (list of checks, one opened with its steps
and screenshot), made friendly and unmistakably Tinkr by the pixel world. Refuses the card grid
dashboard and the chat-transcript report.

OWN-WORLD: Light pixel grid ground, navy #13235f as the committed shell colour (header band and a
pixel-edged navy footer band), blue tints for structure, Jersey 15 pixel display type, Atkinson Hyperlegible Next body,
Atkinson Hyperlegible Mono only for step logs and evidence (chosen over Geist: the detector flags
Geist as overused, and a legibility face suits a product that checks accessibility). Pixel-stepped frames on buttons and panels; pixel ghost and star
sprites, including a small crew scene in the summary and pixel hills along the navy band; verdict colours (green, rose, amber, slate) only on verdicts.

STORY: The builder sees at once how many claims failed, opens the failing one, watches what the
ghost did step by step, and sees that Kiro already has the evidence and is fixing it.

FIRST VIEWPORT: Header (pixel star logo + Tinkr wordmark, project and turn, Re-run checks). Left
column: summary ("3 of 6 claims have problems"), filter tabs, the list of checks with pixel verdict
icons and the checking ghost. Right column: the selected check: title, verdict, "Kiro said" quote,
numbered steps with the failing step marked, the browser screenshot, and the "Sent to Kiro" status.

FORM: canon (the category standard, standing exit), executed in the builder's pinned pixel navy
look at the polish of Lovable and Bolt. Position: the standing-exit canon card.
seed:775344438e65c3b1

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the
verdict, DESIGN.md, and every shipping raster carrying its provenance

Signature interaction: selecting a check (click or J/K) swaps the detail with a stepped,
pixel-snapped transition, and the failing step is marked as the replay reaches it.
