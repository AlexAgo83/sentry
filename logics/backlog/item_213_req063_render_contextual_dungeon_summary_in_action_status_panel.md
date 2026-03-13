## item_213_req063_render_contextual_dungeon_summary_in_action_status_panel - req063 render a contextual dungeon summary in the action status panel
> From version: 0.9.38
> Understanding: 96%
> Confidence: 94%
> Progress: 0%
> Complexity: Medium
> Theme: UX / Action screen
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
In combat/dungeon mode, `ActionStatusPanel` hides the normal action summary because no standard recipe/skill loop is active. This leaves the hero `ACTION` page visually sparse and under-informative.

# Scope
- In:
- Use the empty summary area in combat/dungeon mode to render a dungeon-specific summary panel.
- Keep the panel concise and hero-oriented, for example around:
  - dungeon name,
  - current run/floor/stage,
  - current status such as moving/combat/boss/recovery,
  - optional lightweight risk/reward context if already easy to source.
- Keep existing non-dungeon action summary behavior unchanged.
- Avoid turning the panel into a duplicate of the dedicated dungeon screen.
- Out:
- No redesign of the full `ACTION` page layout.
- No full combat log, replay, or dungeon-control surface inside the action panel.

# Acceptance criteria
- When the selected hero is in an active dungeon and the normal action summary is hidden, a contextual dungeon summary is shown in that area.
- The panel keeps the page readable and clearly anchored to the selected hero.
- Normal action/recipe summary rendering remains unchanged for non-dungeon actions.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_063_show_contextual_dungeon_summary_on_hero_action_screen_when_action_summary_is_hidden.md`.
- Planned delivery via `logics/tasks/task_112_execute_req063_contextual_dungeon_summary_on_action_screen_across_backlog_items_212_to_214.md`.
- Depends on:
  - `logics/backlog/item_212_req063_add_active_hero_dungeon_summary_selector_for_action_screen_context.md`
- Likely touch points:
  - `src/app/containers/ActionPanelContainer.tsx`
  - `src/app/components/ActionStatusPanel.tsx`
  - `src/app/styles/panels/action.css`
  - `src/app/styles/responsive.css`
