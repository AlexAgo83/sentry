## item_201_req060_add_away_duration_metadata_to_startup_bootstrap_state - req060 add away-duration metadata to startup bootstrap state
> From version: 0.9.38
> Understanding: 98%
> Confidence: 95%
> Progress: 0%
> Complexity: Low
> Theme: Runtime / State
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The startup splash needs to show the real “time away” driving catch-up, but the current bootstrap metadata is oriented around progress and processed work. Existing fields like `totalMs` can represent capped/processed time, not the original elapsed away duration the user expects to understand.

# Scope
- In:
- Add an explicit away-duration field to the startup bootstrap contract/state.
- Populate it during startup bootstrap when offline catch-up context exists.
- Keep it stable for a single bootstrap run and reset/clear it when irrelevant.
- Keep the addition minimal and backward-safe.
- Out:
- No UI rendering changes in this item.
- No formatting/presentation logic in this item.

# Acceptance criteria
- Startup bootstrap state exposes a dedicated away-duration value separate from processed/progress timing.
- The value reflects elapsed away time relevant to startup catch-up.
- The field is absent/null/zero when no meaningful away context exists.
- Existing startup progress behavior and semantics remain unchanged.

# Priority
- Impact: Medium
- Urgency: Medium

# Notes
- Derived from `logics/request/req_060_show_away_duration_on_startup_loading_screen.md`.
- Planned delivery via `logics/tasks/task_109_execute_req060_startup_away_duration_display_across_backlog_items_201_to_203.md`.
- Likely touch points:
  - `src/core/types.ts`
  - `src/core/state.ts`
  - `src/core/reducer.ts`
  - `src/core/runtime.ts`
  - `tests/core/runtime.test.ts`
