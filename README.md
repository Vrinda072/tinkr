# Tinkr

**Give your AI coding agent eyes on your desk.**

Tinkr is a starter kit for building apps that react to real objects. It turns plain-English
conditions into structured rules and checks them in real time against coloured objects seen
through a webcam. An LLM *compiles* the instruction, computer vision *observes* the desk, and
a deterministic rule engine *judges* the result. An MCP server lets coding agents like Kiro
see the desk too.

Built on the kit (Kiroween 2026, Skeleton Crew):

- **Tinkr Focus** (`apps/focus`): a focus timer that only runs while your phone is face-down in the away zone.
- **Tinkr Quest** (`apps/quest`): write a board game's rules in English and Tinkr referees it.
- **Tinkr MCP** (`packages/mcp`): lets Kiro read objects, rules and events from the desk.

> Status: early development. See [PROJECT_PLAN.md](PROJECT_PLAN.md).

## License

MIT
