## task_110_execute_req061_progression_reward_scaling_across_backlog_items_204_to_207 - Execute req061 progression reward scaling across backlog items 204 to 207
> From version: 0.9.38
> Status: Done
> Understanding: 96%
> Confidence: 93%
> Progress: 100%
> Complexity: High
> Theme: Balance / Progression / Architecture
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Derived from:
- `logics/backlog/item_204_req061_define_reward_profile_contracts_for_recipes_and_dungeons.md`
- `logics/backlog/item_205_req061_route_action_and_recipe_progression_through_tiered_reward_calculators.md`
- `logics/backlog/item_206_req061_rebalance_dungeon_progression_rewards_with_clear_tier_payoff.md`
- `logics/backlog/item_207_req061_surface_reward_value_cues_and_add_progression_regression_coverage.md`

Request reference:
- `logics/request/req_061_make_higher_tier_skills_recipes_and_dungeons_provide_meaningfully_better_progression.md`

This task restructures progression rewards so higher-tier recipes and dungeons provide explicit, data-driven progression advantages while preserving deterministic behavior and keeping lower-tier content as intentional fallback rather than mandatory forever-farm.

# Decisions (v1)
- Reward scaling will be contract-driven, not encoded as scattered one-off constants.
- Actions/recipes and dungeons may use different formulas, but they should share the same design vocabulary:
  - tier,
  - difficulty,
  - progression payoff,
  - soft fallback/triviality handling.
- The first implementation should optimize for clarity and maintainability, not perfect long-term balance.
- UI communication should stay lightweight and support the runtime contract instead of introducing a heavy simulator surface.

# Architecture summary
- Data/types own reward profiles.
- Runtime calculators own reward scaling.
- Action and dungeon loops consume those calculators rather than inlining progression math.
- UI exposes enough cues for players to understand why harder content matters.
- Regression coverage locks intended ordering so the system does not drift back to flat rewards.

# Plan
- [x] 1. Execute `item_204` (reward profile contracts):
  - Define recipe and dungeon reward profile metadata in core/data contracts.
  - Update definitions with the minimum metadata needed for scaling.
- [x] 2. Execute `item_205` (action/recipe progression scaling):
  - Add centralized progression reward calculators for action loops.
  - Make higher-tier recipes yield better progression payoff on intended axes.
  - Add soft triviality handling if needed.
- [x] 3. Execute `item_206` (dungeon progression scaling):
  - Centralize dungeon reward formulas and make higher-tier dungeons pay off more clearly.
  - Keep deterministic live/offline/recap behavior.
- [x] 4. Execute `item_207` (UI cues + regression coverage):
  - Surface lightweight reward-value cues in relevant UI.
  - Add progression-ordering tests and validation coverage.
- [x] FINAL: Update related Logics docs (request/backlog/task alignment)

# Validation
Final gate (mandatory at task end):
- `npm run lint`
- `npm run typecheck`
- `npm run typecheck:tests`
- `npm run test:ci`
