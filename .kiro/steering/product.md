---
inclusion: always
---

# Tinkr — Product

Tinkr makes physical objects programmable with natural language. A user puts coloured
objects in front of a webcam and describes how they should be arranged. Tinkr compiles
the description into a structured rule, watches the table, and shows live which
conditions are satisfied, not satisfied, or uncertain.

## The one principle that must never be broken
- The **LLM compiles** text into a rule. It never decides whether a task succeeded.
- **Computer vision observes.** It produces a WorldState of tracked objects.
- A **deterministic evaluator judges.** It uses pure functions over WorldState + EventLog.

If any code asks an LLM "is this done?" or sends camera frames to an LLM, it is wrong.

## Two apps, one engine (Skeleton Crew)
- **Tinkr Quest:** a playful physical puzzle game. Levels are rules. A star mascot guides the player.
- **Tinkr Inspect:** a practical assembly and placement verifier with ordered steps, uncertainty warnings, history and a report.
- Both import `@tinkr/core`. Neither app re-implements tracking or evaluation.

## Honesty constraints
- Never fabricate confidence. Quality numbers come from measurable things (blob area, visibility age, frames tracked).
- Prefer `UNCERTAIN` over a false `SATISFIED`.
- Do not claim industrial-grade accuracy.

## Tone
Whimsical and polished, like an indie creative tool. Quest is playful. Inspect is calm
and professional, with the mascot kept subtle.
