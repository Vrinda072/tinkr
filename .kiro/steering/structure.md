---
inclusion: always
---

# Tinkr — Structure

```
packages/
  core/      # pure TS: promise schema, extraction (LLM client + validation), judging, findings, evidence log
  ghosts/    # Node + Playwright: Thief, Listener (axe-core), later Grandma / Night Owl; bot Tricksters
  star/      # <TinkrStar state=… /> mascot (React)
  mcp/       # MCP server for Kiro: list_promises, run_ghosts, get_findings (with evidence)
  cli/       # `npx tinkr` — reads prompts/spec, confirms promises, runs ghosts, serves the report
apps/
  web/       # Tinkr for apps — promise cards, ghost run, report with proof
  bot/       # Tinkr for bots — bot promises, trickster runs, tool-call evidence
demo/
  journal/   # small vibe-coded journal app with planted bugs (data leak, keyboard trap)
  support-bot/ # small AI support bot with planted bugs (over-limit refund, unapproved email)
.kiro/hooks/ # rerun the ghosts after agent edits
```

Legacy: `packages/core/src/{camera,vision,tracking,spatial}` and `apps/quest` are the earlier
camera prototype. Do not build on them; they are removed once the new packages exist.

## Conventions
- One concept per file; files under ~200 lines.
- Tests sit next to source as `*.test.ts`.
- Apps import only from package entry points (`@tinkr/core`, `@tinkr/star`), never deep paths.
- Name ghosts after their persona: `thief.ts`, `listener.ts`.
