---
inclusion: always
---

# Tinkr — Product

**Give your AI coding agent eyes on your desk.**

Tinkr is a starter kit for developers who want to build apps that react to real objects.
A webcam watches coloured objects on a desk. The developer describes a condition in plain
English. Tinkr compiles it into a strict rule, watches the desk, and reports live whether
each condition is satisfied, not satisfied, or uncertain. An MCP server lets coding agents
such as Kiro see the desk too, so they can build and test physical-world apps against
real objects.

Audience: young developers, students and indie game makers.

## The one principle that must never be broken
- The **LLM compiles** text into a rule. It never decides whether a task succeeded.
- **Computer vision observes.** It produces a WorldState of tracked objects.
- A **deterministic evaluator judges.** It uses pure functions over WorldState + EventLog.

If any code asks an LLM "is this done?" or sends camera frames to an LLM, it is wrong.
This includes the MCP server: it exposes engine results, never raw frames.

## One kit, two apps (Skeleton Crew)
- **Tinkr Focus** (`apps/focus`): a focus timer that runs only while your phone (with a
  coloured sticker on the case) lies face-down in the "away" zone. Picking it up pauses the
  session. Streaks, session history and pickups per hour.
- **Tinkr Quest** (`apps/quest`): write a tabletop game's rules in plain English and Tinkr
  referees the game on the table, e.g. "Blue wins when it reaches the castle zone before red."
- **Tinkr MCP** (`packages/mcp`): the kit's agent interface, used in the demo to have Kiro
  build a third app live.
- Every app imports `@tinkr/core`. No app re-implements tracking or evaluation.

## Honesty constraints
- Never fabricate confidence. Quality numbers come from measurable things (blob area, visibility age, frames tracked).
- Prefer `UNCERTAIN` over a false `SATISFIED`. In Focus, an unseen phone pauses the timer
  with "Can't see your phone"; it is never counted as a pickup or as focused time.
- Do not claim industrial-grade accuracy.

## Tone
Whimsical and polished, like an indie creative tool. Quest is playful. Focus is calm,
with the star as a quiet companion who reacts to pickups.
