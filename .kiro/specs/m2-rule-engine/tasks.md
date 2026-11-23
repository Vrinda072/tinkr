# Tasks: M2 — Full rule engine

> Each task touches roughly one source file plus its tests. Run `npm test` and
> `npm run typecheck` after every task — both must pass before moving on.

---

## Task 1: BETWEEN evaluator

**Files:**
- `packages/core/src/types.ts` (modify — add `BetweenRule`)
- `packages/core/src/spatial/between.ts` (new)
- `packages/core/src/spatial/between.test.ts` (new)
- `packages/core/src/rules/schema.ts` (modify — add BETWEEN to schema, accept `zoneIds` arg)
- `packages/core/src/rules/evaluate.ts` (modify — dispatch BETWEEN)

**What to do:**
1. Add `BetweenRule` interface to `types.ts`: `{ type: "BETWEEN"; subject: ObjectId; a: ObjectId; b: ObjectId; tolerance: number }`.
2. Extend `Rule` union with `BetweenRule`. Split into `LeafRule = NearRule | BetweenRule` and `CompositeRule` (for now empty, just `never`).
3. In `schema.ts`: add `between` object to `buildRuleSchema` with closed-enum `a`/`b`, `.strict()`, `.refine(r => r.subject !== r.a && r.subject !== r.b)`. Add `zoneIds` second parameter (unused in this task, but signature changes now to avoid touching it again). Return `z.union([near, between])`.
4. In `spatial/between.ts`: implement `evaluateBetween(rule, world)`.
   - Reuse `visibilityProblem(world, [subject, a, b])` from `spatial/visibility.ts`.
   - Project subject centroid onto segment a→b: compute parameter `t = dot(s-a, b-a) / |b-a|²` using aspect-corrected coordinates.
   - Reject if `t ≤ 0.1` or `t ≥ 0.9` → NOT_SATISFIED.
   - Compute perpendicular distance using `distance()` from `spatial/near.ts` between subject and projection point.
   - SATISFIED if distance ≤ `tolerance`, else NOT_SATISFIED.
   - Reason string includes the parameter and distance values.
5. In `evaluate.ts`: add `case "BETWEEN": return evaluateBetween(rule, world)`.
6. Update `buildRuleSchema` calls in existing tests to pass `[]` for zoneIds.

**Tests (`between.test.ts`):**
- SATISFIED: subject centroid between a and b, close to the segment.
- NOT_SATISFIED: subject outside the (0.1, 0.9) parameter window.
- NOT_SATISFIED: subject too far from the segment (perpendicular distance > tolerance).
- UNCERTAIN: one of the three objects not visible.
- UNCERTAIN: one of the three objects missing from world.
- UNCERTAIN: camera down.
- Property test (fast-check): `evaluateBetween(a, b)` and `evaluateBetween(b, a)` produce the same status for random visible positions.
- Property test: distance uses aspect correction (horizontal separation costs more on wide frames).

**Build check:** `npm test && npm run typecheck` pass.

---

## Task 2: INSIDE evaluator

**Files:**
- `packages/core/src/types.ts` (modify — add `InsideRule`)
- `packages/core/src/spatial/inside.ts` (new)
- `packages/core/src/spatial/inside.test.ts` (new)
- `packages/core/src/rules/schema.ts` (modify — add INSIDE with zone enum)
- `packages/core/src/rules/evaluate.ts` (modify — dispatch INSIDE)

**What to do:**
1. Add `InsideRule` to `types.ts`: `{ type: "INSIDE"; subject: ObjectId; zone: string }`. Add to `LeafRule` union.
2. In `schema.ts`: add `inside` object with `zone: zoneId` (closed enum of the `zoneIds` parameter). Add to the union returned.
3. In `spatial/inside.ts`: implement `evaluateInside(rule, world)`.
   - Reuse `visibilityProblem(world, [rule.subject])`.
   - Look up `world.zones[rule.zone]`. If missing → UNCERTAIN with reason "unknown zone".
   - Check `zone.x ≤ s.x < zone.x + zone.w && zone.y ≤ s.y < zone.y + zone.h`.
   - SATISFIED if inside, NOT_SATISFIED if outside.
4. In `evaluate.ts`: add `case "INSIDE": return evaluateInside(rule, world)`.

**Tests (`inside.test.ts`):**
- SATISFIED: centroid inside the zone rectangle.
- NOT_SATISFIED: centroid outside the zone rectangle (each edge: left, right, top, bottom).
- UNCERTAIN: subject not visible.
- UNCERTAIN: zone not in `world.zones`.
- UNCERTAIN: camera down.
- Boundary: centroid exactly on the zone edge (top-left corner is inside, just past bottom-right is outside).

**Build check:** `npm test && npm run typecheck` pass.

---

## Task 3: Composite schema + path assignment

**Files:**
- `packages/core/src/types.ts` (modify — add `MovedToRule`, `BeforeRule`, `AllRule`, `LeafStatus`, `LeafStatuses`)
- `packages/core/src/rules/schema.ts` (modify — add MOVED_TO, BEFORE, ALL with `z.lazy` recursion, depth check)
- `packages/core/src/rules/schema.test.ts` (new — or extend existing schema tests in `engine.test.ts`)
- `packages/core/src/rules/paths.ts` (new)
- `packages/core/src/rules/paths.test.ts` (new)
- `packages/core/src/rules/evaluate.ts` (modify — throw stubs for composite types)

**What to do:**
1. Add remaining rule interfaces to `types.ts`:
   - `MovedToRule { type: "MOVED_TO"; subject: ObjectId; zone: string }`
   - `BeforeRule { type: "BEFORE"; first: Rule; then: Rule }`
   - `AllRule { type: "ALL"; rules: Rule[] }`
   - Update `LeafRule = NearRule | BetweenRule | InsideRule`.
   - Update `CompositeRule = MovedToRule | BeforeRule | AllRule`.
   - Add `LeafStatus { raw: Evaluation; status: Status }` and `LeafStatuses = Record<string, LeafStatus>`.
2. In `schema.ts`: add `movedTo` (same shape as INSIDE but type literal "MOVED_TO"), `before` (first/then via `z.lazy(rule)`), `all` (rules array via `z.lazy(rule)`, min 1). Build the recursive `rule` via `z.lazy(() => z.union([...]))`. Add `maxDepth` helper and `.refine(r => maxDepth(r) <= 4)`.
3. In `evaluate.ts`: add `case "MOVED_TO"`, `case "BEFORE"`, `case "ALL"` that throw `new Error("not implemented")`. This keeps the typecheck green; the evaluators arrive in tasks 4–6.
4. In `rules/paths.ts`: implement `walkTree(rule, basePath)` returning `TreeNode[]` where `TreeNode = { path: string; rule: Rule; phase: "leaf" | "composite" }`. Also implement `allPaths(rule, basePath)` returning `string[]`.
   - NEAR, BETWEEN, INSIDE → leaf at `basePath`.
   - MOVED_TO → composite at `basePath` (hidden INSIDE leaf also at `basePath`, but the tree node is the composite).
   - BEFORE → composite at `basePath`, recurse into `first` at `basePath + "/first"` and `then` at `basePath + "/then"`.
   - ALL → composite at `basePath`, recurse into children at `basePath + "/rules/0"`, `basePath + "/rules/1"`, etc.
   - Return nodes in pre-order (parents before children) so the engine can iterate leaves first, then composites in reverse for bottom-up.

**Tests (`paths.test.ts`):**
- Flat rule (NEAR) → one leaf node at "r1".
- BEFORE(NEAR, INSIDE) → three nodes: composite "r1", leaf "r1/first", leaf "r1/then".
- ALL(NEAR, BETWEEN, INSIDE) → four nodes: composite "r1", leaves "r1/rules/0" through "r1/rules/2".
- Deeply nested: BEFORE(ALL(NEAR, INSIDE), MOVED_TO) → correct paths for all nodes.
- `allPaths` returns every path including sub-paths.
- No path collisions for any valid tree shape.

**Tests (`schema.test.ts`):**
- Accepts valid BETWEEN, INSIDE, MOVED_TO, BEFORE (with leaf children), ALL (with leaf children).
- Rejects unknown object ID in any position.
- Rejects unknown zone ID in INSIDE or MOVED_TO.
- Rejects subject === a or subject === b in BETWEEN.
- Rejects extra fields (`.strict()`).
- Rejects nesting deeper than 4 (e.g., BEFORE(BEFORE(BEFORE(BEFORE(NEAR, NEAR), NEAR), NEAR), NEAR)).
- Accepts nesting at exactly 4.

**Build check:** `npm test && npm run typecheck` pass. The throw stubs in `evaluate.ts` are never reached by existing tests since no test creates composite rules yet.

---

## Task 4: MOVED_TO evaluator

**Files:**
- `packages/core/src/temporal/movedTo.ts` (new)
- `packages/core/src/temporal/movedTo.test.ts` (new)

**What to do:**
1. Implement `evaluateMovedTo(rule: MovedToRule, path: string, leafStatuses: LeafStatuses, log: EventLog): Evaluation`.
   - Read `events = log.forRule(path)` (the hidden INSIDE leaf's committed transitions).
   - Scan for any event with `from === "NOT_SATISFIED" && to === "SATISFIED"`.
   - If found → `{ status: "SATISFIED", reason: "<subject> moved into <zone>" }` (latched).
   - If not found:
     - Read `leafStatuses[path]?.status`. If `UNCERTAIN` → UNCERTAIN. Otherwise → NOT_SATISFIED with reason explaining the object hasn't been moved into the zone.
2. This is a pure function tested directly with synthetic `LeafStatuses` and `EventLog` instances — no engine needed.

**Tests (`movedTo.test.ts`):**
- SATISFIED: log has a `NOT_SATISFIED → SATISFIED` transition at the path.
- NOT_SATISFIED: log has only `null → NOT_SATISFIED` (object never entered the zone).
- NOT_SATISFIED: log has `null → SATISFIED` only (object was already inside at start — does not count).
- SATISFIED after leave and re-enter: log has `null → SATISFIED`, `SATISFIED → NOT_SATISFIED`, `NOT_SATISFIED → SATISFIED`.
- Latched: once SATISFIED, stays SATISFIED even if subsequent events show the object left the zone.
- UNCERTAIN: no transition found and leaf status is UNCERTAIN.
- Works when nested under a BEFORE (path is `"r1/first"` not `"r1"`).

**Build check:** `npm test && npm run typecheck` pass. MOVED_TO is not yet wired into the engine; the evaluator is tested in isolation.

---

## Task 5: BEFORE evaluator

**Files:**
- `packages/core/src/temporal/before.ts` (new)
- `packages/core/src/temporal/before.test.ts` (new)

**What to do:**
1. Implement `evaluateBefore(rule: BeforeRule, path: string, leafStatuses: LeafStatuses, log: EventLog): Evaluation`.
   - `firstPath = path + "/first"`, `thenPath = path + "/then"`.
   - `firstSatT`: timestamp of the first event in `log.forRule(firstPath)` where `to === "SATISFIED"`, or null.
   - `thenSatT`: same for `thenPath`.
   - If `firstSatT !== null && thenSatT !== null && thenSatT > firstSatT` → SATISFIED (latched).
   - If `thenSatT !== null && firstSatT === null` → NOT_SATISFIED, reason mentions "wrong order".
   - If `thenSatT !== null && firstSatT !== null && thenSatT <= firstSatT` → NOT_SATISFIED, reason mentions "wrong order".
   - Otherwise: if either child's current status (`leafStatuses[firstPath]?.status` or `leafStatuses[thenPath]?.status`) is UNCERTAIN → UNCERTAIN. Else → NOT_SATISFIED.
2. Pure function, tested directly with synthetic data.

**Tests (`before.test.ts`):**
- SATISFIED: first committed SATISFIED at t=100, then committed SATISFIED at t=200.
- Wrong order (then first): then committed SATISFIED at t=100, first never committed SATISFIED → NOT_SATISFIED, reason contains "wrong order".
- Wrong order (same time): both committed SATISFIED at the same timestamp → NOT_SATISFIED, reason contains "wrong order".
- Latched: once SATISFIED, stays SATISFIED even if children later go NOT_SATISFIED.
- UNCERTAIN: neither child has committed SATISFIED and at least one is currently UNCERTAIN.
- NOT_SATISFIED: neither child has committed SATISFIED and both are currently NOT_SATISFIED.
- Property test (fast-check): generate random event sequences; if `then`'s first SATISFIED timestamp is ≤ `first`'s first SATISFIED timestamp (or first never satisfies), BEFORE is never SATISFIED.

**Build check:** `npm test && npm run typecheck` pass.

---

## Task 6: ALL evaluator

**Files:**
- `packages/core/src/rules/all.ts` (new)
- `packages/core/src/rules/all.test.ts` (new)

**What to do:**
1. Implement `evaluateAll(rule: AllRule, path: string, leafStatuses: LeafStatuses, log: EventLog): Evaluation`.
   - For each index `i`, read the child's status at `path + "/rules/" + i`.
   - For leaf children, status comes from `leafStatuses`. For composite children that have already been evaluated in Phase 2 (bottom-up order), their status is also available in the results map. To keep it simple and pure, `evaluateAll` receives a `statuses: Record<string, Status>` map (the engine populates this from both leaf and composite results before calling `evaluateAll`).
   - If any child status is NOT_SATISFIED → NOT_SATISFIED.
   - If all children are SATISFIED → SATISFIED.
   - Otherwise → UNCERTAIN.
   - Reason aggregates child reasons or lists which children are unsatisfied/uncertain.
2. **Design note:** To handle nested composites cleanly, the engine's Phase 2 processes nodes bottom-up and maintains a `pathStatuses: Record<string, Status>` that includes both leaf debounced statuses and composite results. `evaluateAll` reads from this map. For unit testing, the map is passed directly. Update the `evaluateComposite` signature to accept `pathStatuses: Record<string, Status>` instead of (or alongside) `leafStatuses`.

**Tests (`all.test.ts`):**
- SATISFIED: all children SATISFIED.
- NOT_SATISFIED: one child NOT_SATISFIED (even if others are SATISFIED or UNCERTAIN).
- UNCERTAIN: no child NOT_SATISFIED but at least one UNCERTAIN.
- Single child ALL behaves like that child.
- Property test (fast-check): for a random permutation of children with given statuses, `evaluateAll` produces the same result regardless of order.

**Build check:** `npm test && npm run typecheck` pass.

---

## Task 7: Engine two-phase refactor

**Files:**
- `packages/core/src/rules/evaluateLeaf.ts` (new — Phase 1 dispatch)
- `packages/core/src/rules/evaluateComposite.ts` (new — Phase 2 dispatch)
- `packages/core/src/rules/evaluate.ts` (modify — re-export, backward-compat `evaluate` for simple leaf rules)
- `packages/core/src/engine.ts` (modify — two-phase `step`, per-path results, `setRule`/`removeRule` forget sub-paths)
- `packages/core/src/engine.test.ts` (modify — update existing tests for new result shape, add two-phase tests)
- `packages/core/src/index.ts` (modify — export new functions and types)

**What to do:**
1. Create `evaluateLeaf.ts`: switch over `NearRule | BetweenRule | InsideRule`, calling `evaluateNear`, `evaluateBetween`, `evaluateInside`. Remove throw stubs from `evaluate.ts`.
2. Create `evaluateComposite.ts`: switch over `MovedToRule | BeforeRule | AllRule`, calling `evaluateMovedTo`, `evaluateBefore`, `evaluateAll`. This function takes `(rule, path, pathStatuses, log)`.
3. In `evaluate.ts`: keep a backward-compatible `evaluate(rule, world)` that dispatches to `evaluateLeaf` for leaf rules and throws for composites (composites need the engine context). Re-export `evaluateLeaf` and `evaluateComposite`.
4. Refactor `engine.ts`:
   - `step(frame, t)`:
     - Build `world` as before.
     - For each rule `(id, rule)`:
       - `nodes = walkTree(rule, id)`.
       - Phase 1: for each leaf node, `raw = evaluateLeaf(node.rule, world)`, `status = transitions.update(node.path, raw.status, t)`, store in `leafStatuses[node.path]` and `results[node.path]`.
       - Phase 2: for each composite node in reverse order (bottom-up): `pathStatuses` is a map of all known statuses (leaves + already-evaluated composites). Call `evaluateComposite(node.rule, node.path, pathStatuses, log)`. For MOVED_TO, the `raw` in results is the hidden INSIDE leaf's raw evaluation (from `leafStatuses[node.path]`), while `status` is the composite result.
     - Return `{ world, results }`.
   - `setRule(id, rule)`: call `allPaths(rule, id).forEach(p => transitions.forget(p))` before setting the rule.
   - `removeRule(id)`: same forget-all-paths.
5. Update `index.ts` exports.
6. Update existing `engine.test.ts` tests:
   - The existing NEAR tests should still pass (results keyed by "r1" with `raw` and `status`).
   - Add a test with a BEFORE rule: two NEAR leaves, verify per-path results and debounced transitions.
   - Add a test with an ALL rule: two NEAR leaves, verify per-path results.
   - Add a test with MOVED_TO: hidden INSIDE leaf, verify per-path results show INSIDE raw and MOVED_TO status.

**Tests (in `engine.test.ts`):**
- Existing NEAR tests still pass.
- BEFORE with two NEAR leaves: results has entries for "r1", "r1/first", "r1/then".
- ALL with two NEAR leaves: results has entries for "r1", "r1/rules/0", "r1/rules/1".
- MOVED_TO with INSIDE: results has entry for "r1" with `raw` = INSIDE evaluation, `status` = MOVED_TO result.
- setRule forgets old sub-paths (no stale events from previous rule tree).

**Build check:** `npm test && npm run typecheck` pass.

---

## Task 8: Fixtures + integration tests

**Files:**
- `packages/core/fixtures/correct-order.json` (new)
- `packages/core/fixtures/wrong-order.json` (new)
- `packages/core/fixtures/occluded-sequence.json` (new)
- `packages/core/fixtures/moved-to-starting-inside.json` (new)
- `packages/core/src/rules/integration.test.ts` (new)

**What to do:**
1. Create four fixture files, each a JSON object:
   ```json
   {
     "description": "...",
     "rule": { "type": "BEFORE", "first": { ... }, "then": { ... } },
     "objects": ["red", "blue", "green"],
     "zones": [{ "id": "A", "x": 0.3, "y": 0.3, "w": 0.2, "h": 0.2 }],
     "steps": [ { "t": 0, "world": { ... } }, ... ]
   }
   ```
   Each `world` in `steps` is a full `WorldState` with `t`, `aspect`, `cameraOk`, `objects`, `zones`.

2. Fixture contents:
   - **correct-order.json**: `BEFORE(MOVED_TO(red, "A"), NEAR(red, blue))`. Red starts outside zone A, moves in (MOVED_TO satisfied), then blue is placed near red (NEAR satisfied). Final BEFORE status: SATISFIED.
   - **wrong-order.json**: Same rule. Blue is placed near red first (NEAR satisfied), then red moves into zone A. Final BEFORE status: NOT_SATISFIED with "wrong order" reason.
   - **occluded-sequence.json**: `BEFORE(NEAR(red, blue), INSIDE(green, "A"))`. Green is briefly occluded (invisible) mid-sequence. Verify UNCERTAIN during occlusion, then SATISFIED after both conditions are met in order.
   - **moved-to-starting-inside.json**: `MOVED_TO(red, "A")`. Red starts inside zone A. MOVED_TO must NOT be satisfied initially. Red leaves, then re-enters. MOVED_TO becomes SATISFIED.

3. Create `integration.test.ts`:
   - Load each fixture, replay through `TinkrEngine.step` injecting the fixture timestamps.
   - Assert final per-path results and EventLog transitions match expectations.
   - Assert MOVED_TO starting-inside fixture: status is NOT_SATISFIED at start, SATISFIED after leave-and-reenter.
   - Assert wrong-order fixture: BEFORE status is NOT_SATISFIED with "wrong order" in reason.

**Tests:**
- Each fixture produces the expected final status for the top-level rule.
- Per-path results exist for all expected paths.
- EventLog contains the expected committed transitions.

**Build check:** `npm test && npm run typecheck` pass. This is the final task.

---

## Summary

| Task | Concept | Key files | New tests |
|------|---------|-----------|-----------|
| 1 | BETWEEN evaluator | spatial/between.ts, schema.ts, evaluate.ts | between.test.ts |
| 2 | INSIDE evaluator | spatial/inside.ts, schema.ts, evaluate.ts | inside.test.ts |
| 3 | Composite schema + path assignment | types.ts, schema.ts, rules/paths.ts | schema.test.ts, paths.test.ts |
| 4 | MOVED_TO evaluator | temporal/movedTo.ts | movedTo.test.ts |
| 5 | BEFORE evaluator | temporal/before.ts | before.test.ts |
| 6 | ALL evaluator | rules/all.ts | all.test.ts |
| 7 | Engine two-phase refactor | engine.ts, evaluateLeaf.ts, evaluateComposite.ts | engine.test.ts |
| 8 | Fixtures + integration tests | fixtures/*.json, integration.test.ts | integration.test.ts |

Tasks 1–2 add leaf evaluators with no architecture change. Task 3 introduces the
recursive schema and path infrastructure. Tasks 4–6 add composite evaluators as pure
functions tested in isolation. Task 7 wires everything together in the engine. Task 8
validates the full pipeline with recorded fixtures. The build stays green after each task.
