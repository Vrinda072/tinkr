---
inclusion: fileMatch
fileMatchPattern: ["apps/**", "packages/star/**"]
---

# Tinkr — Design

Approved references (match these, don't reinvent them):
- `design/mockups/index.html` — Home, Tinkr Quest (+ level complete). Its Inspect and report
  screens are superseded: Inspect was replaced by Tinkr Focus (Nov 24). Reuse their calm
  panel style for Focus until a Focus mockup exists.
- `design/mascot/star-directions.html` — mascot; the chosen direction is **A · Butter Bun**.

## Core idea
The camera view of the table is the hero of every app screen. Rules are drawn on top of the
live video as **hand-inked overlays** (wobbly plum ink, same turbulence filter as the star):
lines between objects, dashed NEAR circles, dashed zone outlines with a label tag, corner
brackets on tracked objects, and a dashed "?" ghost at an object's last-known position when it
is out of view. Everything else stays quiet.

## Tokens
| Token | Value | Use |
|---|---|---|
| cream | `#FFF9F0` | page background |
| plum | `#34263F` | text, ink, primary buttons |
| plum-2 / plum-3 | `#5C4B6A` / `#6E5F7A` | secondary text (plum-3 is the lightest allowed for text) |
| butter | `#FFE49A` | star, star speech bubble |
| lavender / lav-soft | `#DCCBFF` / `#F1EBFF` | Tinkr Quest only |
| mint + `#1F6B4A` | `#CBEBDD` | SATISFIED / done / passed |
| amber text `#8A6200` on `#FFF0C2` | | UNCERTAIN / can't check |
| pink + `#9B2F55` | `#F5C6D6` | needs attention / misplaced / wrong order. Never use alarm red. |
| table | `#EFE5D5` | behind the camera view |

Block colours on the board are real-object colours (red `#E5484D`, blue `#3E63DD`,
green `#30A46C`, yellow `#F2C200`) and are never used for UI chrome.

## Type
- Headlines: **Bricolage Grotesque** 700–800, tight tracking.
- Interface and body: **Atkinson Hyperlegible** 400/700.
- Sentence case everywhere. No all-caps labels, no monospace decoration, no `→` on buttons.

## Layout
- App screens: camera board left (~60%), rule panel right; stacks below 900 px.
- Quest: playful — lavender wash, 28–32 px radii, the star guides in a butter speech bubble.
- Focus: calm — white panels, 14 px radii, thin borders; a large session timer; the star is a
  small companion that reacts when the phone is picked up.
- Report: a printable paper sheet (4 px radius), no star.

## Copy
- Status words: Done / Your move (Quest); Focusing / Paused / Can't see your phone (Focus).
- Explanations say what's wrong and how to fix it with real numbers from the engine,
  e.g. "Blue is 0.31 from red. Move it within 0.15 of red."
- Out-of-view copy names the object and the time: "Green hasn't been visible for 3 seconds."
- Only show rule types the engine supports.

## Quality floor
Responsive to 360 px with no horizontal scroll, visible keyboard focus, WCAG AA text contrast,
and `prefers-reduced-motion` respected (the star keeps its face but stops moving).
