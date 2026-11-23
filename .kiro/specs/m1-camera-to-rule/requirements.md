# Requirements: M1 — Camera to live rule

## Introduction
The smallest end-to-end slice of Tinkr Core: a webcam sees 3 calibrated coloured objects,
tracks them with stable identities, evaluates a hand-written `NEAR` rule every frame, and
records debounced state transitions in an event log. There is no LLM in this milestone.
A debug page in `apps/quest` (temporary) shows it working.

## Requirement 1: Project scaffold
**User story:** As a developer, I want a working monorepo so that core and apps build and test from one command.

#### Acceptance criteria
1. WHEN `npm install && npm test` runs at the repo root THEN all workspace tests SHALL run and pass.
2. WHEN `npm run dev` runs THEN the Vite dev server SHALL serve the debug page.
3. The repo SHALL contain `packages/core`, `apps/quest` and an MIT `LICENSE`.

## Requirement 2: Camera input
**User story:** As a user, I want Tinkr to use my webcam so that it can see my objects.

#### Acceptance criteria
1. WHEN the page loads THEN the system SHALL request camera access and show the live feed.
2. IF permission is denied THEN the system SHALL show a clear message and a retry button.
3. IF the camera track ends (unplugged) THEN the system SHALL mark all objects not visible, show a "camera disconnected" state, and SHALL NOT emit SATISFIED events.

## Requirement 3: Colour calibration
**User story:** As a user, I want to click an object to teach Tinkr its colour so that tracking works in my lighting.

#### Acceptance criteria
1. WHEN the user selects a label (red/blue/green/yellow) and clicks the video THEN the system SHALL sample a small patch around the click and store an HSV range for that label.
2. The system SHALL persist calibration in `localStorage` and SHALL work if storage is unavailable.
3. WHEN a label has no calibration THEN that object SHALL be reported as not visible.

## Requirement 4: Detection and tracking
**User story:** As a developer, I want stable tracked objects so that rules don't flicker.

#### Acceptance criteria
1. The system SHALL process frames on a canvas downscaled to at most 160 px wide, at no less than 10 fps on a typical laptop.
2. For each calibrated label the system SHALL find the largest connected blob above a minimum area and report a `TrackedObject` (see tech steering) with normalised coordinates.
3. The tracker SHALL smooth centroids with an exponential moving average.
4. WHEN an object disappears for less than the occlusion grace period (default 500 ms) THEN it SHALL keep its last position and `visible` SHALL remain true with reduced `quality`.
5. WHEN an object has been missing longer than the grace period THEN `visible` SHALL be false.
6. `quality` SHALL be derived only from measurable signals (area stability, time since last seen) and SHALL be in [0,1].

## Requirement 5: NEAR evaluation
**User story:** As a user, I want to see whether one object is near another so that I can verify a placement.

#### Acceptance criteria
1. `evaluateNear(rule, world)` SHALL be a pure function returning `{ status, reason }`.
2. IF either object is not visible THEN status SHALL be `UNCERTAIN`.
3. IF the centroid distance is ≤ `threshold` THEN status SHALL be `SATISFIED`, otherwise `NOT_SATISFIED`.
4. NEAR SHALL be symmetric for distance (property test).

## Requirement 6: Debounced event log
**User story:** As a developer, I want a reliable event history so that temporal rules can be built on it later.

#### Acceptance criteria
1. WHEN a rule's status has differed from its last committed status for at least `holdMs` (default 300 ms) THEN the system SHALL commit the new status and append an event `{ t, ruleId, from, to }`.
2. Status changes shorter than `holdMs` SHALL NOT produce events (no repeated events from flicker).
3. The EventLog SHALL be append-only and queryable by `ruleId`.
4. Time SHALL be injected so tests run without real clocks.

## Requirement 7: Debug view
**User story:** As a developer, I want to see what the engine sees so that I can tune it.

#### Acceptance criteria
1. The page SHALL overlay each tracked object's bbox and label on the video, dimmed when quality is low.
2. The page SHALL show the active rule with a colour-coded status (green / grey / amber for uncertain).
3. The page SHALL list the most recent 20 events.

## Out of scope for M1
LLM compilation, BETWEEN/MOVED_TO/BEFORE, zones, the mascot, the second app, deployment.
