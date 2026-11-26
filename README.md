# Tinkr

**You told the AI what to build. Tinkr makes sure it built that, and that strangers can't get in.**

Tinkr is for vibe coders. It reads what you asked your AI agent to build (your prompts or
your Kiro spec), turns it into plain-English **promises** like "only I can see my journal
entries", and sends a crew of **ghosts** to check whether your live app keeps them:

- **The Thief** signs in as someone else and tries to read or change your users' data.
- **The Listener** tries to use your app with only a keyboard and a screen reader.

Every broken promise comes with proof. Tinkr hands it to your coding agent (Kiro), which
fixes it, and the ghosts check again.

How it decides: an LLM *compiles* your words into promises, the ghosts *observe* with
deterministic browser checks, and plain code *judges*. Tinkr never says "kept" about
something it didn't test; it says "couldn't check" and why.

Built on one engine (Kiroween 2026, Skeleton Crew):

- **Tinkr for apps** (`apps/web`): who can see and change what in your web app.
- **Tinkr for bots** (`apps/bot`): what your AI assistant is allowed to do, checked against what it actually did.

## Where you'll use it

- **Kiro:** install the Tinkr Power (Powers → Add Custom Power → this repo). The crew checks after every agent change and Kiro fixes what they find.
- **Claude Code:** install the plugin, then `/tinkr`.
- **Codex:** install the skill, then `$tinkr`.
- **Anything else** (Lovable, Bolt, Cursor): `npx tinkr`.

Tinkr only runs against apps you own (local, preview, or verified sites).

> Status: early development. See [PROJECT_PLAN.md](PROJECT_PLAN.md).

## License

MIT
