## item_203_req060_add_regression_coverage_for_startup_away_duration_display - req060 add regression coverage for startup away-duration display
> From version: 0.9.38
> Status: Done
> Understanding: 97%
> Confidence: 94%
> Progress: 100%
> Complexity: Low
> Theme: Quality / UX
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Without targeted tests, the away-duration line can regress easily through bootstrap state changes, splash layout changes, or future shared-bootstrap work.

# Scope
- In:
- Add splash tests for away-duration rendering when catch-up is relevant.
- Add splash tests for hidden state when no away-duration context exists.
- Add runtime/bootstrap-state tests if the contract is extended with new metadata.
- Ensure existing startup progress tests still pass with the new line in place.
- Out:
- No unrelated broad visual testing.
- No end-to-end suite expansion.

# Acceptance criteria
- Tests fail if the away-duration line disappears when startup catch-up is relevant.
- Tests fail if the away-duration line appears when no meaningful away context exists.
- Tests fail if the bootstrap contract stops exposing the needed metadata.
- Validation gates remain green with the new coverage.

# Priority
- Impact: Medium
- Urgency: Medium

# Notes
- Derived from `logics/request/req_060_show_away_duration_on_startup_loading_screen.md`.
- Planned delivery via `logics/tasks/task_109_execute_req060_startup_away_duration_display_across_backlog_items_201_to_203.md`.
- Depends on:
  - `logics/backlog/item_201_req060_add_away_duration_metadata_to_startup_bootstrap_state.md`
  - `logics/backlog/item_202_req060_render_away_duration_context_in_startup_splash.md`
- Likely touch points:
  - `tests/core/runtime.test.ts`
  - `tests/app/startupSplashScreen.test.tsx`
  - `tests/app/App.test.tsx`
