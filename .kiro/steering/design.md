---
inclusion: fileMatch
fileMatchPattern: ["apps/**", "packages/star/**"]
---

# Tinkr — Design

References:
- `design/mascot/star-directions.html` — mascot; the chosen direction is **A · Butter Bun**.
  In Tinkr the star leads the ghost crew.
- `design/mockups/index.html` — earlier camera-app mockups. Its tokens, type and overall feel
  still apply; its screens are superseded. New screens: promise cards, ghost run, report.

## Core idea
The **report is the hero**. Each promise is a card in the builder's own words, with a
verdict and, for broken promises, the proof (screenshot, the ghost's steps) right there.
The ghost crew and the star add warmth around the edges; the evidence is never decorated.

## Tokens
| Token | Value | Use |
|---|---|---|
| cream | `#FFF9F0` | page background |
| plum | `#34263F` | text, ink, primary buttons |
| plum-2 / plum-3 | `#5C4B6A` / `#6E5F7A` | secondary text (plum-3 is the lightest allowed for text) |
| butter | `#FFE49A` | star, star speech bubble |
| lavender / lav-soft | `#DCCBFF` / `#F1EBFF` | ghost crew accents |
| mint + `#1F6B4A` | `#CBEBDD` | KEPT |
| amber text `#8A6200` on `#FFF0C2` | | COULDNT_CHECK |
| pink + `#9B2F55` | `#F5C6D6` | BROKEN. Never use alarm red. |

## Type
- Headlines: **Bricolage Grotesque** 700–800, tight tracking.
- Interface and body: **Atkinson Hyperlegible** 400/700.
- Evidence (requests, responses) may use a monospace face; nothing else does.
- Sentence case everywhere. No all-caps labels, no `→` on buttons.

## Copy
- Status words: Kept / Broken / Couldn't check.
- Findings state human impact first, then the proof: "Any signed-in user can read Priya's
  journal entries. The Thief opened /entries/12 as another user and saw her canary text."
- Couldn't-check copy says why and what to do: "The Thief couldn't sign up: the sign-up
  form needs an invite code. Add a test invite code to let it in."
- Promise cards use plain yes/no questions: "Should other people be able to see your entries?"
- No security jargon in the main view (no "BOLA", "IDOR", "RLS"); jargon only in the details.

## Quality floor
Responsive to 360 px with no horizontal scroll, visible keyboard focus, WCAG AA text contrast,
`prefers-reduced-motion` respected. Tinkr checks other apps for accessibility, so its own UI
must pass its own Blind Ghost.
