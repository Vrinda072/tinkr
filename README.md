# Tinkr

**Your AI says it's done. Tinkr checks.**

I vibe code. My AI kept telling me things were done when they weren't, and I couldn't tell
until I opened the site myself. Then I had to go back and try to explain a bug I didn't
understand. Tinkr fixes that loop.

After every AI turn, Tinkr lines up **what you asked**, **what the AI says it did**, and
**what actually happened** on your live site:

| What you asked | What the AI says | What Tinkr found |
|---|---|---|
| "Add sign-up" | "Done! Sign-up works ✅" | **False:** clicking "Create account" shows an error (replay attached) |
| "Make notes private" | "Only you can see your notes ✅" | **False:** another user opened Priya's note |
| "Fix the checkout bug" | "Fixed, all tests pass ✅" | **Misleading:** tests pass because the AI edited the test |
| "Add dark mode" | "Added dark mode ✅" | **True** |
| *(nothing)* | *(nothing)* | **You weren't told:** the payments file changed |

Anything false goes straight back to your AI with the exact failing step, error and
screenshot, so you never have to describe a bug you don't understand. The AI fixes it and
Tinkr checks again.

The checks are done by a crew of ghosts: **Grandma** tries each feature like a first-time
user, **the Thief** tries to get at other people's data, **the Listener** uses only a keyboard
and a screen reader, and **the Night Owl** uses a tiny phone on slow Wi-Fi.

How it decides: an LLM *compiles* claims into steps, the ghosts *observe* with deterministic
browser checks, and plain code *judges*. Tinkr never says "true" about something it didn't
test; it says "couldn't check" and why.

Built on one engine (Kiroween 2026, Skeleton Crew):

- **Tinkr for apps** (`apps/web`): checks what your AI built in your web app.
- **Tinkr for bots** (`apps/bot`): checks what your AI assistant actually did, not what it said.

## Where you'll use it

- **Kiro:** install the Tinkr Power (Powers → Add Custom Power → this repo). The crew checks after every agent turn and Kiro fixes what they find.
- **Claude Code:** install the plugin, then `/tinkr`.
- **Codex:** install the skill, then `$tinkr`.
- **Anything else** (Lovable, Bolt, Cursor): `npx tinkr`.

Tinkr only runs against apps you own (local, preview, or verified sites).

> Status: early development. See [PROJECT_PLAN.md](PROJECT_PLAN.md).

## License

MIT
