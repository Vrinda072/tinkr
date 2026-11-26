---
inclusion: always
---

# Tinkr — Structure

```
packages/
  core/      # pure TS: promise schema, extraction (LLM client + validation), judging, findings, evidence log
  ghosts/    # Node + Playwright: Grandma (feature checks), Thief, Listener (axe-core), Night Owl; bot Tricksters
  # claims come from the agent reply; promises from prompts/spec; both judged in core
  star/      # <TinkrStar state=… /> mascot (React)
  mcp/       # MCP server: list_claims, run_checks, get_findings (with evidence packs)
  cli/       # `npx tinkr` — reads the agent reply + prompts/spec, runs the crew, serves the report
integrations/            # thin wrappers only; no engine logic here
  kiro-power/            # POWER.md, mcp.json, steering (promises), hooks (run ghosts after agent edits)
  claude-plugin/         # skill `/tinkr`, Stop hook, MCP config
  codex-skill/           # SKILL.md + MCP config; must work without hooks
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
- Name ghosts after their persona: `grandma.ts`, `thief.ts`, `listener.ts`.
