---
inclusion: always
---

# Tinkr — Tech

## Stack
- npm workspaces, TypeScript `strict`, ES modules
- Node 20+ for the runner, CLI and MCP server; Vite + React 18 for the apps
- Playwright for ghosts (browser, network capture, video, traces, screenshots, console logs)
- axe-core for accessibility rules
- Zod for every schema that crosses a boundary (LLM output, claims, promises, findings, tool-call logs)
- Vitest for tests, fast-check for property-based tests

## Core rules for `packages/core`
- Pure TypeScript: no browser, Playwright or Node-only imports. Ghosts live in `packages/ghosts`.
- Time is injected. Never call `Date.now()` inside judging code.
- Judging functions are pure: (check, observations) → finding.
- Anything not actually exercised is `COULDNT_CHECK`, never `TRUE` / `KEPT`.
- Every `FALSE`, `MISLEADING` or `BROKEN` finding references at least one piece of evidence.

## Key types (change only via a spec)
```ts
type Actor = "owner" | "other_user" | "visitor";          // visitor = signed out
type Action = "read" | "update" | "delete";
type Source = { from: "prompt" | "spec" | "agent_reply" | "user"; quote: string };

// A step Grandma performs. Targets are accessible names/labels, never CSS selectors.
type Step =
  | { do: "goto"; path: string }
  | { do: "click"; target: string }
  | { do: "fill"; target: string; value: string }
  | { do: "press"; key: string };
type Expect =
  | { type: "text_visible"; text: string }
  | { type: "url_matches"; pattern: string }
  | { type: "no_errors" };                                   // no console errors, no 4xx/5xx from the app

type Check =
  | { type: "FEATURE";    as: Actor; steps: Step[]; expect: Expect[] }
  | { type: "PRIVATE";    resource: string; actions: Action[]; deniedTo: Actor[] }
  | { type: "ROLE_ONLY";  page: string; allowedRoles: string[] }
  | { type: "ACCESSIBLE"; page: string; keyboard: boolean; rules: "wcag2aa" }
  | { type: "TESTS";      command: string }                  // run tests + inspect the diff for edited tests
  | { type: "BOT_NEVER";  tool: string; unless?: { approvalBy: "user" } }
  | { type: "BOT_LIMIT";  tool: string; arg: string; max: number };

interface Claim   { id: string; source: Source; plain: string; check: Check }   // from the agent's reply
interface Promise_ { id: string; source: Source; plain: string; check: Check; confirmed: boolean } // from the builder

type Verdict = "TRUE" | "FALSE" | "MISLEADING" | "COULDNT_CHECK";  // promises use KEPT/BROKEN/COULDNT_CHECK
interface Finding {
  subjectId: string; ghost: string; verdict: Verdict | "KEPT" | "BROKEN";
  reason: string;          // plain English: what happened, where
  failedStep?: number;     // index into steps for FEATURE checks
  evidence: string[];      // ids: video, screenshots, trace, console log, request/response, diff hunk, tool-call log
}

interface Unmentioned { path: string; area: "payments" | "auth" | "database" | "deleted_data" | "security_rules"; diffRef: string }
```

## How checks are judged (deterministic)
- **FEATURE (Grandma):** run the steps; if a step's target can't be found → `FALSE` with
  `failedStep`; after the steps, every `expect` must hold → `TRUE`, else `FALSE`.
  Login or page unreachable for reasons outside the claim → `COULDNT_CHECK`.
- **PRIVATE (Thief):** as `owner`, create content with a canary (`tinkr-canary-<random>`);
  record the requests; replay and browse as `other_user` / `visitor`; canary seen → `FALSE`/`BROKEN`.
- **TESTS:** run the command. Exit 0 and no test files changed in this turn's diff → `TRUE`.
  Exit 0 but test files were changed to make them pass (assertions removed/loosened, tests
  skipped) → `MISLEADING` with the diff hunk. Non-zero → `FALSE`.
- **Unmentioned:** paths in this turn's diff that match sensitive areas and are not covered by
  any claim are listed under "You weren't told". This is a list, not a verdict.

## Handback to the agent
For every `FALSE` / `MISLEADING` / `BROKEN` finding, build an evidence pack: the claim, the
failing step, URL, visible error text, console errors, failed requests, screenshot path.
Expose it via MCP (`get_findings`) and include it in the hook prompt. Never paste raw user data.

## LLM
- Three jobs only: extract claims from the agent's reply, extract promises from prompts/spec,
  and plan checks (steps + expectations) for each. Output must parse with Zod; invalid output
  is rejected, not repaired.
- Provider and key come from env vars (`.env`, never committed). Plans are cached by
  app + claim hash so reruns cost nothing.
- Only text the user or agent wrote is sent to the LLM. App data, canaries and evidence never are.

## Testing
- Every judging function gets unit tests plus fast-check properties (e.g. no evidence → never
  FALSE; no observation → COULDNT_CHECK; edited tests + exit 0 → never TRUE).
- End-to-end tests run the ghosts against the demo apps in `demo/`, which contain known
  planted bugs and a recorded agent reply with false claims, and assert each is caught.
