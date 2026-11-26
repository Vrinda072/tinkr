---
inclusion: always
---

# Tinkr — Product

**Your AI says it's done. Tinkr checks.**

## The story (use it in the pitch, the README and the video)
The builder vibe codes. The AI kept saying things were done ("Done! ✅ Sign-up works"), and
because they can't read the code, they believed it. Then they opened the live site and it
didn't work. They had to go back to the AI, try to describe a problem they didn't understand,
and go round in circles. Tinkr is the tool they wanted: it checks the AI's claims on the live site,
says plainly what's true and what isn't, and tells the AI exactly what's broken.

## What Tinkr does
After every AI turn (and on demand), Tinkr lines up three things:

| What you asked | What the AI says it did | What actually happened |
|---|---|---|
| from your prompt (**promises**) | from the AI's reply (**claims**) | from the ghosts on the live site |

1. **Claims:** the LLM pulls each claim out of the agent's final message ("added sign-up",
   "only you can see your notes", "all tests pass", "fixed checkout").
2. **Promises:** the LLM pulls what you asked for out of your prompts or Kiro spec; you
   confirm them as yes/no cards. They stay as the app's long-term rules.
3. **Checks:** the ghost crew tries each claim and promise on the live app; plain code decides.
4. **Report:** each item is **True**, **False** (with a replay and the exact failing step),
   **Misleading** (e.g. tests pass only because the AI edited the tests), or
   **Couldn't check** (with the reason). Plus **"You weren't told"**: sensitive changes the AI
   made but didn't mention (payments, sign-in, database, deleted data).
5. **Handback:** False and Misleading items go to the agent automatically with the evidence
   (step, URL, error text, console log, screenshot). The builder never has to describe a bug.
   The agent fixes it; the crew rechecks everything.
6. **Understanding:** every check is written in plain words ("New visitors can create an
   account and land on their dashboard"), so the builder learns what the app actually does.

## Why it exists (keep claims to these sources)
- Agents misrepresent success in real use: an analysis of 8,600 coding-agent sessions found
  ~2% misrepresenting success, e.g. "all builds and tests pass" after failures (LessWrong).
- Agents game tests: the EvilGenie benchmark caught Codex and Claude Code hardcoding test
  answers or editing tests to pass.
- Replit's agent deleted a production database during a code freeze and misreported it (July 2025).
- Forcing a live check cut one developer's false "it works" claims by about half.
- Vibe-coded apps leak user data: 170 of 1,645 Lovable apps exposed personal data (2025, CVE-2025-48757).
- What exists: checks for developers (hidden tests, CI gates, a sandbox that verifies README
  claims) and agent-recorded demo videos (Tella, Slideshot, shot-scraper, JetBrains Junie).
  Demos are made by the same agent that claims success and show the happy path.
  Tinkr is the **independent check of the agent's claims against the live app, for non-coders**,
  with the evidence handed back to the agent.

## The principle that must never be broken
- The **LLM compiles**: claims and promises → typed checks (steps and expected results).
- **Ghosts observe** with deterministic code (browser automation, canary data, accessibility
  rules, test runs, git diff, tool-call logs).
- **Deterministic code judges.** The LLM is never asked "is this true?" or "did it work?".
- Tinkr never says "true" or "kept" about something it did not actually exercise.

## One engine, two apps (Skeleton Crew)
- **Tinkr for apps** (`apps/web`): claims and promises about web apps.
- **Tinkr for bots** (`apps/bot`): claims and promises about AI assistants that take actions
  ("I refunded within policy", "never email without approval"), judged on the bot's actual
  tool calls, never on what it says.
- Both use `@tinkr/core`. Neither re-implements claims, promises, verdicts or evidence.

## Where it runs
Inside the tools vibe coders already use, one engine and one MCP server: a **Kiro Power**
(main), a **Claude Code plugin**, a **Codex skill**, and `npx tinkr` for everyone else
(Lovable, Bolt, Cursor). Wrappers stay thin. All judging happens in `packages/core`.

## The ghost crew
- **Grandma** (must have): a first-time user. Follows the planned steps to try each feature
  the AI claims to have built and reports whether it worked, and where she got stuck.
- **The Thief** (must have): other users and signed-out visitors try to read or change the
  owner's data, detected with canary text.
- **The Listener** (should have): keyboard only, plus accessibility rules (axe-core).
- **The Night Owl** (nice to have): small screen, slow network.
- **The Trickster** (Tinkr for bots): scripted conversations that push the bot to break a promise.
- **Tinkr, the star** reads the AI's reply, sends the crew and delivers the verdicts.

## Safety rules
- Runs only on apps the user owns: localhost and preview URLs, or a site carrying the
  `tinkr-verify` meta tag with the user's token.
- Ghosts use their own test accounts, label everything they create, and clean up.
  No destructive actions against production.

## Tone
Friendly face, serious evidence. Verdicts are plain and calm: "False: clicking 'Create
account' shows an error", never "The AI lied". A plain mode turns the theme off.
