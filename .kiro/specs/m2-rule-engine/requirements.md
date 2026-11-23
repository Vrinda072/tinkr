# Requirements: M2 — Full rule engine

## Introduction
M1 shipped a single `NEAR` rule and the event log it needs. M2 extends the engine to
the full rule language the product requires: `BETWEEN`, `INSIDE`, `MOVED_TO`, `BEFORE`,
and `ALL`. Rules are recursive — `BEFORE` and `ALL` contain sub-rules — and the Zod schema
is built dynamically from the calibrated object IDs and zone IDs so unknown references
are rejected at parse time. Evaluation is restructured into two phases: leaf rules are
evaluated per frame and debounced under stable path IDs; composite rules are pure
functions of debounced leaf statuses and the EventLog, never touching the WorldState
directly. The engine returns results for every sub-path so apps can show per-step
progress.

## Requirement 1: BETWEEN rule
**User story:** As a user, I want to check that one object sits between two others so that I can verify a lineup or arrangement.

#### Acceptance criteria
1. `evaluateBetween(rule, world)` SHALL be a pure function returning `{ status, reason }`.
2. WHEN all three objects (subject, a, b) are visible THEN the evaluator SHALL project the subject's centroid onto the segment a→b and compute the projection parameter `t` and the perpendicular distance to the segment.
3. IF the projection parameter is strictly inside (0.1, 0.9) AND the perpendicular distance is ≤ `tolerance` THEN status SHALL be `SATISFIED`.
4. IF the projection parameter is outside (0.1, 0.9) OR the perpendicular distance exceeds `tolerance` THEN status SHALL be `NOT_SATISFIED`.
5. Distances SHALL be measured in frame-height units using the same aspect correction as `distance()` in `spatial/near.ts`.
6. BETWEEN SHALL be symmetric in `a` and `b` (property test): swapping `a` and `b` SHALL produce the same status.
7. IF any of the three objects is not visible (reusing `spatial/visibility.ts`) THEN status SHALL be `UNCERTAIN`.

## Requirement 2: Zones and INSIDE rule
**User story:** As a user, I want to define named rectangular zones and check whether an object is inside one, so that I can verify placements against areas.

#### Acceptance criteria
1. `WorldState.zones` (already present from M1) SHALL be populated by `TinkrEngine.setZones` and available to all evaluators.
2. `evaluateInside(rule, world)` SHALL be a pure function returning `{ status, reason }`.
3. WHEN the subject is visible and its centroid lies inside the zone rectangle THEN status SHALL be `SATISFIED`.
4. WHEN the subject is visible and its centroid lies outside the zone rectangle THEN status SHALL be `NOT_SATISFIED`.
5. IF the subject is not visible THEN status SHALL be `UNCERTAIN`.
6. WHEN `buildRuleSchema` is called with a set of zone IDs THEN the `INSIDE` zone field SHALL be a closed enum of those IDs; an unknown zone ID SHALL be rejected at parse time, just as unknown object IDs are rejected.
7. IF the referenced zone does not exist in `WorldState.zones` at evaluation time THEN status SHALL be `UNCERTAIN`.

## Requirement 3: MOVED_TO rule
**User story:** As a user, I want to check that an object has been moved into a zone, so that I can verify a repositioning step was actually performed.

#### Acceptance criteria
1. `MOVED_TO` SHALL be an event-based composite rule: it SHALL NOT be satisfied by the subject merely being inside the zone in the current frame.
2. MOVED_TO SHALL internally create a hidden `INSIDE` leaf at its own path, evaluated and debounced by the `TransitionDetector` like any other leaf.
3. WHEN the EventLog shows the hidden INSIDE leaf committed a transition from `NOT_SATISFIED` to `SATISFIED` THEN MOVED_TO SHALL become `SATISFIED`.
4. IF the object was already inside the zone when the rule became active (the first committed status is `SATISFIED` from `null`) THEN it SHALL NOT count until the object leaves and re-enters (a subsequent `NOT_SATISFIED` → `SATISFIED` transition).
5. Once `SATISFIED`, MOVED_TO SHALL latch: it SHALL remain `SATISFIED` regardless of the subject's subsequent position.
6. IF the hidden INSIDE leaf has never committed a `NOT_SATISFIED` → `SATISFIED` transition THEN MOVED_TO SHALL be `UNCERTAIN` when the leaf status is `UNCERTAIN`, and `NOT_SATISFIED` otherwise.
7. MOVED_TO SHALL be a pure function of `(rule, path, leafStatuses, EventLog)` and SHALL NOT read the `WorldState` directly.

## Requirement 4: BEFORE rule (ordering)
**User story:** As a user, I want to check that one condition was met before another, so that I can verify ordered steps and report when the order is wrong.

#### Acceptance criteria
1. `BEFORE(first, then)` SHALL determine ordering over committed events in the EventLog, never over the current frame.
2. WHEN `first` committed `SATISFIED` at t1 AND `then` committed `SATISFIED` at t2 > t1 THEN BEFORE SHALL be `SATISFIED` (latched).
3. IF `then` committed `SATISFIED` while `first` has never committed `SATISFIED` THEN BEFORE SHALL be `NOT_SATISFIED` with a reason that states the order was wrong, so Tinkr Inspect can report "wrong order".
4. IF neither sub-rule has committed a `SATISFIED` event yet THEN BEFORE SHALL follow its children: `UNCERTAIN` if either child is `UNCERTAIN`, otherwise `NOT_SATISFIED`.
5. Once `SATISFIED`, BEFORE SHALL latch.
6. BEFORE SHALL be a pure function of `(rule, path, leafStatuses, EventLog)` and SHALL NOT read the `WorldState` directly.
7. BEFORE SHALL never report `SATISFIED` when the log has `then` satisfied before `first` (property test).

## Requirement 5: ALL rule (conjunction)
**User story:** As a user, I want to check that multiple conditions all hold, so that I can verify a complete arrangement.

#### Acceptance criteria
1. `ALL(rules)` SHALL be `SATISFIED` when every child rule is `SATISFIED`.
2. `ALL(rules)` SHALL be `NOT_SATISFIED` when any child rule is `NOT_SATISFIED`.
3. `ALL(rules)` SHALL be `UNCERTAIN` when no child is `NOT_SATISFIED` but at least one child is `UNCERTAIN`.
4. ALL SHALL be a pure function of `(rule, path, leafStatuses, EventLog)` and SHALL NOT read the `WorldState` directly.
5. ALL SHALL be order-independent over its children: reordering the children SHALL produce the same status (property test).

## Requirement 6: Recursive rule schema
**User story:** As a developer, I want a single Zod schema that validates any rule tree against the known objects and zones, so that invalid rules are rejected before they reach the engine.

#### Acceptance criteria
1. `buildRuleSchema(objectIds, zoneIds)` SHALL accept two arguments: the calibrated object IDs and the configured zone IDs.
2. Object references (`subject`, `target`, `a`, `b`) SHALL be closed enums of `objectIds`; unknown IDs SHALL be rejected.
3. Zone references (`zone` in INSIDE and MOVED_TO) SHALL be a closed enum of `zoneIds`; unknown zone IDs SHALL be rejected.
4. The schema SHALL support recursion via `z.lazy`: `BEFORE.first` and `BEFORE.then` SHALL accept any rule type, and `ALL.rules` SHALL be a non-empty array of any rule type.
5. Maximum nesting depth SHALL be 4: a rule nested deeper than four levels SHALL be rejected.
6. Every rule object SHALL use `.strict()`: extra fields SHALL be rejected.
7. The `subject` of a rule SHALL differ from the other objects it is compared with: `NEAR` subject ≠ target, `BETWEEN` subject ≠ a and subject ≠ b.
8. `MOVED_TO` and `INSIDE` rules SHALL NOT be allowed as children of `BEFORE` or `ALL` at nesting depth > 0 if they would exceed the maximum depth.

## Requirement 7: Two-phase evaluation engine
**User story:** As a developer, I want the engine to separate leaf evaluation from composite evaluation, so that temporal rules are built on debounced events, not on noisy per-frame snapshots.

#### Acceptance criteria
1. `TinkrEngine.step` SHALL assign a stable path ID to every node in the rule tree: the top-level rule uses its rule ID (e.g. `"r1"`); `BEFORE` children use `"${path}/first"` and `"${path}/then"`; `ALL` children use `"${path}/rules/0"`, `"${path}/rules/1"`, etc.
2. Phase 1 (leaves: NEAR, BETWEEN, INSIDE) SHALL evaluate each leaf per frame and debounce it via the existing `TransitionDetector` under its path ID.
3. MOVED_TO SHALL internally create a hidden INSIDE leaf at its own path, evaluated and debounced in Phase 1.
4. Phase 2 (composites: MOVED_TO, BEFORE, ALL) SHALL be pure functions of `(rule, path, leafStatuses, EventLog)` and SHALL NOT access the `WorldState`.
5. Phase 2 SHALL run after Phase 1 in every `step` call.
6. WHEN a rule is set or replaced via `setRule` THEN the `TransitionDetector` SHALL forget all paths under that rule ID (including sub-paths).
7. Time SHALL remain injected; no evaluator or the engine SHALL call `Date.now()`.

## Requirement 8: Per-path results
**User story:** As an app developer, I want status for every sub-path in the rule tree, so that I can show per-step progress to the user.

#### Acceptance criteria
1. `StepResult.results` SHALL contain an entry for the top-level rule AND for every sub-path in the tree.
2. Each entry SHALL be a `RuleResult` with `raw` (the per-frame or composite evaluation) and `status` (the debounced or latched status).
3. For leaf paths, `raw` SHALL be the per-frame `Evaluation` and `status` SHALL be the `TransitionDetector`'s debounced status.
4. For composite paths, `raw` SHALL be the composite `Evaluation` (derived from leaf statuses and the EventLog) and `status` SHALL be the composite result (which is inherently debounced through its leaves' committed events).
5. For MOVED_TO, the path's `raw` SHALL reflect the hidden INSIDE leaf's per-frame evaluation, and `status` SHALL reflect the MOVED_TO composite's latched result.

## Requirement 9: Integration test fixtures
**User story:** As a developer, I want recorded WorldState sequences to replay through the engine, so that I can test the full pipeline deterministically without a camera.

#### Acceptance criteria
1. The repo SHALL contain at least four fixture files in `packages/core/fixtures/*.json`, each a JSON array of `WorldState` objects with a metadata header (rule, objects, zones, description).
2. Fixtures SHALL include: (a) correct order — `first` satisfied before `then`; (b) wrong order — `then` satisfied before `first`; (c) object briefly occluded during the sequence; (d) object starting inside the zone for MOVED_TO.
3. An integration test SHALL replay each fixture through `TinkrEngine.step`, injecting the fixture's timestamps, and assert the expected per-path results and EventLog transitions.
4. Fixtures SHALL use the same `WorldState` shape as the runtime (normalised coordinates, aspect, `cameraOk`, `objects`, `zones`).

## Requirement 10: Testing
**User story:** As a developer, I want comprehensive tests so that the engine is reliable and regressions are caught.

#### Acceptance criteria
1. Every new evaluator SHALL have unit tests covering `SATISFIED`, `NOT_SATISFIED`, and `UNCERTAIN` cases.
2. Property-based tests (fast-check) SHALL include: BETWEEN symmetric in a/b; ALL order-independent over its children; BEFORE never reports SATISFIED when the log has `then` satisfied before `first`.
3. The path assignment utility SHALL have unit tests verifying stable, non-colliding path IDs for nested rule trees.
4. `npm test` and `npm run typecheck` SHALL pass at the end of every task.
5. Every new source file SHALL be under ~200 lines; tests SHALL sit next to source as `*.test.ts`.

## Out of scope for M2
LLM compilation (M3), the Tinkr Inspect and Quest UIs (M4–M5), deployment, schema migration of saved levels (M3), and performance optimisation beyond the existing frame budget.
