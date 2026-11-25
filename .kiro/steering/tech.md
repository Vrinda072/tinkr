---
inclusion: always
---

# Tinkr — Tech

## Stack
- npm workspaces, TypeScript `strict`, ES modules
- Node 20+ for the runner, CLI and MCP server; Vite + React 18 for the apps
- Playwright for ghosts (browser, network capture, traces, screenshots)
- axe-core for accessibility rules
- Zod for every schema that crosses a boundary (LLM output, promises, findings, tool-call logs)
- Vitest for tests, fast-check for property-based tests

## Core rules for `packages/core`
- Pure TypeScript: no browser, Playwright or Node-only imports. Ghosts live in `packages/ghosts`.
- Time is injected. Never call `Date.now()` inside judging code.
- Judging functions are pure: (promise, observations) → finding.
- Anything not actually exercised is `COULDNT_CHECK`, never `KEPT`.
- Every `BROKEN` finding references at least one piece of evidence.

## Key types (change only via a spec)
```ts
type Actor = "owner" | "other_user" | "visitor";          // visitor = signed out
type Action = "read" | "update" | "delete";

type Source = { from: "prompt" | "spec" | "user"; quote: string };

type TinkrPromise =
  | { type: "PRIVATE";    resource: string; actions: Action[]; deniedTo: Actor[] }
  | { type: "ROLE_ONLY";  page: string; allowedRoles: string[] }
  | { type: "ACCESSIBLE"; page: string; keyboard: boolean; rules: "wcag2aa" }
  | { type: "BOT_NEVER";  tool: string; unless?: { approvalBy: "user" } }
  | { type: "BOT_LIMIT";  tool: string; arg: string; max: number };

interface PromiseRecord { id: string; promise: TinkrPromise; source: Source; confirmed: boolean }

type Verdict = "KEPT" | "BROKEN" | "COULDNT_CHECK";
interface Finding {
  promiseId: string; ghost: string; verdict: Verdict;
  reason: string;     // plain English, human impact
  evidence: string[]; // ids of screenshots, Playwright traces, request/response pairs, tool-call logs
}
```

## How the Thief decides (deterministic)
1. As `owner`, create content containing a unique canary string (`tinkr-canary-<random>`).
2. Record the owner's network requests for that resource.
3. Replay them, and browse, as `other_user` and `visitor`.
4. Canary found in any page text or response body for a denied actor → `BROKEN`.
   Replay could not run (sign-up failed, page not found) → `COULDNT_CHECK` with the reason.

## LLM
- Two jobs only: extracting promises from prompt/spec text, and planning which pages and
  forms the ghosts visit. Output must parse with Zod; invalid output is rejected, not repaired.
- Provider and key come from env vars (`.env`, never committed). Plans are cached by
  app + promise hash so reruns cost nothing.
- Only text the user supplies is sent to the LLM. App data, canaries and evidence never are.

## Testing
- Every judging function gets unit tests plus fast-check properties
  (e.g. a finding with no evidence is never BROKEN; no observation → COULDNT_CHECK).
- End-to-end tests run the ghosts against the demo apps in `demo/`, which contain known
  planted bugs, and assert that each one is found and nothing else is reported.
