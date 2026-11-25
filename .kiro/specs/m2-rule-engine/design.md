> **Superseded (Nov 25, 2026).** Tinkr changed direction from a camera rule engine to a promise checker for vibe-coded apps (see `PROJECT_PLAN.md`). Kept for history; do not implement.

# Design: M2 — Full rule engine

## Overview

M1 evaluates a single `NEAR` leaf per frame and debounces it. M2 extends the engine to
five rule types — `BETWEEN`, `INSIDE`, `MOVED_TO`, `BEFORE`, `ALL` — in a recursive tree.
The central design decision is a **two-phase evaluation** that keeps temporal rules honest:
leaves are per-frame and debounced; composites derive from debounced leaf statuses and the
EventLog and never touch the WorldState. Composites also commit their own transitions to the
EventLog via a second `TransitionDetector`, so that parent composites read children's events
uniformly whether they are leaves or composites. This section documents that architecture, the
path scheme, each evaluator's algorithm, the Zod schema, the engine changes, and the file
layout.

## Two-phase evaluation

### Why two phases

A rule like `BEFORE(MOVED_TO(red, "zoneA"), NEAR(red, blue))` asks "was the object moved
into zone A *before* it got near blue?" That is a question about committed events, not
about the current frame. If we evaluated both children per frame and compared raw statuses,
a brief flicker would produce false orderings. By debouncing each leaf independently and
then deriving composites from the debounced results, composites see only stable,
committed state — the same state the EventLog records.

Because composites can nest inside other composites (e.g., `BEFORE(MOVED_TO(...), ALL(...))`),
a parent composite must be able to read a child composite's committed events, not just leaf
events. To make this uniform, every composite commits its own status transitions to the
EventLog at its own path, using a second `TransitionDetector` with `holdMs = 0` (its inputs
are already debounced, so no additional hold time is needed). A parent like BEFORE then reads
its children's events the same way whether a child is a leaf or a composite.

### Phase 1 — leaves

Leaf rules are the ones that look at the WorldState directly: `NEAR`, `BETWEEN`, `INSIDE`.
Each leaf is evaluated per frame as a pure function `(rule, world) => Evaluation` and
debounced by the **leaf `TransitionDetector`** (`leafTransitions`, `holdMs` from engine
options, default 300 ms) under a stable path ID. The debounced status and the raw evaluation
are stored in a `StatusMap` keyed by path.

```
Phase 1 (per frame):
  for each leaf in walkTree(ruleTree) where phase === "leaf":
    raw    = evaluateLeaf(leaf.rule, world)                    // pure
    status = leafTransitions.update(leaf.path, raw.status, t)  // debounced
    statuses[leaf.path] = { raw, status }
```

`MOVED_TO` is a composite but creates a hidden `INSIDE` leaf at its own sub-path
`<path>/inside`. That INSIDE leaf is evaluated and debounced in Phase 1 like any other
leaf. The MOVED_TO composite then runs in Phase 2 and reads the EventLog for the
`<path>/inside` path — never its own path — so the hidden INSIDE leaf's transitions are
not conflated with the MOVED_TO composite's transitions.

### Phase 2 — composites

Composite rules are `MOVED_TO`, `BEFORE`, and `ALL`. They are pure functions of
`(rule, path, statuses: StatusMap, EventLog)` and never access `WorldState`. They run
after all leaves have been evaluated and debounced.

```
Phase 2 (per frame, after Phase 1):
  for each composite node in walkTree(ruleTree) where phase === "composite":  // post-order
    raw    = evaluateComposite(rule, path, statuses, log)
    status = compositeTransitions.update(path, raw.status, t)  // holdMs = 0
    statuses[path] = { raw, status }   // MOVED_TO overrides raw (see below)
```

`walkTree` returns nodes in **post-order** (children before parents), so iterating the
composite nodes in list order processes them bottom-up without reversing.

Composites get a **second `TransitionDetector`** (`compositeTransitions`, `holdMs = 0`)
that commits their status transitions to the same `EventLog`. Since their inputs (the
`StatusMap`, which is filled bottom-up from already-debounced leaf statuses) are already
stable, no additional hold time is needed; the `holdMs = 0` detector simply records the
composite's transitions so that parent composites can read them.

> **Implementation note:** The existing `TransitionDetector` has a one-frame delay for
> status changes even when `holdMs = 0` (it sets a pending entry on the first frame, then
> commits on the next). For composites this is acceptable — the propagation delay is one
> frame per nesting level. If immediate commit is desired, the `TransitionDetector` can
> be adjusted to commit on the first call when `holdMs === 0` (skip the pending step).
> Either way, the EventLog is the source of truth for temporal rules.

`MOVED_TO` overrides the `raw` in its `StatusMap` entry: the `raw` is the hidden INSIDE
leaf's per-frame evaluation (from `statuses[path + "/inside"]?.raw`), not the composite's
own evaluation. The `status` is the MOVED_TO composite's committed status from
`compositeTransitions`. This lets the UI show "currently inside" (from `raw`) separately
from "has been moved into" (from `status`).

### StatusMap type

```ts
interface LeafStatus {
  raw: Evaluation;       // per-frame evaluation (leaf) or composite evaluation
  status: Status;        // debounced (committed) status from the TransitionDetector
}
type StatusMap = Record<string, LeafStatus>;  // keyed by path, filled bottom-up
```

This type lives in `types.ts` alongside the existing `Evaluation` and `Status`. The
`StatusMap` holds entries for both leaves and composites, so every composite can read any
child's status from it — replacing the earlier `LeafStatuses` design that only held leaf
entries and left composites unable to see nested composite children.

## Path assignment

Every node in the rule tree — leaf or composite — gets a stable path ID derived from the
top-level rule's ID and the tree structure. Both `TransitionDetector` instances use this
path as their `ruleId`, so debouncing is per-node, not per-top-level-rule.

```
Top-level rule:    "r1"
BEFORE children:   "r1/first",  "r1/then"
ALL children:      "r1/rules/0", "r1/rules/1", ...
MOVED_TO:          uses its own path ("r1" or "r1/first" etc.)
                   the hidden INSIDE leaf lives at <path>/inside
```

Nesting example for `BEFORE(MOVED_TO(red, "A"), ALL(NEAR(red, blue), INSIDE(green, "B")))`
with ID `"r1"`:

```
r1                    BEFORE (composite)
r1/first              MOVED_TO (composite)
r1/first/inside       INSIDE (hidden leaf for MOVED_TO)
r1/then               ALL (composite)
r1/then/rules/0      NEAR (leaf)
r1/then/rules/1      INSIDE (leaf)
```

Phase 1 leaves: `r1/first/inside` (INSIDE for MOVED_TO), `r1/then/rules/0` (NEAR), `r1/then/rules/1` (INSIDE).
Phase 2 composites (post-order): `r1/first` (MOVED_TO), `r1/then` (ALL), `r1` (BEFORE).

`walkTree` returns nodes in post-order (children before parents):

```
1. { path: "r1/first/inside",  rule: INSIDE,   phase: "leaf" }
2. { path: "r1/first",         rule: MOVED_TO, phase: "composite" }
3. { path: "r1/then/rules/0",  rule: NEAR,      phase: "leaf" }
4. { path: "r1/then/rules/1",  rule: INSIDE,    phase: "leaf" }
5. { path: "r1/then",          rule: ALL,       phase: "composite" }
6. { path: "r1",               rule: BEFORE,    phase: "composite" }
```

Phase 1 iterates the leaf nodes (1, 3, 4). Phase 2 iterates the composite nodes
(2, 5, 6) in list order — already bottom-up, no reversing needed.

Path assignment is implemented in `rules/paths.ts` as a pure function that walks a rule
tree and returns a flat list of `{ path, rule, phase }` entries in post-order. For
`MOVED_TO`, `walkTree` synthesises an `InsideRule`
(`{ type: "INSIDE", subject, zone }`) for the hidden leaf at `<path>/inside`.

## Evaluator algorithms

### BETWEEN (leaf, Phase 1)

Given subject `s`, segment endpoints `a` and `b`, and `tolerance`, all in normalised
coordinates with `world.aspect` available:

```
1. Check visibility: if any of s, a, b is not visible → UNCERTAIN.
2. Compute the segment vector: dx = (b.x - a.x) * aspect, dy = (b.y - a.y).
3. Compute the parameter t = dot(s-a, b-a) / |b-a|²:
     t = ((s.x - a.x)*aspect * dx + (s.y - a.y) * dy) / (dx*dx + dy*dy)
4. If t ≤ 0.1 or t ≥ 0.9 → NOT_SATISFIED (subject is not between a and b).
5. Compute the projection point P = a + t*(b-a).
6. Compute perpendicular distance: d = distance(s, P, aspect).
7. If d ≤ tolerance → SATISFIED, else NOT_SATISFIED.
```

Symmetry in `a`/`b`: swapping `a` and `b` maps `t` to `1 - t`. The (0.1, 0.9) window is
symmetric, so the inside/outside test is preserved. The perpendicular distance is
independent of the segment direction. Therefore the result is the same either way.

The `distance()` function from `spatial/near.ts` is reused for the aspect-corrected
perpendicular distance, keeping distance semantics consistent across all spatial rules.

### INSIDE (leaf, Phase 1)

```
1. Check visibility: if subject not visible → UNCERTAIN.
2. If zone not in world.zones → UNCERTAIN.
3. Check: zone.x ≤ s.x < zone.x + zone.w AND zone.y ≤ s.y < zone.y + zone.h.
4. If both hold → SATISFIED, else NOT_SATISFIED.
```

### MOVED_TO (composite, Phase 2)

MOVED_TO wraps a hidden INSIDE leaf at `<path>/inside`. The leaf is evaluated and
debounced in Phase 1 by `leafTransitions`. In Phase 2, MOVED_TO checks the EventLog for
the `<path>/inside` path (never its own path) for a specific transition:

```
1. Read events = log.forRule(path + "/inside").
2. Scan events for a transition from NOT_SATISFIED to SATISFIED.
3. If found → SATISFIED (latched).
4. If not found:
   - If statuses[path + "/inside"]?.status is UNCERTAIN → UNCERTAIN.
   - Otherwise → NOT_SATISFIED.
```

Key detail: the first event the hidden INSIDE leaf logs has `from: null`. If the object
is already inside the zone when the rule starts, the first event is
`{ from: null, to: SATISFIED }`. This is NOT a `NOT_SATISFIED → SATISFIED` transition, so
MOVED_TO is not satisfied. The object must leave (producing `SATISFIED → NOT_SATISFIED`)
and re-enter (producing `NOT_SATISFIED → SATISFIED`) for MOVED_TO to latch.

The MOVED_TO composite commits its own status transitions to the EventLog at its own
path via `compositeTransitions`. This is separate from the hidden INSIDE leaf's events at
`<path>/inside`, so a parent BEFORE that reads `log.forRule(path)` sees MOVED_TO's
composite events, not the INSIDE leaf's events.

Latching is derived from the log: once a `NOT_SATISFIED → SATISFIED` transition exists at
`<path>/inside`, the rule stays SATISFIED regardless of the object's subsequent position.

The `raw` field in the `StatusMap` entry for MOVED_TO is the hidden INSIDE leaf's
per-frame evaluation (from `statuses[path + "/inside"]?.raw`), so the UI can show
"currently inside" separately from "has been moved into."

### BEFORE (composite, Phase 2)

BEFORE checks ordering over committed events for its `first` and `then` sub-paths.
Because composites commit their own transitions to the EventLog, BEFORE reads its
children's events uniformly whether they are leaves or composites.

```
firstPath = path + "/first"
thenPath  = path + "/then"
firstEvents = log.forRule(firstPath)
thenEvents  = log.forRule(thenPath)

firstSatT     = timestamp of first event where to === "SATISFIED", or null
thenRealSatT  = timestamp of first event where to === "SATISFIED" AND from !== null, or null
thenInitial   = exists event with from === null && to === "SATISFIED"
```

`firstSatT` counts the initial event (`from === null`) because "first was already done
at start" is a valid first. `thenRealSatT` excludes the initial event because "then was
already done at start" is not a valid completion — the user must undo it and redo it in
the right order.

```
1. If firstSatT !== null AND thenRealSatT !== null AND thenRealSatT > firstSatT
     → SATISFIED (latched).

2. If firstSatT !== null AND thenRealSatT !== null AND thenRealSatT === firstSatT
     → NOT_SATISFIED, reason "both happened at the same moment" (not latched).

3. If thenRealSatT !== null AND (firstSatT === null OR firstSatT > thenRealSatT)
     → NOT_SATISFIED, reason "wrong order: <then> before <first>" (latched).

4. If thenInitial AND thenRealSatT === null
     → NOT_SATISFIED, reason "<then> was already done before starting — undo it first"
       (not latched).

5. Otherwise (neither has committed SATISFIED in order):
     - If statuses[firstPath]?.status === "UNCERTAIN"
       OR statuses[thenPath]?.status === "UNCERTAIN" → UNCERTAIN.
     - Else → NOT_SATISFIED.
```

**Latching semantics:**
- Cases 1 and 3 are latched: the log state that causes them (committed SATISFIED
  timestamps) is permanent, so the evaluator returns the same result every frame
  regardless of future events.
- Cases 2 and 4 are not latched: the evaluator recomputes from the log each frame without
  an explicit latch. In case 4, if the user undoes `then`, does `first`, then redoes
  `then`, a new real transition appears in the log and `thenRealSatT` becomes non-null,
  allowing the evaluator to return SATISFIED. In case 2, the tie persists as long as the
  first real transition timestamps remain equal, but the evaluator does not permanently
  lock into "wrong order."

The BEFORE composite commits its own status via `compositeTransitions` so that a parent
composite can read its events.

### ALL (composite, Phase 2)

```
1. For each index i, read the child's status at statuses[path + "/rules/" + i].
2. If any child status is NOT_SATISFIED → NOT_SATISFIED.
3. If all children are SATISFIED → SATISFIED.
4. Otherwise (no NOT_SATISFIED but at least one UNCERTAIN) → UNCERTAIN.
```

ALL reads its children's committed statuses from the `StatusMap`, not a separate
`leafStatuses` map. For children that are themselves composites (e.g., ALL inside
BEFORE), the status comes from Phase 2's bottom-up evaluation order — the child
composite's entry is already in the `StatusMap` because post-order guarantees children
are processed before parents.

Reason aggregates child reasons or lists which children are unsatisfied/uncertain.

## Zod schema design

`buildRuleSchema(objectIds, zoneIds)` returns a Zod schema that validates any rule tree
against the currently calibrated objects and configured zones.

### Structure

```ts
function buildRuleSchema(objectIds: readonly string[], zoneIds: readonly string[]) {
  const objId = z.enum(objectIds as [string, ...string[]]);
  const zoneId = z.enum(zoneIds as [string, ...string[]]);

  const near = z.object({
    type: z.literal("NEAR"),
    subject: objId,
    target: objId,
    threshold: z.number().gt(0).max(1.5),
  }).strict().refine(r => r.subject !== r.target, { message: "subject and target must differ" });

  const between = z.object({
    type: z.literal("BETWEEN"),
    subject: objId,
    a: objId,
    b: objId,
    tolerance: z.number().gt(0).max(1),
  }).strict().refine(r => r.subject !== r.a && r.subject !== r.b, { message: "subject must differ from a and b" });

  const inside = z.object({
    type: z.literal("INSIDE"),
    subject: objId,
    zone: zoneId,
  }).strict();

  const movedTo = z.object({
    type: z.literal("MOVED_TO"),
    subject: objId,
    zone: zoneId,
  }).strict();

  // Recursive types via z.lazy
  const rule: z.ZodType<Rule> = z.lazy(() => z.union([
    near, between, inside, movedTo,
    z.object({
      type: z.literal("BEFORE"),
      first: rule,
      then: rule,
    }).strict(),
    z.object({
      type: z.literal("ALL"),
      rules: z.array(rule).min(1),
    }).strict(),
  ]));

  // Depth check: reject rules nested deeper than 4
  return rule.refine(r => maxDepth(r) <= 4, { message: "rule nesting exceeds maximum depth of 4" });
}
```

### Depth tracking

A `maxDepth` helper walks the tree: leaves have depth 0, `BEFORE` has depth `1 + max(first, then)`,
`ALL` has depth `1 + max(children)`. The `.refine` on the outer schema rejects anything deeper
than 4.

### Closed enums

Object IDs and zone IDs are `z.enum(...)`, so any ID not in the calibrated set is rejected.
This is the same mechanism M1 uses for NEAR; M2 extends it to zone IDs for INSIDE and
MOVED_TO.

### Type definitions

All rule interfaces live in `rules/schema.ts` (where `NearRule` and `Rule` already
reside), not in `types.ts`:

```ts
// rules/schema.ts

interface NearRule      { type: "NEAR";     subject: ObjectId; target: ObjectId; threshold: number; }
interface BetweenRule   { type: "BETWEEN";  subject: ObjectId; a: ObjectId; b: ObjectId; tolerance: number; }
interface InsideRule    { type: "INSIDE";   subject: ObjectId; zone: string; }
interface MovedToRule   { type: "MOVED_TO"; subject: ObjectId; zone: string; }
interface BeforeRule    { type: "BEFORE";   first: Rule; then: Rule; }
interface AllRule        { type: "ALL";      rules: Rule[]; }

type LeafRule = NearRule | BetweenRule | InsideRule;
type CompositeRule = MovedToRule | BeforeRule | AllRule;
type Rule = LeafRule | CompositeRule;
```

The `LeafRule` / `CompositeRule` split drives the two-phase dispatch:
`evaluateLeaf` accepts `LeafRule`, `evaluateComposite` accepts `CompositeRule`.

`LeafStatus` and `StatusMap` live in `types.ts` alongside `Evaluation` and `Status`.

## Engine changes

### Current `step` (M1)

```ts
step(frame, t) {
  world = detect + track;
  for (const [id, rule] of this.rules) {
    const raw = evaluate(rule, world);
    results[id] = { raw, status: this.transitions.update(id, raw.status, t) };
  }
  return { world, results };
}
```

### M2 `step` (two-phase)

```ts
step(frame, t) {
  world = detect + track;

  const statuses: StatusMap = {};

  for (const [id, rule] of this.rules) {
    const nodes = walkTree(rule, id);  // post-order: [{ path, rule, phase }]

    // Phase 1: evaluate and debounce leaves.
    for (const node of nodes.filter(n => n.phase === "leaf")) {
      const raw = evaluateLeaf(node.rule, world);
      const status = this.leafTransitions.update(node.path, raw.status, t);
      statuses[node.path] = { raw, status };
    }

    // Phase 2: evaluate composites bottom-up (post-order already gives this).
    for (const node of nodes.filter(n => n.phase === "composite")) {
      const raw = evaluateComposite(node.rule, node.path, statuses, this.log);
      const status = this.compositeTransitions.update(node.path, raw.status, t);
      statuses[node.path] = {
        raw: node.rule.type === "MOVED_TO"
          ? statuses[node.path + "/inside"]?.raw ?? { status: "UNCERTAIN", reason: "no data" }
          : raw,
        status,
      };
    }
  }

  return { world, results: statuses };
}
```

The engine holds two `TransitionDetector` instances, both writing to the same `EventLog`:

```ts
constructor(opts) {
  this.tracker = new Tracker(opts);
  this.leafTransitions = new TransitionDetector(this.log, opts.holdMs ?? 300);
  this.compositeTransitions = new TransitionDetector(this.log, 0);  // holdMs = 0
  ...
}
```

### `setRule` / `removeRule` changes

When a rule is set or replaced, the engine must forget all sub-paths under that rule ID
in **both** `TransitionDetector` instances. `allPaths(rule, id)` returns every path in
the tree, including hidden `/inside` paths and composite paths:

```ts
setRule(id, rule) {
  const oldRule = this.rules.get(id);
  if (oldRule) {
    for (const path of allPaths(oldRule, id)) {
      this.leafTransitions.forget(path);
      this.compositeTransitions.forget(path);
    }
  }
  this.rules.set(id, rule);
}

removeRule(id) {
  const rule = this.rules.get(id);
  if (rule) {
    for (const path of allPaths(rule, id)) {
      this.leafTransitions.forget(path);
      this.compositeTransitions.forget(path);
    }
  }
  this.rules.delete(id);
}
```

### `evaluate` function split

The existing `rules/evaluate.ts` is split into:
- `rules/evaluateLeaf.ts` — dispatches `NEAR`, `BETWEEN`, `INSIDE` (Phase 1). A composite
  rule passed here throws.
- `rules/evaluateComposite.ts` — dispatches `MOVED_TO`, `BEFORE`, `ALL` (Phase 2). Takes
  `(rule, path, statuses: StatusMap, log: EventLog)`.
- `rules/evaluate.ts` — barrel that re-exports `evaluateLeaf` and `evaluateComposite`.

There is **no** backward-compatibility `evaluate(rule, world)` that dispatches composites.
A composite cannot be evaluated without the log and statuses, so the old `evaluate`
function is replaced by `evaluateLeaf` (leaf-only). The engine calls `evaluateLeaf` in
Phase 1 and `evaluateComposite` in Phase 2. External callers that used `evaluate` for
leaf rules (e.g., `apps/quest/src/debug`, which uses NEAR through the engine only) are
unaffected — the engine handles dispatch internally.

`index.ts` exports the new functions and types.

## File layout

New and modified files (all under `packages/core/src/`):

```
types.ts                    (modified: add LeafStatus, StatusMap)

rules/schema.ts             (modified: add BetweenRule, InsideRule, MovedToRule,
                             BeforeRule, AllRule, LeafRule, CompositeRule;
                             buildRuleSchema with recursion, zoneIds, depth)
rules/schema.test.ts        (new or extended: schema acceptance/rejection tests)
rules/paths.ts              (new: walkTree in post-order + allPaths)
rules/paths.test.ts         (new: path assignment + post-order tests)
rules/evaluateLeaf.ts       (new: Phase 1 dispatch — NEAR, BETWEEN, INSIDE)
rules/evaluateComposite.ts  (new: Phase 2 dispatch — MOVED_TO, BEFORE, ALL)
rules/evaluate.ts           (modified: barrel re-export of evaluateLeaf, evaluateComposite)
rules/all.ts                (new: evaluateAll composite)
rules/all.test.ts           (new: unit + property tests)

spatial/between.ts          (new: evaluateBetween + projection helpers)
spatial/between.test.ts     (new: unit + property tests)
spatial/inside.ts           (new: evaluateInside)
spatial/inside.test.ts      (new: unit tests)

temporal/movedTo.ts         (new: evaluateMovedTo composite)
temporal/movedTo.test.ts    (new: unit tests)
temporal/before.ts          (new: evaluateBefore composite)
temporal/before.test.ts     (new: unit + property tests)

engine.ts                   (modified: two-phase step, two TransitionDetectors,
                             StatusMap, per-path results, forget all paths in both)
engine.test.ts              (modified: two-phase integration tests)

packages/core/fixtures/     (new: *.json WorldState sequences)
rules/integration.test.ts   (new: replay fixtures through engine)
```

Conventions followed (from structure.md):
- One concept per file; files under ~200 lines.
- Tests sit next to source as `*.test.ts`.
- Evaluators named after the rule type: `evaluateBetween`, `evaluateInside`, etc.
- `spatial/` for per-frame geometry, `temporal/` for event-based logic.
- No React, no DOM access outside `camera/`.
- Time injected; no `Date.now()` inside evaluators.

## Public API additions

`index.ts` gains:

```ts
export { evaluateBetween } from "./spatial/between";
export { evaluateInside } from "./spatial/inside";
export { evaluateMovedTo } from "./temporal/movedTo";
export { evaluateBefore } from "./temporal/before";
export { evaluateAll } from "./rules/all";
export { evaluateLeaf, evaluateComposite } from "./rules/evaluate";
export { walkTree, allPaths } from "./rules/paths";
export type { BetweenRule, InsideRule, MovedToRule, BeforeRule, AllRule,
              LeafRule, CompositeRule } from "./rules/schema";
export type { LeafStatus, StatusMap } from "./types";
```

Note: `evaluate` is no longer exported; it is replaced by `evaluateLeaf` for leaf rules.
