---
name: Tinkr
description: Your AI says it's done. Tinkr checks.
colors:
  navy: "#13235f"
  navy-raised: "#1c3283"
  signal-blue: "#2f4fc4"
  sky: "#dde4fb"
  mist: "#eef2fd"
  frame-line: "#8a9bd8"
  ink: "#0b1638"
  muted: "#4a5578"
  ground: "#f4f6fb"
  grid: "#e3e8f3"
  line: "#d9dfee"
  white: "#ffffff"
  star-gold: "#f4c542"
  true-green: "#1c7347"
  true-green-bg: "#dcf2e6"
  false-rose: "#b01f3a"
  false-rose-bg: "#fbe1e7"
  misleading-amber: "#855700"
  misleading-amber-bg: "#fcefcb"
  unchecked-slate: "#475271"
  unchecked-slate-bg: "#e5e9f3"
typography:
  display:
    fontFamily: "Jersey 15, system-ui, sans-serif"
    fontSize: "42px"
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "0.01em"
  headline:
    fontFamily: "Jersey 15, system-ui, sans-serif"
    fontSize: "30px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.01em"
  title:
    fontFamily: "Jersey 15, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.01em"
  verdict:
    fontFamily: "Jersey 15, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "0.01em"
  body:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
  body-small:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.55
  mono:
    fontFamily: "Atkinson Hyperlegible Mono, ui-monospace, monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  none: "0px"
spacing:
  cell: "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "24px"
  2xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "2px 8px"
  button-primary-hover:
    backgroundColor: "{colors.signal-blue}"
    textColor: "{colors.white}"
  button-ghost:
    backgroundColor: "{colors.white}"
    textColor: "{colors.navy}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "2px 8px"
  button-ghost-hover:
    backgroundColor: "{colors.sky}"
    textColor: "{colors.navy}"
  button-light:
    backgroundColor: "{colors.white}"
    textColor: "{colors.navy}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "2px 8px"
  panel:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "18px 20px 20px"
  check-row:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    padding: "11px 10px"
  check-row-hover:
    backgroundColor: "{colors.mist}"
  check-row-selected:
    backgroundColor: "{colors.sky}"
  verdict-true:
    backgroundColor: "{colors.true-green-bg}"
    textColor: "{colors.true-green}"
    typography: "{typography.verdict}"
    padding: "3px 10px"
  verdict-false:
    backgroundColor: "{colors.false-rose-bg}"
    textColor: "{colors.false-rose}"
    typography: "{typography.verdict}"
    padding: "3px 10px"
  verdict-misleading:
    backgroundColor: "{colors.misleading-amber-bg}"
    textColor: "{colors.misleading-amber}"
    typography: "{typography.verdict}"
    padding: "3px 10px"
  verdict-unchecked:
    backgroundColor: "{colors.unchecked-slate-bg}"
    textColor: "{colors.unchecked-slate}"
    typography: "{typography.verdict}"
    padding: "3px 10px"
  note-block:
    backgroundColor: "{colors.mist}"
    textColor: "{colors.navy}"
    padding: "14px 16px"
  evidence-log:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    typography: "{typography.mono}"
    padding: "12px"
  header-bar:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.white}"
    padding: "12px 24px"
---

# Design System: Tinkr

## Overview

**Creative North Star: "The Night-Shift Arcade"**

Tinkr is a checks page drawn as an 8-bit world. The ground is a pale blue-grey graph-paper grid; the shell is a committed navy that caps the page as a header bar and closes it as a band whose top edge steps up in pixels, with tiny pixel trees and mounds on the horizon. Between those two navy bands sit white panels with stepped pixel corners, a crew of ghost sprites who do the checking, and the Tinkr star who leads them. The look comes from the builder's "Pixo" reference (pixel display type, pixel illustration, light grid ground, a drenched band with a stepped edge), with navy in place of its pink.

The pixel world is the costume, not the reading surface. Headlines, verdicts, and claim numbers wear the pixel face; everything a builder must actually read (claims, steps, notes) is set in a legibility face at a calm 16px. Density is moderate: a two-column work surface (list of checks, then the opened check) that a beginner can scan and a developer can drill into. Colour beyond navy and its blue tints is rationed to the four verdicts, so a glance at the list reads as a scoreboard.

Motion is stepped, never eased: the detail swaps in two steps, the ghost walks the replay in four, the disclosure chevron turns in two. Everything snaps to the pixel.

**Key Characteristics:**
- Graph-paper grid ground (24px squares) under white pixel-framed panels.
- Navy shell top and bottom; the footer band has a pixel-stepped top edge and pixel scenery.
- Square everything: zero radius, corners cut in 4px pixel steps by SVG border-images.
- Pixel display type for headings and verdicts only; hyperlegible body for all reading.
- Ghost crew and star sprites, outlined in ink, as the product's characters.
- Four verdict colours, each a dark text hue on a pale tint.
- Stepped (`steps()`) timing on every transition.

## Colors

A navy-and-blue-tint palette on cool grey paper, with four outcome colours held in reserve.

### Primary
- **Night Navy** (navy): the shell. Header bar, footer band and its scenery, primary buttons, selected filter, ghost-button frames, and the "Sent to Kiro" text. The one colour that says Tinkr.
- **Raised Navy** (navy-raised): a lifted surface inside the navy header (the "Demo data" badge).
- **Signal Blue** (signal-blue): interaction. Hover fill of primary buttons, focus outline (3px, offset 3px), links and disclosure summaries, claim numbers, the text caret.

### Secondary
- **Sky Tint** (sky): selected state. The current check row, pressed ghost buttons, hover fill of ghost and light buttons, text selection, the screenshot address bar.
- **Mist Tint** (mist): quiet blocks and hover. Row hover, the replay's current step, the "Kiro is fixing it" note, the "Sent to Kiro" block.
- **Frame Periwinkle** (frame-line): the pixel border of panels only.

### Tertiary
- **Star Gold** (star-gold): the Tinkr star sprite and nothing else.

### Neutral
- **Ink** (ink): text, sprite outlines, the 4px screenshot frame, and the dark evidence-log ground.
- **Slate Muted** (muted): secondary text (notes, ledes, bylines, step counters).
- **Paper Ground** (ground): page background and inset blocks inside panels ("Kiro said", band list items).
- **Grid Line** (grid): the 1px lines of the 24px graph-paper ground.
- **Dotted Rule** (line): the dashed pixel rule between steps.
- **White** (white): panel and button fill, text on navy.

### Verdict colours
- **True Green** (true-green on true-green-bg), **False Rose** (false-rose on false-rose-bg), **Misleading Amber** (misleading-amber on misleading-amber-bg), **Couldn't-check Slate** (unchecked-slate on unchecked-slate-bg). Each is a dark hue that passes AA as text on its own pale tint and on white.

### Named Rules
**The Verdict Reserve Rule.** Green, rose, amber and slate mean an outcome and nothing else: verdict chips and icons, step results, the outline marking the element that passed or failed in the screenshot, and the amber flag on changes the agent did not mention. They are never decoration, never a brand accent, never a button.

**The Navy Shell Rule.** Navy is the frame of the world (header, footer band, primary actions). Interior surfaces are white and blue tints; a panel is never filled navy.

## Typography

**Display Font:** Jersey 15 (with system-ui fallback)
**Body Font:** Atkinson Hyperlegible Next (with system-ui fallback)
**Label/Mono Font:** Atkinson Hyperlegible Mono (with ui-monospace fallback)

**Character:** A chunky arcade bitmap face for the voice of the page, paired with a face designed for low-vision legibility for everything that must be read. The pairing says playful on top, careful underneath, which is the product's promise.

### Hierarchy
- **Display** (Jersey 15, 400, 42px, 0.95): the summary verdict line ("3 of 6 claims have problems"); the opened check's title sits just under it at 40px. Both drop to 36px and 34px under 640px. The wordmark is 34px.
- **Headline** (Jersey 15, 400, 30px, 1): section titles inside the navy band.
- **Title** (Jersey 15, 400, 24px, 1): sub-section heads in the detail ("What Grandma did", "What it saw").
- **Verdict** (Jersey 15, 400, 20px, 1.1): the verdict chip word. Claim numbers ("14·1") use the same face at 18px in Signal Blue; the badge at 16px.
- **Body** (Atkinson Hyperlegible Next, 400, 16px, 1.55): all reading text. Steps run at 14.5px, row notes at 13.5px, meta at 14px.
- **Label** (Atkinson Hyperlegible Next, 600, 14px): buttons, row names (600 at body size), the failing step.
- **Mono** (Atkinson Hyperlegible Mono, 400, 13px, 1.6): URLs, file paths, step counters (12px), and the evidence log sent to the agent.

### Named Rules
**The Costume and Reading Rule.** Jersey 15 is for headings, verdict words, claim numbers and the wordmark; it never sets a sentence a builder has to read. Anything longer than a title is Atkinson Hyperlegible Next.

**The Evidence Mono Rule.** Mono appears only where the text is machine truth: URLs, paths, logs, step counters. It is never used for tone.

## Layout

The page is a centred 1320px container with 24px side gutters on a fixed 24px graph-paper grid. The work surface is a two-column grid: a 420px left column (summary panel, filter buttons, list of checks) and a flexible right column (the opened check), 24px apart and top-aligned. Inside the detail, steps and screenshot sit in two equal columns 20px apart.

The footer is a full-bleed navy band, 88px below the work surface, its 12px pixel-stepped edge and 72px scenery strip rising above it; inside, two equal framed panels, 24px apart.

Spacing is built from a 4px pixel cell (frame steps, pixel icons, dotted rules) with layout gaps of 8, 12, 16, 20, 24 and 48px. Rows breathe at 11px vertical padding with 2px between them.

Responsive: under 980px both grids collapse to one column and choosing a check scrolls to and focuses the detail. Under 640px the header button and the detail's action wrap below their text, the step and screenshot columns stack, and display sizes step down.

## Elevation & Depth

Flat. There are no drop shadows. Depth comes from three devices: the pixel frame (a stepped periwinkle or navy border that reads as an object edge), tonal insets (Paper Ground and Mist blocks inside white panels), and the ink outline. Sprites carry a 1.5px ink outline built from four zero-blur drop-shadows, which is pixel-art line work, not elevation. The screenshot is framed with a solid 4px ink border so it reads as a different window.

### Named Rules
**The Flat Arcade Rule.** Nothing floats. An element is separated by a pixel frame, an ink outline or a tint, never by a blurred shadow. A pressed button moves down 2px instead of losing a shadow.

## Shapes

Zero radius everywhere. Corners are cut, not rounded: panels and buttons use 24px SVG border-images on a 4px cell grid, sliced at 8, so each corner steps two pixels deep. Panels have a 4px periwinkle outline with a white fill; buttons are solid stepped shapes (navy, white with navy outline, or white). The navy band's top edge is a repeating 48x12 pixel staircase. Icons are 8x8 pixel paths scaled up with crisp edges; sprites are 13 to 16 unit pixel grids. Dividers are dashed pixel rules (4px on, 4px off, 4px tall).

### Named Rules
**The Stepped Corner Rule.** Every corner is a pixel staircase in 4px steps. A `border-radius` anywhere breaks the world.

## Components

### Buttons
Chunky, stepped, and pressable.
- **Shape:** stepped pixel outline from an SVG border-image (8px slice), no radius.
- **Primary:** Night Navy fill, white 14px/600 label, 2px 8px padding inside the 8px frame. Hover turns the whole shape Signal Blue.
- **Ghost:** white fill with a navy pixel outline, navy label. Hover and pressed fill Sky Tint. Used for secondary actions ("Check this again", "Play the steps") and filters; a pressed filter becomes a solid navy primary.
- **Light:** solid white stepped shape, navy label, for actions on the navy header. Hover fills Sky Tint.
- **Active:** moves down 2px (disabled under reduced motion). **Focus:** 3px Signal Blue outline, 3px offset.
- Filter buttons carry their count in bold after the label.

### Cards / Containers (pixel panels)
- **Corner Style:** stepped pixel corners, no radius.
- **Background:** white, framed in Frame Periwinkle.
- **Shadow Strategy:** none (see Elevation & Depth).
- **Internal Padding:** 14 to 20px.
- Inset blocks inside panels use Paper Ground or Mist with no border.

### Check list (signature)
A list of full-width row buttons: a 28px verdict tile (pixel icon on the verdict tint), the claim name in 600 weight over a muted "Verdict: reason" note, and on the right the claim number in pixel type. The selected row fills Sky Tint and shows the checking ghost sprite beside its number. Hover fills Mist. J/K (and arrow keys inside the list) move the selection.

### Verdict chip
Pixel icon plus the verdict word in Jersey 15 at 20px, on its verdict tint, 3px 10px padding, square.

### Step replay
A numbered list (mono counters, verdict icon, step text) divided by dashed pixel rules. The failing step is False Rose at 600; an unverifiable step is Slate. During replay the current step fills Mist with an 8px bleed either side, and the ghost sprite walks the screenshot to the matching element in 260ms, 4-step jumps.

### Evidence screenshot
A 4px ink-framed window with a Sky Tint address bar (three pixel dots, mono URL in a white field) over a white page. The element that failed or passed carries a 3px verdict-colour outline offset 2px, and the ghost stands beside it.

### Evidence log
A `details` disclosure ("See what was sent") with a pixel chevron that turns in 2 steps, opening a mono block of light text on Ink.

### Navigation (header bar)
Night Navy bar: star sprite and Jersey wordmark, project name with a Raised Navy badge, mono URL and turn meta in pale blue, and a Light button pushed to the right. Wraps on small screens.

### Navy band with scenery
Full-bleed navy footer with a pixel-stepped top edge and a scrolling strip of pixel trees and mounds, holding framed white panels whose list items are Paper Ground rows led by a pixel verdict icon.

### Crew sprites
The ghost crew (Grandma, the Thief, the Listener) and the Tinkr star, drawn as SVG symbols with crisp edges and a 1.5px ink outline. They appear as the checker on a row, beside the detail title, walking the screenshot, in the summary scene, and as the star beside status notes.

## Do's and Don'ts

### Do:
- **Do** cut every corner in 4px pixel steps with the 24px SVG border-image frames (sliced at 8).
- **Do** set headings, verdict words, claim numbers and the wordmark in Jersey 15, and every readable sentence in Atkinson Hyperlegible Next at 16px.
- **Do** keep green, rose, amber and slate for outcomes only, as a dark hue on its own pale tint.
- **Do** use `steps()` timing for motion, and drop movement under `prefers-reduced-motion`.
- **Do** keep navy as the shell: header bar, footer band with its stepped edge, primary buttons.
- **Do** draw icons as pixel SVG paths with `shape-rendering: crispEdges`.
- **Do** use the 3px Signal Blue outline (offset 3px) for focus on every interactive element.

### Don't:
- **Don't** use `border-radius` or soft blurred shadows; separate with pixel frames, ink outlines and tints.
- **Don't** use a verdict colour as decoration, a brand accent or a button fill.
- **Don't** set body copy, steps or notes in the pixel face.
- **Don't** use mono for anything but URLs, paths, counters and logs.
- **Don't** use emojis anywhere in the interface; characters and icons are pixel art.
- **Don't** use eased or springy motion; every transition snaps in steps.
