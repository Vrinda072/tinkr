---
inclusion: always
---

# Tinkr — Structure

```
packages/core/src/
  camera/      # getUserMedia wrapper, frame grabber (only DOM-touching module)
  vision/      # HSV conversion, colour calibration, blob detection
  tracking/    # Tracker: IDs, smoothing, occlusion grace, visibility
  spatial/     # near, between, inside, movedTo (pure)
  temporal/    # before, sequence over EventLog
  rules/       # Zod schemas, buildRuleSchema(objects, zones), evaluate(rule, world, log)
  events/      # EventLog, debounced transition detector
  compiler/    # client for api/compile, prompt template, response validation
  index.ts     # public API only
packages/core/fixtures/   # recorded WorldState sequences for integration tests
packages/star/            # <TinkrStar state=… />
apps/quest/  apps/inspect/
api/compile.ts
```

## Conventions
- One concept per file; files under ~200 lines.
- Tests sit next to source as `*.test.ts`.
- Apps import only from `@tinkr/core` and `@tinkr/star` public entry points, never deep paths.
- Name evaluators after the rule type: `evaluateNear`, `evaluateBetween`, ...
