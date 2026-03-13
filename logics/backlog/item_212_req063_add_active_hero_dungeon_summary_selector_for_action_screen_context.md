## item_212_req063_add_active_hero_dungeon_summary_selector_for_action_screen_context - req063 add an active-hero dungeon summary selector for action-screen context
> From version: 0.9.38
> Understanding: 97%
> Confidence: 95%
> Progress: 0%
> Complexity: Medium
> Theme: Architecture / Selectors
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The hero `ACTION` screen currently knows whether the active hero is in a dungeon, but it does not expose a clean view-model for summarizing that dungeon context. Pulling raw dungeon/run derivation directly into the panel component would increase UI coupling and duplicate logic already spread across dungeon-related code.

# Scope
- In:
- Add a small selector or view-model layer that derives a concise dungeon summary for the active hero when they are assigned to an active run.
- Reuse existing dungeon state and definitions to resolve:
  - run identity,
  - dungeon name,
  - player/run status,
  - concise progress metadata if available.
- Keep the selector resilient to partial or edge dungeon state.
- Out:
- No action-screen rendering changes in this item.
- No full dungeon screen refactor.

# Acceptance criteria
- The app can derive a stable dungeon summary model for the active hero from existing state.
- The model is concise enough for the `ACTION` screen and does not expose raw runtime internals directly.
- Missing or partial dungeon state degrades to a safe fallback rather than breaking rendering.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_063_show_contextual_dungeon_summary_on_hero_action_screen_when_action_summary_is_hidden.md`.
- Planned delivery via `logics/tasks/task_112_execute_req063_contextual_dungeon_summary_on_action_screen_across_backlog_items_212_to_214.md`.
- Likely touch points:
  - `src/app/selectors/*`
  - `src/core/dungeon/*`
  - `src/core/types.ts`
  - `src/data/dungeons.ts`
