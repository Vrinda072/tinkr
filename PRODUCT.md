# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

npm workspaces, TypeScript, Vite + React 18 for the apps; Node 20+ and Playwright for the
checking engine, CLI and MCP server (recorded in `.kiro/steering/tech.md`). All product code is
written by Kiro's own agent (hackathon rule).

## Users

Vibe coders of every level: people who build apps by prompting AI agents (Kiro, Claude Code,
Codex, Lovable, Bolt, Cursor), from total beginners who cannot read the code to developers who
use agents daily. The shared situation: the agent says a feature is done, and the builder has
no quick, trustworthy way to know whether that is true on the live app.

## Product Purpose

Tinkr checks an AI coding agent's claims against the live app. After each agent turn it lines
up what the builder asked, what the agent says it did, and what actually happened, and marks
each item True, False, Misleading or Couldn't check. False items go back to the agent with the
evidence (failing step, error, screenshot), so the builder never has to describe a bug they
don't understand. Success: the builder stops discovering broken features by accident, and the
agent fixes them without a guessing loop.

## Positioning

An independent check of the agent's own claims and the builder's own requests, run on the live
app, written in plain words, with the evidence handed back to the agent. Agent-made demo videos
are produced by the same agent that claims success; developer-side test gates assume CI and
code reading. Tinkr is neither.

## Operating Context

- The builder works in an agent chat. Tinkr runs automatically after each agent turn (Kiro
  Power hook, Claude Code plugin) or on demand (Codex skill, `npx tinkr`).
- Results appear in two places: a short summary inside the agent chat, and the full report in
  a browser tab next to the agent.
- Checks run only on apps the builder owns: localhost, preview URLs, or verified sites.
- Kiroween 2026 hackathon entry, Skeleton Crew category: one engine, two apps
  (Tinkr for apps, Tinkr for bots). Deadline Dec 4, 2026.

## Capabilities and Constraints

- Verdicts: True, False, Misleading (e.g. tests pass only because the agent edited them),
  Couldn't check (with the reason). Promises: Kept, Broken, Couldn't check.
- "You weren't told": sensitive changes the agent made without mentioning them.
- The LLM only turns text into checks; deterministic code decides every verdict. Tinkr never
  says "true" about something it did not actually exercise.
- Checking personas (the ghost crew): Grandma (features), the Thief (other people's data),
  the Listener (keyboard and screen reader), the Night Owl (small screen, slow network),
  the Trickster (AI bots). Tinkr, a star, leads them.
- Undecided: exact chat summary format per tool.

## Brand Commitments

- Name: **Tinkr** (confirmed).
- Mascots: the Tinkr star and the ghost crew, drawn as pixel art (`design/mascot/crew-pixel.html`).
- Visual direction set by the builder on Nov 26: the pixel-type, pixel-art look of the "Pixo"
  reference they shared (pixel display type, pixel illustration, light grid background), with
  **navy blue** as the main colour instead of pink. No emojis in the interface.
- Voice: plain and calm. "False: clicking 'Create account' shows an error", never "the AI lied".

## Evidence on Hand

- Research cited in `.kiro/steering/product.md` (agent misreporting studies, Replit incident,
  Lovable data exposure).
- **No real user examples or testimonials yet.** Demo content must be clearly a demo; do not
  invent quotes, users, screenshots or numbers presented as real.

## Product Principles

1. Never claim more than was checked. "Couldn't check" beats a guess.
2. Show, don't describe: every false verdict carries the proof a non-coder can see.
3. Close the loop: findings go to the agent with evidence; the builder shouldn't relay bugs.
4. Plain words first; technical detail only on request.
5. Live inside the tools builders already use.

## Accessibility & Inclusion

WCAG AA contrast, full keyboard use, reduced-motion respected. Tinkr checks other apps with
the Listener, so its own interface must pass the same checks.
