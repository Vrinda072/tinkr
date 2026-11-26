> **Updated Nov 26:** the approved look is now the dark pixel-art crew in
> `design/mascot/crew-pixel.html`. Where this spec mentions the Butter Bun ink outline, shading
> or SVG paths, follow the pixel sheet instead: 40 × 40 sprites drawn as SVG `<rect>` pixels (or a
> canvas), scaled with crisp edges, one outline colour `#0D0A17`, motion in whole steps. The
> states, API, accessibility and test requirements below still apply.

# Requirements: TinkrStar mascot component

## Introduction
Tinkr's mascot is a small, expressive five-pointed star. The approved visual direction is
**A · Butter Bun** from `design/mascot/star-directions.html`: chubby rounded points, a wobbly
hand-inked plum outline, butter fill with a soft lower-right shade band and an upper-left
shine, dot eyes with a white highlight, pink cheeks. That page is the visual reference: the
star path generator (`starPath`), the face shapes and the keyframes in it are approved and
should be reused, not redrawn.

In Tinkr the star leads the ghost crew: it is thinking while ghosts run, celebrates when every
promise is kept, and looks uncertain when something couldn't be checked.

The component lives in `packages/star` as `@tinkr/star` and is used by both apps. It reacts to
real application state passed in by the app. It never animates on its own schedule.

## Requirement 1: Package and API
**User story:** As an app developer, I want one reusable mascot component so that Tinkr for apps and Tinkr for bots share the same character.

#### Acceptance criteria
1. The package SHALL export `<TinkrStar state size? label? onBoop? />` from `@tinkr/star`.
2. `state` SHALL be one of `"idle" | "thinking" | "success" | "uncertain" | "error" | "celebrating"`.
3. `size` SHALL accept a pixel number (default 96) and the star SHALL scale cleanly from 24 px to 320 px.
4. The component SHALL have no dependencies beyond React. Animation SHALL be SVG + CSS keyframes, with no animation library and no canvas.
5. Multiple instances on one page SHALL NOT conflict (unique SVG `id`s for filters and clip paths).

## Requirement 2: Look (Butter Bun)
#### Acceptance criteria
1. The star SHALL use the Butter Bun parameters from the reference page: ratio 0.6, outer rounding 0.42, inner rounding 0.3, the same jitter array.
2. Fill `#FFE49A`, shade band `#F2C35E` at 50% opacity, outline `#34263F` 3.6 px with the turbulence "ink" displacement filter.
3. WHEN `size` < 48 THEN the ink filter and shine highlight SHALL be dropped and the outline thickened proportionally so the silhouette stays crisp at small sizes.

## Requirement 3: States
#### Acceptance criteria
1. **idle:** gentle float with squash and stretch (3.2 s loop), blink every ~4.6 s, occasional twinkles.
2. **thinking:** head tilt, eyes looking up-right, small "o" mouth, a "?" and a sparkle rising and fading.
3. **success:** squash → jump → 360° spin → land, with a sparkle burst. Plays **once** per change into `success`, then settles into a happy idle (smile, `^ ^` eyes).
4. **celebrating:** like success but loops for as long as the state is held (level complete screens).
5. **uncertain:** gentle side-to-side wobble, one raised brow, squiggle mouth, a small bobbing "?". No harsh motion.
6. **error:** the uncertain face with a slower, smaller wobble and no "?" (for camera or compiler failures). Never red, never shaking.
7. WHEN `state` changes THEN the new animation SHALL start from its beginning.

## Requirement 4: Interaction
#### Acceptance criteria
1. WHEN the star is clicked or tapped THEN it SHALL play a short squish ("boop") and call `onBoop` if given.
2. WHILE idle and the pointer is over the star's container THEN the eyes SHALL look toward the pointer (max 3 px offset).
3. The component SHALL accept an optional `lookAt` prop `{ x, y }` in page coordinates so an app can point the eyes at an important UI element.
4. The star SHALL NOT capture pointer events outside its own bounds, and SHALL NOT overlap or block app controls.

## Requirement 5: Accessibility and motion
#### Acceptance criteria
1. The SVG SHALL have `role="img"` and an `aria-label` (default `"Tinkr star, <state>"`, overridable via `label`).
2. WHEN `prefers-reduced-motion: reduce` is set THEN all looping and jumping motion SHALL stop. State SHALL still be shown through the face alone.
3. Clickable stars SHALL be keyboard-focusable with a visible focus ring, and Enter/Space SHALL trigger the boop.

## Requirement 6: Verification
#### Acceptance criteria
1. A demo page in `packages/star` (or Storybook-free plain Vite page) SHALL show every state at 32 px, 96 px and 240 px.
2. Tests SHALL check: correct face group shown per state, unique ids across instances, `success` plays once then settles, reduced-motion removes animation classes, keyboard boop works.

## Requirement 7: Ghost crew
**User story:** As a vibe coder, I want each checker to be a recognisable character so that reports are friendly and easy to scan.

#### Acceptance criteria
1. The package SHALL also export `<TinkrGhost kind state size? label? />` with `kind` one of `"thief" | "listener" | "grandma" | "owl" | "trickster"`.
2. Ghosts SHALL match `design/mascot/crew.html`: the same ghost path, ink outline, shading, face language and accessories (Thief mask and torch, Listener headphones and Tab key, Grandma bun, glasses and teacup, Night Owl tufts and phone, Trickster curl and speech bubble).
3. Ghost `state` SHALL be one of `"idle" | "haunting" | "found" | "clear"`: float; drift with the accessory active; pounce with a pink "!" badge; slump with dizzy sparkles.
4. A ghost that finds a problem SHALL NOT turn red or look alarming; the "!" badge uses pink `#F5C6D6`.
5. When the crew is shown with the star, the star state SHALL follow the run: idle → idle, haunting → thinking, found → uncertain, clear → success.
6. Requirements 1.3–1.5, 4.1–4.4 and 5.1–5.3 apply to ghosts too.

## Out of scope
Sound, speech bubbles, physics, 3D, and any mascot behaviour not driven by app state.
