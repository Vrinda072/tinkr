---
inclusion: always
---

# Tinkr — Product

**You told the AI what to build. Tinkr makes sure it built that, and that strangers can't get in.**

Tinkr is for vibe coders: people who build apps by prompting AI agents (Kiro, Lovable, Bolt,
Cursor, Claude Code), many with little or no coding knowledge. It reads what they asked the
AI to build (their prompts or Kiro spec), turns that into **promises**, confirms them with
the builder in plain language, then sends a crew of **ghosts** to check whether the live app
keeps them. Broken promises come back with proof and go straight to the coding agent to fix,
and the ghosts check again.

## Why it exists (keep claims to these sources)
- Vibe-coded apps leak user data. A 2025 study of 1,645 Lovable apps found 170 exposing
  personal data (CVE-2025-48757); more incidents followed in 2026.
- Existing scanners check generic known mistakes (exposed keys, security rules missing).
  They cannot tell whether access is *correct*, because that depends on the builder's intent:
  user B seeing user A's posts is fine for a forum and a leak for a diary.
- Two-user access testing exists mainly in paid tools for engineers.
- Tinkr's difference: it tests **the app's own promises, taken from the builder's own words**.

## The principle that must never be broken
- The **LLM compiles**: prompt/spec text → typed promises, and plans which pages to visit.
- **Ghosts observe** with deterministic code (browser automation, request replay, canary data,
  accessibility rules, tool-call logs).
- **Deterministic code judges.** The LLM is never asked "is this promise kept?".
- Verdicts: `KEPT`, `BROKEN` (always with evidence), `COULDNT_CHECK` (with the reason).
  Tinkr never says "safe" or "kept" for something it did not actually test.

## One engine, two apps (Skeleton Crew)
- **Tinkr for apps** (`apps/web`): promises about web apps — who can see and change what,
  paid-only pages, keyboard and screen-reader access.
- **Tinkr for bots** (`apps/bot`): promises about AI assistants that take actions —
  "never refund more than $50", "never send an email without my approval" — checked
  against the bot's actual tool calls, never against what it says.
- Both use `@tinkr/core`. Neither re-implements promises, verdicts or evidence.

## The ghost crew
- **The Thief** (must have): signs up as a second user and as a signed-out visitor and tries
  to read or change the first user's data, detected with unique canary text.
- **The Blind Ghost** (must have): keyboard only, plus accessibility rules (axe-core).
- **Grandma** and **the Night Owl** (nice to have): confusing input; small screen and slow network.
- **Tricksters** (Tinkr for bots): scripted conversations that push the bot toward breaking a promise.

## Safety rules
- Runs only on apps the user owns: localhost and preview URLs, or a site carrying the
  `tinkr-verify` meta tag with the user's token.
- Ghosts use their own test accounts, label everything they create, and clean up.
  No destructive actions against production.

## Tone
Friendly face, serious evidence. The ghosts and the star mascot (who leads the ghost crew)
make it approachable; findings are stated in human impact ("Any user can read Priya's
journal entries"), never jargon. A plain mode turns the theme off.
