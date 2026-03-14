## task_114_execute_req066_meta_progression_across_backlog_items_219_to_222 - Execute req066 meta progression across backlog items 219 to 222
> From version: 0.9.39
> Understanding: 95%
> Confidence: 93%
> Progress: 0%
> Complexity: High
> Theme: Progression / Retention / Product
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Derived from:
- `logics/backlog/item_219_req066_define_meta_progression_state_milestone_taxonomy_and_reward_contracts.md`
- `logics/backlog/item_220_req066_wire_meta_progression_evaluation_unlock_lifecycle_and_persistence.md`
- `logics/backlog/item_221_req066_ship_initial_meta_progression_ui_and_goal_communication_surfaces.md`
- `logics/backlog/item_222_req066_add_meta_progression_serialization_migration_and_regression_coverage.md`

Request reference:
- `logics/request/req_066_add_long_term_meta_progression_and_return_drivers_across_sessions.md`

This task introduces a first meta progression layer that gives players stronger session-to-session goals and a clearer sense of roster/account-wide advancement, while keeping the system directed, understandable, and compatible with the current save/runtime architecture.

# Decisions (v1)
- Meta progression should be primarily roster/account-wide in its first version.
- The first implementation should use directed milestone structures rather than open-ended systems.
- Rewards should prioritize unlocks, strategic options, and meaningful utility over broad passive numeric inflation.
- The system should reuse existing gameplay sources and remain deterministic/persistable.
- UI should explain goals and unlocked value without becoming a separate “wiki screen”.

# Architecture summary
- Contracts/types define:
  - meta progression state,
  - milestone taxonomy,
  - reward categories and resolution rules.
- Runtime wiring:
  - evaluates milestone progress from real gameplay progression,
  - persists unlock state,
  - resolves unlocked benefits deterministically.
- UI:
  - surfaces active goals,
  - communicates progress and unlocked rewards,
  - keeps milestone direction legible.
- Regression/migration coverage protects save compatibility and milestone correctness.

# Plan
- [ ] 1. Execute `item_219` (state + taxonomy + rewards):
  - Define the v1 meta progression model and reward contract.
  - Keep the taxonomy directed and understandable.
- [ ] 2. Execute `item_220` (runtime + persistence):
  - Wire milestone evaluation into real gameplay progression sources.
  - Persist state and resolve unlock lifecycle cleanly.
- [ ] 3. Execute `item_221` (initial UI surfaces):
  - Add UI that communicates active goals, progress, and unlocked value.
  - Keep the surface coherent with the current app structure.
- [ ] 4. Execute `item_222` (serialization + migration + regression coverage):
  - Add save-roundtrip and migration coverage if needed.
  - Lock milestone correctness with regression tests.
- [ ] FINAL: Update related Logics docs (request/backlog/task alignment)

# Validation
Final gate (mandatory at task end):
- `npm run lint`
- `npm run typecheck`
- `npm run typecheck:tests`
- `npm run test:ci`

