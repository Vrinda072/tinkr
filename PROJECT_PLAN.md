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
- [ ] **Request Kiro credits by Dec 1, 12:00 PM PT.**
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
- [ ] pnpm workspace, TS strict, Vitest, ESLint
- [ ] Webcam capture with permission and disconnect handling
- [ ] Click-to-calibrate colours (sample HSV range)
- [ ] Blob detection for 3–5 colours on a downscaled frame
- [ ] Tracker: stable IDs, EMA smoothing, ~500 ms occlusion grace, visibility state
- [ ] Normalised coordinates (0–1, origin top-left)
- [ ] `NEAR` evaluator → SATISFIED / NOT_SATISFIED / UNCERTAIN
- [ ] Event log with debounced (hysteresis) transitions
- [ ] Debug page: video + overlay + hand-written rule + event log
- [ ] Unit tests + property-based tests (fast-check) for spatial functions

### M2 — Full rule engine (Nov 26–27)
- [ ] `BETWEEN`, `MOVED_TO` (zones), `INSIDE` zone
- [ ] `BEFORE` and `SEQUENCE` built on the event log, not on the latest frame
- [ ] Zod rule schema, validated against the calibrated object IDs
- [ ] Recorded-frame fixtures (JSON WorldState sequences) for integration tests

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
- Nov 23: Architecture, plan, steering drafts and the M1 requirements draft were written with Claude Code (Anthropic) and then reviewed and refined in Kiro.
