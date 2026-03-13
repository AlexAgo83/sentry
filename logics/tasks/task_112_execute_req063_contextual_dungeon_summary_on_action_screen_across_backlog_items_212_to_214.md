## task_112_execute_req063_contextual_dungeon_summary_on_action_screen_across_backlog_items_212_to_214 - Execute req063 contextual dungeon summary on the action screen across backlog items 212 to 214
> From version: 0.9.39
> Understanding: 96%
> Confidence: 94%
> Progress: 100%
> Complexity: Medium
> Theme: UX / Dungeon / Action screen
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Derived from:
- `logics/backlog/item_212_req063_add_active_hero_dungeon_summary_selector_for_action_screen_context.md`
- `logics/backlog/item_213_req063_render_contextual_dungeon_summary_in_action_status_panel.md`
- `logics/backlog/item_214_req063_add_regression_coverage_for_action_screen_dungeon_summary_and_fallbacks.md`

Request reference:
- `logics/request/req_063_show_contextual_dungeon_summary_on_hero_action_screen_when_action_summary_is_hidden.md`

This task fills the empty combat-mode area of the hero `ACTION` page by deriving a concise dungeon summary for the active hero and rendering it as a contextual replacement for the missing normal action summary.

# Decisions (v1)
- `ActionPanelContainer` remains the orchestration boundary for hero action context.
- Dungeon-specific derivation should live in a selector/view-model layer rather than being inlined into `ActionStatusPanel`.
- The new panel is a concise contextual replacement, not a duplicate of the full dungeon screen.
- Normal non-dungeon action summary behavior must remain unchanged.

# Architecture summary
- Selector/view-model:
  - derive a lightweight dungeon summary for the active hero from existing dungeon state and definitions.
- Panel integration:
  - feed that summary into `ActionStatusPanel`,
  - render it only when combat mode hides the normal action summary.
- Presentation:
  - preserve existing skill/HP/level structure,
  - add dungeon context in the unused summary area without crowding the layout.
- Regression:
  - add focused tests for dungeon-mode rendering, ordinary action behavior, and fallback safety.

# Plan
- [x] 1. Execute `item_212` (selector/view-model):
  - Add the active-hero dungeon summary derivation layer.
  - Keep it safe against partial state and easy to consume from the action panel.
- [x] 2. Execute `item_213` (panel rendering):
  - Render the contextual dungeon summary in combat/dungeon mode.
  - Preserve normal action summary behavior for non-dungeon actions.
- [x] 3. Execute `item_214` (regression coverage):
  - Add app/selector tests covering dungeon summary rendering and fallbacks.
  - Validate that non-dungeon behavior is unchanged.
- [x] FINAL: Update related Logics docs (request/backlog/task alignment)

# Validation
Final gate (mandatory at task end):
- `npm run lint`
- `npm run typecheck`
- `npm run typecheck:tests`
- `npm run test:ci`

Validation completed successfully during implementation.
