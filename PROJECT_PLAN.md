# Tinkr — Project Plan

> Make the physical world programmable.
> Kiroween 2026 · Skeleton Crew · Deadline **Dec 4, 2026, 2:00 PM PT** (no extensions)

## Ground rules (from the official rules, read Nov 23)

- [ ] Built **with Kiro** — insufficient use = disqualification; Kiro usage is 20% of the score.
- [ ] All code written after Oct 30, 2026. Disclose any outside help or pre-existing code.
- [ ] Public GitHub repo, OSI license visible in the About section (MIT).
- [ ] `/.kiro` at the repo root with real specs, hooks and steering. Never gitignored.
- [ ] Skeleton Crew: two apps in two separate folders (`apps/quest`, `apps/inspect`).
- [ ] Public, working URL for judges. YouTube demo **under 3 minutes**.
- [ ] Write-up on how Kiro was used: specs, hooks, steering, MCP, property-based testing.
- [x] Request Kiro credits (form submitted Nov 23)
- [ ] Complete Devpost ID check when the email arrives (Devpost name must match government ID exactly)
- [ ] Redeem the credit code while signed in to the GitHub Kiro account, by **Dec 4**
- [ ] Optional bonuses: Best Student Project (needs student email + LinkedIn), blog post, #KiroweenHackathon26 social post.

## Positioning

Existing tangible-tracking toolkits (reacTIVision, TopCodes) track markers and send out
positions. None of them turn natural-language instructions into rules that are checked
against the physical scene. Tinkr's claim is that **pipeline**: an LLM *compiles* the
instruction, the camera *observes*, and a deterministic engine *judges*. Don't claim
that tracking or spatial reasoning is new.

## Architecture

```
tinkr/
├── .kiro/{steering,specs,hooks}
├── packages/
│   ├── core/        # pure TS, no React: tracking, spatial, temporal, rules, events, compiler
│   └── star/        # <TinkrStar state=…/> SVG + CSS mascot (React)
├── apps/
│   ├── quest/       # Vite + React puzzle game
│   └── inspect/     # Vite + React assembly verifier
├── api/compile.ts   # tiny serverless LLM proxy (keeps the API key off the client)
└── LICENSE, README.md
```

Data flow per frame (~15 fps):
`video → downscaled canvas → HSV masks per calibrated colour → blobs → tracker (IDs,
smoothing, occlusion) → WorldState → evaluator(rule tree, WorldState, EventLog) → RuleStatus tree → UI`

The LLM is called **only** when the user submits an instruction. Camera frames are never sent to it.

## Milestones and checklist

### M1 — Camera to live rule (Nov 23–25)
- [x] npm workspace, TS strict, Vitest (ESLint deferred)
- [x] Webcam capture with permission and disconnect handling
- [x] Click-to-calibrate colours (sample HSV range), saved to localStorage
- [x] Blob detection for 4 colours on a 160 px frame (~0.5 ms per frame)
- [x] Tracker: stable IDs, EMA smoothing, ~500 ms occlusion grace, visibility state
- [x] Normalised coordinates (0–1, origin top-left); distances in frame-height units
- [x] `NEAR` evaluator → SATISFIED / NOT_SATISFIED / UNCERTAIN
- [x] Event log with debounced (hysteresis) transitions
- [x] Debug page: video + overlay + rule editor + event log (`npm run dev`)
- [x] 41 unit + property-based tests (fast-check)
- [ ] **Test with a real webcam and real blocks** (only a synthetic camera was tested so far)

### M2 — Full rule engine (Nov 26–27) · built by Kiro CLI
Spec: `.kiro/specs/m2-rule-engine/`. **Blocked on hackathon Kiro credits** (free plan: 50/month).
- [x] Kiro wrote requirements, design, tasks (8 tasks)
- [x] Claude Code reviewed; Kiro revised design.md (composite logging, `/inside` sub-path, post-order, BEFORE edge cases)
- [ ] Kiro syncs requirements.md + tasks.md to the revised design.md (throttled mid-run; they are currently out of date)
- [ ] Kiro implements tasks 1–8, Claude Code reviews + runs tests after each
- [ ] `BETWEEN`, `MOVED_TO` (zones), `INSIDE` zone
- [ ] `BEFORE` and `SEQUENCE` built on the event log, not on the latest frame
- [ ] Zod rule schema, validated against the calibrated object IDs
- [ ] Recorded-frame fixtures (JSON WorldState sequences) for integration tests

### Mascot — TinkrStar · to be built by Kiro CLI
- [x] Three design directions explored (`design/mascot/star-directions.html`)
- [x] **Chosen: A · Butter Bun** (Nov 23)
- [x] Requirements spec: `.kiro/specs/tinkr-star/requirements.md`
- [ ] Kiro writes design + tasks, then builds `packages/star`

### Design
- [x] Mockups approved (Nov 23): `design/mockups/index.html` (Home, Quest, Inspect, report)
- [x] Design steering for Kiro: `.kiro/steering/design.md` (loads for `apps/**` and `packages/star/**`)

### M3 — Compiler (Nov 27–28)
- [ ] `compile(text, objects, zones)` → `{ok, rule}` or `{ok:false, reason, ambiguity}`
- [ ] Serverless proxy, provider set by env var, structured output
- [ ] 20 golden instruction→rule cases plus rejection cases
- [ ] Hand-written rule editor fallback (demo insurance)

### M4 — Tinkr Quest (Nov 29)
- [ ] Level list (5 hand-authored + "make your own" via the compiler)
- [ ] Live progress per condition, timer, score, completion screen
- [ ] TinkrStar as a guide: thinking while compiling, celebrating on success

### M5 — Tinkr Inspect (Nov 30)
- [ ] Assembly-area zone setup, ordered steps
- [ ] Missing / misplaced / out-of-order / uncertain states
- [ ] Inspection history + exportable completion report (JSON/printable)

### M6 — Reliability (Dec 1)
- [ ] Test matrix: correct, wrong, missing, occlusion, lighting change, wrong order, camera unplug, repeated events

### M7 — Polish, docs, video (Dec 2–3)
- [ ] Mascot states complete, reduced-motion support
- [ ] Landing page, onboarding, empty states
- [ ] README, Kiro write-up, deploy, record video
- [ ] Dec 4: submission buffer only

## Cut list (in order, if behind)
1. Inspect PDF report → JSON only
2. Quest scoring/timer
3. Mascot extra states (keep idle / thinking / success / uncertain)
4. `MOVED_TO` → reuse `INSIDE` zone

Never cut: the engine, the compiler, both apps working, tests, the `.kiro` artifacts.

## Top risks
| Risk | Mitigation |
|---|---|
| Colour tracking breaks under lighting | Calibration step, matte paper, plain background, `UNCERTAIN` state instead of false success |
| Not enough authentic Kiro use | Every feature starts as a Kiro spec; hooks run tests on save; log decisions |
| LLM emits bad rules | Strict Zod schema, closed enums of known IDs, explicit ambiguity response, golden tests |
| Time | Cut list above; keep the app runnable every day |

## Hardware & access
- 720p+ webcam on a stand or tripod looking down (phone as webcam works)
- 4–5 matte coloured blocks or paper squares (red, blue, green, yellow); a sheet of white paper as the "table"
- LLM API key; GitHub account; Kiro account + hackathon credits
- Hosting for judges (Vercel/Netlify free tier, includes the serverless function)

## Disclosure log
Record outside help here for the submission write-up.
- Nov 23: Architecture, plan, steering docs and the M1 requirements were written with Claude Code (Anthropic).
- Nov 23: M1 code (`packages/core`, `apps/quest` debug page, tests) was written by Claude Code at the entrant's direction, **not in Kiro**.

- Nov 23: Installed Kiro CLI 3.5.0. From M2 on, code is written by **Kiro CLI in headless mode**
  (`kiro-cli chat --no-interactive`), directed and reviewed by Claude Code.
  - Run 1: read-only check that Kiro loads the steering docs (passed).
  - Run 2: Kiro wrote the M2 spec (requirements, design, tasks).
  - Run 3–5: Kiro revised design.md from Claude Code's review; throttled before syncing the other files.
- Nov 23: Claude Code fixed TransitionDetector so holdMs = 0 commits on the same frame (a lag Kiro found in its design review).

- Nov 23: Mascot design exploration page and the TinkrStar requirements spec were written by Claude Code; the component itself will be built by Kiro.

⚠️ The rules require the project to be built with Kiro ("Insufficient use of Kiro will result in
disqualification"). If this is being submitted, later milestones need real Kiro use (specs, hooks,
steering) and this log must be disclosed accurately in the write-up.
