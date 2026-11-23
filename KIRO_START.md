# Starting M1 in Kiro

1. Create the GitHub repo `tinkr` (public, MIT). Copy `.kiro/` and `PROJECT_PLAN.md` into it and open the folder in Kiro.
2. Check the steering docs are picked up: **Kiro panel → Steering** should list product, tech and structure.
3. Open **Specs → m1-camera-to-rule**. Tell Kiro:

   > Review requirements.md against the steering docs and tighten anything ambiguous.
   > Then generate design.md and tasks.md. Tasks should be small, test-first, and
   > ordered: scaffold → spatial NEAR + property tests → event log → HSV/blob detection
   > → tracker → camera → debug page.

4. Add an agent hook: **on save of `packages/core/src/**/*.ts` → run `pnpm --filter @tinkr/core test` and fix failures.** (That's a real workflow to write about.)
5. Run the tasks one at a time in Kiro. Commit after each green task.
6. Bring results, failures or design.md back to Claude Code for review.

Keep notes as you go (screenshots of spec/hook runs, what Kiro got right or wrong). They feed the required "How we used Kiro" write-up.
