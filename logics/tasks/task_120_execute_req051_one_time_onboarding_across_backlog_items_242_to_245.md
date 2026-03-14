## task_120_execute_req051_one_time_onboarding_across_backlog_items_242_to_245 - Execute req051 one-time onboarding across backlog items 242 to 245
> From version: 0.9.40
> Status: Done
> Understanding: 100%
> Confidence: 100%
> Progress: 100%
> Complexity: High
> Theme: UX / Onboarding / Guidance orchestration
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Derived from:
- `logics/backlog/item_242_req051_define_persisted_onboarding_state_and_migration_contract.md`
- `logics/backlog/item_243_req051_build_onboarding_orchestrator_with_intro_hint_and_nudge_priorities.md`
- `logics/backlog/item_244_req051_ship_compact_intro_modal_and_contextual_hint_surfaces_for_key_screens.md`
- `logics/backlog/item_245_req051_add_settings_controls_and_regression_coverage_for_one_shot_onboarding_behavior.md`

Request reference:
- `logics/request/req_051_one_time_onboarding_modals_first_minutes_and_per_screen_guidance.md`

This task delivers a lightweight onboarding system that helps first-time players reach their first meaningful actions without turning the game into a modal-heavy tutorial. The implementation should combine a short intro, contextual one-shot hints, and a small number of blocker nudges under one orchestrated state model.

# Decisions (v1)
- The onboarding system is single-use by default and persisted in saves.
- The guidance stack is:
  - short intro flow,
  - per-screen one-shot hints,
  - limited conditional nudges.
- Only one onboarding surface may be visible at a time.
- The UI should prefer compact intro modals and lighter contextual hints over repeated blocking popups.
- Settings must let the player disable onboarding and reset progress.

# Architecture summary
- A persisted onboarding state model stores enablement and per-step history.
- An onboarding orchestrator computes the highest-priority eligible surface from:
  - app readiness,
  - current screen,
  - player progression/blocker state,
  - prior dismiss/completion history.
- The UI layer provides:
  - compact intro modal(s),
  - screen-level contextual hints,
  - limited blocker nudges.
- Regression coverage protects persistence and one-shot behavior.

# Plan
- [x] 1. Execute `item_242` (persisted onboarding contract):
  - Define the onboarding state model.
  - Wire serialization and migrations.
- [x] 2. Execute `item_243` (orchestrator):
  - Implement intro/hint/nudge prioritization.
  - Enforce one-surface-at-a-time behavior.
- [x] 3. Execute `item_244` (player-facing UI):
  - Ship the compact intro flow.
  - Add contextual hints for the agreed key screens.
  - Keep cloud guidance optional and backend-aware.
- [x] 4. Execute `item_245` (Settings controls and tests):
  - Add disable/reset controls.
  - Add regression coverage for persistence and one-shot guarantees.
- [x] FINAL: Update related Logics docs (request/backlog/task alignment)

# Validation
Final gate (mandatory at task end):
- `npm run lint`
- `npm run typecheck`
- `npm run typecheck:tests`
- `npm run test:ci`
- `npm run coverage:ci`
