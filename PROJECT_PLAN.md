# Tinkr — Project Plan

> Your AI says it's done. Tinkr checks.
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

## Direction (locked Nov 26)

**Your AI says it's done. Tinkr checks.**

The builder's own story is the pitch: the AI kept saying features were done; the live site
didn't work; going back to the AI to describe a bug they didn't understand went in circles.

After every AI turn Tinkr lines up **what you asked** (promises, from prompts/spec), **what the
AI says it did** (claims, from its reply) and **what actually happened** (the ghost crew on the
live app). Each item: True / False (replay + failing step) / Misleading (e.g. tests edited to
pass) / Couldn't check, plus "You weren't told" for sensitive unmentioned changes. False items
go back to the agent with the evidence automatically; the agent fixes; the crew rechecks.

Two apps on one engine: **Tinkr for apps** (web apps) and **Tinkr for bots** (AI assistants,
judged on their actual tool calls).

### Evidence and what already exists (checked Nov 25–26)
- Agents misrepresent success: ~2% of 8,600 real sessions (LessWrong); EvilGenie benchmark caught
  Codex and Claude Code editing/hardcoding tests; Replit agent deleted a production DB and
  misreported it (July 2025); a forced live check halved one developer's false "it works" claims.
- Vibe-coded apps leak data: 170 of 1,645 Lovable apps (2025, CVE-2025-48757).
- Exists: developer-side checks (hidden tests, CI gates, a sandbox that verifies README claims),
  agent-recorded demo videos (Tella, Slideshot, shot-scraper, JetBrains Junie), security
  scanners for vibe-coded apps, persona UX testers.
- Gap: an **independent** check of the agent's own claims and the builder's own promises,
  against the live app, in plain words for non-coders, with evidence handed back to the agent.
- Earlier directions (camera rule engine, Focus/Quest, rehab, eligibility checker, promises-only
  Tinkr) were dropped or folded in.

## Architecture

```
tinkr/
├── .kiro/{steering,specs,hooks}
├── packages/
│   ├── core/     # pure TS: promise schema, extraction, judging, findings, evidence log
│   ├── ghosts/   # Node + Playwright: Thief, Listener, bot Tricksters
│   ├── star/     # <TinkrStar/> mascot (React)
│   ├── mcp/      # MCP server (shared by every agent tool)
│   └── cli/      # npx tinkr
├── integrations/
│   ├── kiro-power/      # POWER.md + mcp.json + steering + hooks
│   ├── claude-plugin/   # skill (/tinkr) + hooks + MCP config
│   └── codex-skill/     # SKILL.md + MCP config (+ hooks.json where enabled)
├── apps/
│   ├── web/      # Tinkr for apps
│   └── bot/      # Tinkr for bots
└── demo/
    ├── journal/      # vibe-coded journal app with planted bugs
    └── support-bot/  # AI support bot with planted bugs
```

## How people get Tinkr (decided Nov 26)

Tinkr lives inside the tools vibe coders already use. One engine (promises, ghosts, report,
MCP server); each tool gets a thin wrapper.

| Where | Package | What the user does | What happens |
|---|---|---|---|
| **Kiro** (main, for the hackathon) | **Kiro Power** (POWER.md, MCP config, steering, hooks), installed from the GitHub URL via Powers → Add Custom Power | One click to install | Steering teaches Kiro the confirmed promises; a hook runs the ghosts after every agent change; Kiro reads findings over MCP and fixes them |
| **Claude Code** | **Plugin** (skill + hooks + MCP) | One install command; `/tinkr` to check on demand | Same loop as Kiro; the Stop hook runs the ghosts when the agent finishes |
| **Codex** | **Skill** (`SKILL.md`) + MCP server | Install the skill; `$tinkr` to check | Checks on demand; automatic runs only where Codex hooks are enabled |
| **Lovable, Bolt, Cursor, anyone** | **`npx tinkr`** | One command, or paste a preview URL | Opens the report (with the pixel crew) in the browser |

The everyday loop: ask the AI for something → it says "Done ✅" → the crew checks
automatically → "3 of 4 true, 1 false" with a replay → the agent fixes the false one → recheck.

Facts checked Nov 26: Kiro Powers bundle MCP + POWER.md + steering + hooks and install from a
public GitHub URL (kiro.dev/docs/powers). Codex supports skills and plugins; Codex hooks are
reported to be behind a feature flag, so the Codex wrapper must work without them.

What carries over from the camera prototype: the principle (LLM compiles, code judges,
"couldn't check" instead of guessing), Zod-validated schemas, the EventLog idea (now the
evidence log), the fast-check testing approach, the mascot and the design tokens.
The camera code (`packages/core/src/{camera,vision,tracking,spatial}`, `apps/quest`) is legacy
and gets removed once Kiro has scaffolded the new packages.

## Milestones (all code by Kiro; Claude Code reviews and runs tests after each task)

### M0 — Specs (as soon as credits land)
- [ ] Kiro writes specs: `promises` (schema + extraction), `thief`, `listener`, `report`, `kiro-loop`, `bots`
- [ ] Kiro writes the TinkrStar design + tasks from `.kiro/specs/tinkr-star/requirements.md`

### M1 — Claims, promises, demo app (Nov 27)
- [ ] Types + Zod schemas (Claim, Promise_, Check, Finding, Unmentioned) + property tests
- [ ] Extraction: agent reply → claims; prompts/spec → promises; each with a planned Check
- [ ] Demo journal app with planted bugs + a recorded agent reply containing false claims
      (sign-up "works" but errors; notes "private" but readable; tests "pass" because edited)

### M2 — Grandma + handback (Nov 28)
- [ ] FEATURE checks: run steps by accessible name, judge expectations, find the failing step
- [ ] Evidence: video replay, screenshot, console errors, failed requests
- [ ] Evidence pack for the agent (claim, failing step, URL, error text, screenshot)
- [ ] Ownership check: localhost/preview only, or `tinkr-verify` meta tag

### M3 — The Thief + tests + "you weren't told" (Nov 29)
- [ ] PRIVATE checks with canary text, other user and visitor
- [ ] TESTS checks: run tests, detect edited/skipped tests in the turn's diff → MISLEADING
- [ ] Unmentioned sensitive changes from the diff

### M4 — Report + Kiro Power (Nov 30)
- [ ] Report: what you asked / what the AI said / what happened; True / False / Misleading /
      Couldn't check; replay inline; plain-words description of each feature
- [ ] MCP server: `list_claims`, `run_checks`, `get_findings`
- [ ] Kiro Power in `integrations/kiro-power`: POWER.md, MCP config, promises steering, hook
      that runs the crew after every agent turn and hands back false items
- [ ] Installs from the GitHub URL into a clean Kiro; Kiro fixes the demo bugs live

### M5 — Listener + Tinkr for bots (Dec 1)
- [ ] ACCESSIBLE checks: axe-core + keyboard-only path to each main action
- [ ] Demo support bot with logged tool calls; BOT_NEVER / BOT_LIMIT judged on the log
- [ ] Trickster scripts; bot's claims ("refunded within policy") checked against the log

### M6 — Other tools, mascot, polish (Dec 2)
- [ ] `npx tinkr` (reads prompts/spec, confirms, runs, serves report)
- [ ] Claude Code plugin in `integrations/claude-plugin` (skill `/tinkr`, Stop hook, MCP config)
- [ ] Codex skill in `integrations/codex-skill` (SKILL.md, MCP config; works without hooks)
- [ ] README install section for all four
- [ ] TinkrStar states wired to runs (thinking while ghosts run, celebrating when all kept)
- [ ] Tinkr's own UI passes its own Listener

### M7 — Ship (Dec 3)
- [ ] Hosted demo for judges (report + the demo apps)
- [ ] README, Kiro write-up, video (< 3 min)
- [ ] Dec 4: submission buffer only

## Cut list (in order, if behind)
1. Night Owl ghost (nice-to-have)
2. Codex skill (document it as "coming next")
3. Claude Code plugin (same)
4. Bot Tricksters → fixed scripted conversations
5. Mascot extra states (keep idle / thinking / success / uncertain)

Never cut: claim extraction, Grandma's feature checks, the evidence handback, the Thief,
proof on every false or broken item, the Kiro Power and
its fix loop, `npx tinkr`,
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
- Nov 24–26: Direction research and changes (Focus/Quest, then Tinkr for vibe coders, then claim checking); plan, README and steering rewritten by Claude Code. Mascot sheets (light, then pixel) drawn by Claude Code as design references.
