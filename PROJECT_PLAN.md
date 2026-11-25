# Tinkr — Project Plan

> You told the AI what to build. Tinkr makes sure it built that, and that strangers can't get in.
> Kiroween 2026 · Skeleton Crew · Deadline **Dec 4, 2026, 2:00 PM PT** (no extensions)

## Ground rules (from the official rules, read Nov 23)

- [ ] Built **with Kiro's own agent** — insufficient use = disqualification; Kiro usage is 20% of the score.
      The credit FAQ says work done through another agent harness doesn't count, so all project
      code comes from Kiro (Kiro CLI). Claude Code only plans, reviews and runs tests.
- [ ] All code written after Oct 30, 2026. Disclose any outside help or pre-existing code.
- [ ] Public GitHub repo, OSI license visible in the About section (MIT).
- [ ] `/.kiro` at the repo root with real specs, hooks and steering. Never gitignored.
- [ ] Skeleton Crew: two apps in two separate folders (`apps/web`, `apps/bot`).
- [ ] Public, working URL for judges. YouTube demo **under 3 minutes**.
- [ ] Write-up on how Kiro was used: specs, hooks, steering, MCP, property-based testing.
- [x] Request Kiro credits (form submitted Nov 23)
- [ ] Complete the Devpost ID check when the email arrives (expected by ~Nov 25; Devpost name must match ID exactly)
- [ ] Redeem the credit code while signed in to the GitHub Kiro account, by **Dec 4**
- [ ] Optional bonuses: Best Student Project (student email + LinkedIn), blog post, #KiroweenHackathon26 social post.

## Direction (decided Nov 25)

**Tinkr checks that a vibe-coded app keeps the promises its builder asked for.**

1. Read the builder's prompts or Kiro spec → LLM extracts **promises** ("only I can see my entries").
2. Builder confirms them as plain yes/no cards.
3. **Ghosts** test the live app: the Thief (other users and signed-out visitors try to read or
   change data, detected with canary text) and the Listener (keyboard only + axe-core).
4. Report: Kept / Broken (with proof) / Couldn't check (with why).
5. Broken promises go to Kiro (hook + MCP) → Kiro fixes → ghosts recheck everything.

Two apps on one engine: **Tinkr for apps** (web apps) and **Tinkr for bots** (AI assistants,
judged on their actual tool calls).

### Why this, and what already exists (checked Nov 25)
- Need: vibe-coded apps leak users' data (2025 study: 170 of 1,645 Lovable apps exposed
  personal data, CVE-2025-48757; further Lovable incidents in 2026).
- Exists: security scanners for vibe-coded apps (VibeScan, Argus, Vibesecur, decloak, Lovable's
  own checker) — they check generic known mistakes. Persona testers (Hafermilch, UXAgent,
  cbrowser) — they critique UX. Two-user access tests — in paid engineer tools (Snyk, Escape).
- Gap: none test **the builder's own intent**. Whether user B seeing user A's data is a leak
  depends on what the app is for. Tinkr gets that intent from the builder's own prompts.
- Earlier directions (camera rule engine, Focus/Quest, rehab, eligibility checker) were dropped:
  each was either already built by others or too narrow.

## Architecture

```
tinkr/
├── .kiro/{steering,specs,hooks}
├── packages/
│   ├── core/     # pure TS: promise schema, extraction, judging, findings, evidence log
│   ├── ghosts/   # Node + Playwright: Thief, Listener, bot Tricksters
│   ├── star/     # <TinkrStar/> mascot (React)
│   ├── mcp/      # MCP server for Kiro
│   └── cli/      # npx tinkr
├── apps/
│   ├── web/      # Tinkr for apps
│   └── bot/      # Tinkr for bots
└── demo/
    ├── journal/      # vibe-coded journal app with planted bugs
    └── support-bot/  # AI support bot with planted bugs
```

What carries over from the camera prototype: the principle (LLM compiles, code judges,
"couldn't check" instead of guessing), Zod-validated schemas, the EventLog idea (now the
evidence log), the fast-check testing approach, the mascot and the design tokens.
The camera code (`packages/core/src/{camera,vision,tracking,spatial}`, `apps/quest`) is legacy
and gets removed once Kiro has scaffolded the new packages.

## Milestones (all code by Kiro; Claude Code reviews and runs tests after each task)

### M0 — Specs (as soon as credits land)
- [ ] Kiro writes specs: `promises` (schema + extraction), `thief`, `listener`, `report`, `kiro-loop`, `bots`
- [ ] Kiro writes the TinkrStar design + tasks from `.kiro/specs/tinkr-star/requirements.md`

### M1 — Promises (Nov 26–27)
- [ ] Promise schema (Zod) + judging types + property tests
- [ ] Extraction: prompts/spec text → promises (LLM, provider by env), invalid output rejected
- [ ] Promise cards: plain yes/no confirmation
- [ ] Demo journal app with planted bugs: entries readable by other users; a button that keyboards can't reach

### M2 — The Thief (Nov 27–28)
- [ ] Sign-up/sign-in as owner, other user, visitor (Playwright)
- [ ] Canary creation, request capture and replay, page-text search
- [ ] Evidence: screenshots, Playwright trace, request/response pairs
- [ ] Ownership check: localhost/preview only, or `tinkr-verify` meta tag

### M3 — The Listener (Nov 29)
- [ ] axe-core per page; keyboard-only path to each main action
- [ ] Plain-English findings ("You can't reach 'Save' with the keyboard")

### M4 — Report + Kiro loop (Nov 30)
- [ ] Report view: Kept / Broken / Couldn't check, proof inline
- [ ] MCP server: `list_promises`, `run_ghosts`, `get_findings`
- [ ] Kiro hook: rerun ghosts after agent edits; Kiro fixes the demo bugs live

### M5 — Tinkr for bots (Dec 1)
- [ ] Demo support bot with tool calls (refund, send_email) logged
- [ ] `BOT_NEVER` / `BOT_LIMIT` promises judged on the tool-call log
- [ ] Trickster scripts that push the bot to break them

### M6 — CLI, mascot, polish (Dec 2)
- [ ] `npx tinkr` (reads prompts/spec, confirms, runs, serves report)
- [ ] TinkrStar states wired to runs (thinking while ghosts run, celebrating when all kept)
- [ ] Tinkr's own UI passes its own Listener

### M7 — Ship (Dec 3)
- [ ] Hosted demo for judges (report + the demo apps)
- [ ] README, Kiro write-up, video (< 3 min)
- [ ] Dec 4: submission buffer only

## Cut list (in order, if behind)
1. Grandma / Night Owl ghosts (already nice-to-have)
2. CLI → run from the web app only
3. Bot Tricksters → fixed scripted conversations
4. Mascot extra states (keep idle / thinking / success / uncertain)

Never cut: promise extraction, the Thief, proof on every broken promise, the Kiro fix loop,
Tinkr for bots (minimum version), tests, the `.kiro` artifacts.

## Top risks
| Risk | Mitigation |
|---|---|
| Ghost runs flaky (sign-up flows, timing) | Demo apps under our control; LLM only plans; checks are scripted and cached; "Couldn't check" instead of guessing |
| False "broken" claims | Canary text proves the leak; every BROKEN needs evidence (enforced by property tests) |
| Misuse against others' apps | Ownership check before any run |
| Not enough authentic Kiro use | Every feature starts as a Kiro spec; hooks; MCP; log decisions |
| Credits arrive late | Specs ready to hand to Kiro the moment they land; cut list above |

## Access
- LLM API key in `.env` (optional free tier); GitHub; Kiro account + hackathon credits
- Hosting for judges (Vercel/Netlify/Render free tier)

## Disclosure log
Record outside help here for the submission write-up.
- Nov 23: Architecture, plan, steering docs and the M1 requirements were written with Claude Code (Anthropic).
- Nov 23: Camera prototype code (`packages/core`, `apps/quest` debug page, tests) was written by Claude Code at the entrant's direction, **not in Kiro**. It is being retired.
- Nov 23: Installed Kiro CLI 3.5.0. From then on, code is written by **Kiro CLI in headless mode**
  (`kiro-cli chat --no-interactive`), directed and reviewed by Claude Code.
  - Run 1: read-only check that Kiro loads the steering docs (passed).
  - Run 2: Kiro wrote the camera rule-engine spec (requirements, design, tasks).
  - Run 3–5: Kiro revised that design from Claude Code's review; throttled before finishing.
- Nov 23: Claude Code fixed TransitionDetector so holdMs = 0 commits on the same frame.
- Nov 23: Mascot design exploration page and the TinkrStar requirements spec were written by Claude Code; the component itself will be built by Kiro.
- Nov 24–25: Direction research and changes (Focus/Quest, then Tinkr for vibe coders); plan, README and steering rewritten by Claude Code.
