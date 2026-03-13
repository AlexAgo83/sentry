## item_204_req061_define_reward_profile_contracts_for_recipes_and_dungeons - req061 define reward profile contracts for recipes and dungeons
> From version: 0.9.38
> Understanding: 97%
> Confidence: 94%
> Progress: 100%
> Complexity: Medium
> Theme: Architecture / Data
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Reward scaling is currently implicit and fragmented. Actions use mostly flat XP constants, while recipes and dungeons rely on unlock levels and output tables without a unified contract describing why higher-tier content should yield stronger progression.

# Scope
- In:
- Define explicit reward profile metadata for recipes and dungeons.
- Keep the contract small and tuneable, for example around:
  - reward tier / difficulty weight,
  - XP scaling multipliers or coefficients,
  - optional risk/value hints needed by calculators/UI.
- Update core types and data definitions to support these profiles cleanly.
- Document the expected meaning of each reward profile field.
- Out:
- No runtime reward formula implementation in this item.
- No UI rendering changes in this item.

# Acceptance criteria
- Recipes and dungeons can carry explicit reward profile metadata.
- The contract is stable enough to drive both runtime formulas and lightweight UI hints.
- Existing data definitions remain understandable and tuneable after the contract is introduced.
- The architecture no longer depends solely on flat global XP constants for progression tuning.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_061_make_higher_tier_skills_recipes_and_dungeons_provide_meaningfully_better_progression.md`.
- Planned delivery via `logics/tasks/task_110_execute_req061_progression_reward_scaling_across_backlog_items_204_to_207.md`.
- Likely touch points:
  - `src/core/types.ts`
  - `src/data/definitions/actions.ts`
  - `src/data/definitions/recipes/*`
  - `src/data/dungeons.ts`
