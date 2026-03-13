## task_109_execute_req060_startup_away_duration_display_across_backlog_items_201_to_203 - Execute req060 startup away-duration display across backlog items 201 to 203
> From version: 0.9.38
> Understanding: 97%
> Confidence: 94%
> Progress: 0%
> Complexity: Low
> Theme: UX / Startup
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Derived from:
- `logics/backlog/item_201_req060_add_away_duration_metadata_to_startup_bootstrap_state.md`
- `logics/backlog/item_202_req060_render_away_duration_context_in_startup_splash.md`
- `logics/backlog/item_203_req060_add_regression_coverage_for_startup_away_duration_display.md`

Request reference:
- `logics/request/req_060_show_away_duration_on_startup_loading_screen.md`

This task adds a concise “away duration” context line to the startup loading screen so players understand the offline time driving catch-up before reading the progress details.

# Decisions (v1)
- The away duration should come from bootstrap state, not be recomputed ad hoc in the UI.
- It must be distinct from processed/progress timing because those values can be capped or represent work progress rather than elapsed absence.
- The UI placement is fixed:
  - below the main status text,
  - above the progress bar.

# Architecture summary
- Runtime/state owns the raw away-duration value.
- `StartupSplashScreen` owns formatting and display of that contextual line.
- Regression coverage should verify both the state contract and the final rendering behavior.

# Plan
- [ ] 1. Execute `item_201` (bootstrap metadata):
  - Add a dedicated away-duration field to startup bootstrap state.
  - Populate/clear it appropriately during startup bootstrap.
- [ ] 2. Execute `item_202` (splash rendering):
  - Render and format the away-duration line in the splash.
  - Keep spacing/hierarchy aligned with the current loading layout.
- [ ] 3. Execute `item_203` (regression + validation):
  - Add runtime/UI regression coverage for visible and hidden cases.
  - Run validation suite and fix failures.
- [ ] FINAL: Update related Logics docs (request/backlog/task alignment)

# Validation
Final gate (mandatory at task end):
- `npm run lint`
- `npm run typecheck`
- `npm run typecheck:tests`
- `npm run test:ci`
