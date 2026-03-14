## task_115_execute_req067_choice_clarity_value_cues_across_backlog_items_223_to_226 - Execute req067 choice-clarity value cues across backlog items 223 to 226
> From version: 0.9.39
> Status: Done
> Understanding: 100%
> Confidence: 97%
> Progress: 100%
> Complexity: Medium
> Theme: UX / Gameplay readability / Decision support
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Derived from:
- `logics/backlog/item_223_req067_define_shared_choice_value_view_models_and_formatting_helpers.md`
- `logics/backlog/item_224_req067_add_dungeon_readiness_and_risk_reward_value_cues.md`
- `logics/backlog/item_225_req067_add_action_and_recipe_expected_gain_and_progression_fit_cues.md`
- `logics/backlog/item_226_req067_add_regression_coverage_for_shared_choice_value_cues.md`

Request reference:
- `logics/request/req_067_improve_gameplay_choice_clarity_with_lightweight_systematic_value_cues.md`

This task improves player decision readability by introducing shared lightweight value-cue contracts, prioritizing dungeon-facing readiness/risk communication first, then extending the same design vocabulary to action and recipe choices.

# Decisions (v1)
- Value cues should stay lightweight:
  - chips,
  - badges,
  - short `Expected gains` lines,
  - compact readiness/value labels.
- Exact values should be shown only when they are stable and honest; otherwise the UI should prefer qualitative or banded cues.
- The first implementation priority is dungeon-facing readiness/risk/reward communication, followed by action/recipe surfaces.
- Shared view-models/helpers must own cue derivation rather than duplicating gameplay math inside components.

# Architecture summary
- Shared selector/view-model helpers define:
  - readiness bands,
  - expected gains,
  - risk/reward labels,
  - progression-fit cues.
- Dungeon setup surfaces consume those helpers first because they represent the highest-cost decisions.
- Action/recipe surfaces then reuse the same vocabulary and formatting approach.
- Regression coverage protects both shared derivation logic and the most important rendered surfaces.

# Plan
- [x] 1. Execute `item_223` (shared view-models/helpers):
  - Define the shared cue derivation and formatting helpers.
  - Keep the contract small and reusable.
- [x] 2. Execute `item_224` (dungeon cues first):
  - Add readiness and risk/reward communication to dungeon-facing decision surfaces.
  - Preserve readability and avoid clutter.
- [x] 3. Execute `item_225` (action/recipe cues):
  - Add expected-gain and progression-fit cues to action/recipe surfaces.
  - Keep them consistent with the shared cue model.
- [x] 4. Execute `item_226` (regression coverage):
  - Add tests for shared cue derivation and key rendered surfaces.
  - Lock the lightweight/systematic behavior into the repo.
- [x] FINAL: Update related Logics docs (request/backlog/task alignment)

# Validation
Final gate (mandatory at task end):
- `npm run lint`
- `npm run typecheck`
- `npm run typecheck:tests`
- `npm run test:ci`
