## req_063_show_contextual_dungeon_summary_on_hero_action_screen_when_action_summary_is_hidden - Show a contextual dungeon summary on the hero action screen when the action summary is hidden
> From version: 0.9.38
> Understanding: 98%
> Confidence: 95%
> Complexity: Medium
> Theme: UX / Dungeon / Hero actions
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.
> Status: Done

# Needs
- The hero `ACTION` screen currently feels sparse when the selected hero is engaged in a dungeon run.
- In dungeon/combat context, the usual action summary panel is hidden because the hero is not running a normal skill loop.
- Players still need a clear answer to: what is this hero doing right now inside the dungeon?

# Context
- On the hero `ACTION` page, the usual `ts-action-summary` panel provides useful context for non-dungeon skills/actions.
- When the hero is in a dungeon/combat action state, that summary is hidden because the current action is effectively combat-driven rather than tied to a standard looping skill panel.
- The remaining visible information is limited, typically around:
  - skill selection showing `Combat`,
  - HP,
  - level.
- This leaves the page under-informative even though the hero is actively participating in a dungeon run.
- The player must mentally switch to the dungeon screen to understand what the hero is doing, which weakens the coherence of the hero-centric action page.

# Goals
- Fill the empty informational space on the hero `ACTION` page when the selected hero is assigned to an active dungeon run.
- Keep the page hero-centric while surfacing the most relevant dungeon context.
- Reuse existing dungeon/run state rather than inventing a fake skill/action summary for `Combat`.
- Make the `ACTION` page answer “what is this hero doing now?” consistently across both normal skill actions and dungeon participation.

# Non-goals
- Replacing the dedicated dungeon screen.
- Duplicating the entire dungeon UI on the hero action page.
- Inventing a full combat log or replay surface inside the action panel.
- Redesigning the complete hero action layout in one pass.

# Locked decisions (v1)
## Contextual replacement, not additive clutter
- When the normal action summary is hidden because the hero is in dungeon/combat context, the empty area should be reused for a dungeon-specific summary panel.
- The dungeon summary should act as a contextual replacement for the missing action summary, not as a second heavy panel stacked on top of existing content.

## Dungeon-first wording
- The panel should describe the active dungeon run rather than pretending the hero is executing a standard skill summary.
- `Combat` may remain visible as a secondary hero action label if already part of the screen, but it should not be the only meaningful information shown.

## Summary, not duplication
- The panel should provide concise run context, such as:
  - dungeon name,
  - current floor / room / encounter stage if available,
  - run status like moving / fighting / boss / recovery,
  - lightweight reward/risk context if already available.
- The panel should not mirror the full dungeon screen or embed complex controls by default.

# Scope detail (draft)
## UI behavior
- Detect when the selected hero is attached to an active dungeon run and the normal action summary is not shown.
- Render a contextual dungeon summary panel in the summary area of the `ACTION` screen.
- Preserve the current behavior for heroes performing ordinary actions/skills.

## Data/selectors
- Reuse existing dungeon state and selectors where possible to derive:
  - the active dungeon run for the selected hero,
  - the dungeon identity,
  - the hero/run phase,
  - concise progress/status metadata.
- If needed, add a small selector/view-model layer rather than pushing dungeon derivation directly into the component.

## Information hierarchy
- Prioritize information that helps the player orient quickly:
  - where the hero is,
  - what stage the run is in,
  - what kind of run context applies now.
- Optional reward/risk hints should stay secondary and only be shown if they are already easy to source cleanly.

## Empty/fallback handling
- If the hero is not in a dungeon, existing action summary behavior remains unchanged.
- If the hero is in an unusual or partially missing dungeon state, the panel should degrade gracefully with a compact fallback rather than rendering nothing or exposing raw state.

# Technical references likely impacted
- `src/app/AppView.tsx`
- `src/app/AppContainer.tsx`
- `src/app/components/*Action*`
- `src/app/components/*Dungeon*`
- `src/app/selectors/*`
- `src/core/types.ts`
- `src/core/dungeon/*`
- `tests/app/*action*.test.tsx`
- `tests/app/*dungeon*.test.tsx`

# Acceptance criteria
- When the selected hero is on the `ACTION` page and engaged in an active dungeon run, the empty summary area shows a dungeon summary panel instead of remaining sparse.
- The panel gives enough information to understand the hero’s current dungeon context without opening the dungeon screen.
- Normal non-dungeon action summary behavior remains unchanged.
- The implementation reuses existing dungeon/runtime state cleanly and does not fake a normal skill summary for combat.

# Test expectations
- Mandatory validation:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run typecheck:tests`
  - `npm run test:ci`
- Expected additions:
  - app test for rendering the dungeon summary when the selected hero is in an active dungeon,
  - app test confirming the normal action summary still renders for non-dungeon actions,
  - fallback/regression test for incomplete or edge dungeon state if a new selector/view-model is introduced.

# Risks / open points
- The action page must not become a confusing partial clone of the dungeon screen.
- If dungeon state is complex or fragmented, selector/view-model work may be needed to keep the component clean.
- The summary must stay readable on smaller layouts and not crowd the existing hero stats block.
- If multiple heroes share a dungeon run, the panel should remain clearly anchored to the selected hero’s context.

# Backlog
- `logics/backlog/item_212_req063_add_active_hero_dungeon_summary_selector_for_action_screen_context.md`
- `logics/backlog/item_213_req063_render_contextual_dungeon_summary_in_action_status_panel.md`
- `logics/backlog/item_214_req063_add_regression_coverage_for_action_screen_dungeon_summary_and_fallbacks.md`
