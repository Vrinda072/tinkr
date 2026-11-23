---
inclusion: always
---

# Tinkr — Tech

## Stack
- npm workspaces, TypeScript `strict`, ES modules (dependency-free source packages; Vite compiles core directly)
- Vite + React 18 + Tailwind for apps; Motion for React only where CSS can't do it
- Zod for every schema that crosses a boundary (LLM output, saved levels, events)
- Vitest for tests, fast-check for property-based tests
- No OpenCV for M1: plain canvas `getImageData` + HSV thresholding is enough for matte coloured objects. Revisit only if tests show it fails.

## Core rules for `packages/core`
- No React, no DOM access outside `camera/`. Everything else is pure and testable with plain objects.
- Coordinates are normalised to `[0,1]`, origin top-left, x right, y down.
- Time is injected (`now: number` in ms). Never call `Date.now()` inside evaluators.
- Evaluators return `"SATISFIED" | "NOT_SATISFIED" | "UNCERTAIN"` plus a short human-readable `reason`.
- Any rule that references an object that isn't visible returns `UNCERTAIN`, not `NOT_SATISFIED`.
- Temporal rules read the EventLog only. They never infer order from the current frame.
- State transitions are debounced: a condition must hold for `holdMs` (default 300 ms) before a SATISFIED event is emitted, and must fail for `holdMs` before it is revoked.

## Key types (keep stable; change only via a spec)
```ts
type ObjectId = string;              // calibrated colour label, e.g. "red"
interface TrackedObject {
  id: ObjectId;
  x: number; y: number;              // centroid, normalised
  bbox: { x: number; y: number; w: number; h: number };
  area: number;                      // fraction of frame
  visible: boolean;
  lastSeen: number;                  // ms
  quality: number;                   // 0..1 from area stability + visibility, never invented
}
interface WorldState { t: number; objects: Record<ObjectId, TrackedObject>; zones: Record<string, Zone>; }
type Zone = { id: string; x: number; y: number; w: number; h: number };

type Rule =
  | { type: "NEAR";    subject: ObjectId; target: ObjectId; threshold: number }
  | { type: "BETWEEN"; subject: ObjectId; a: ObjectId; b: ObjectId; tolerance: number }
  | { type: "INSIDE";  subject: ObjectId; zone: string }
  | { type: "MOVED_TO"; subject: ObjectId; zone: string }
  | { type: "BEFORE";  first: Rule; then: Rule }
  | { type: "ALL";     rules: Rule[] };
```

## LLM
- Called only from `api/compile.ts` (serverless). The key lives in an env var. The provider is set by env.
- Output must parse with the Zod `Rule` schema built **dynamically** from the currently calibrated object IDs and zones (closed enums). Unknown IDs mean rejection.
- The compiler may instead return `{ ok: false, reason, clarification? }` for unsupported or ambiguous text.

## Testing
- Every evaluator gets unit tests plus at least one fast-check property (e.g. NEAR is symmetric; BETWEEN(a,b) == BETWEEN(b,a)).
- Integration tests replay recorded WorldState sequences from `packages/core/fixtures/*.json`.
