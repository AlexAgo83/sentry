## item_214_req063_add_regression_coverage_for_action_screen_dungeon_summary_and_fallbacks - req063 add regression coverage for the action-screen dungeon summary and fallbacks
> From version: 0.9.38
> Understanding: 97%
> Confidence: 95%
> Progress: 0%
> Complexity: Medium
> Theme: Tests / UX reliability
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
This change depends on contextual UI substitution and derived dungeon state. Without focused regression coverage, the action screen can easily drift back to an empty combat mode, or break on edge dungeon states.

# Scope
- In:
- Add app-level regression tests for:
  - showing the dungeon summary when the active hero is in an active dungeon,
  - preserving the normal action summary for ordinary skill actions,
  - handling partial or unusual dungeon state safely if selector fallback logic is added.
- Add selector/view-model tests if the dungeon summary derivation introduces non-trivial logic.
- Keep the tests deterministic and focused on hero-action-page behavior.
- Out:
- No expansion into broad end-to-end dungeon replay testing in this item.

# Acceptance criteria
- Regression tests protect the contextual dungeon summary behavior on the hero `ACTION` page.
- Tests prove that non-dungeon action summary behavior remains unchanged.
- Fallback behavior is covered if the implementation introduces degraded or partial-state rendering paths.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_063_show_contextual_dungeon_summary_on_hero_action_screen_when_action_summary_is_hidden.md`.
- Planned delivery via `logics/tasks/task_112_execute_req063_contextual_dungeon_summary_on_action_screen_across_backlog_items_212_to_214.md`.
- Depends on:
  - `logics/backlog/item_212_req063_add_active_hero_dungeon_summary_selector_for_action_screen_context.md`
  - `logics/backlog/item_213_req063_render_contextual_dungeon_summary_in_action_status_panel.md`
- Likely touch points:
  - `tests/app/App.test.tsx`
  - `tests/app/panels.test.tsx`
  - `tests/app/*dungeon*.test.tsx`
  - `tests/app/selectors/*`
