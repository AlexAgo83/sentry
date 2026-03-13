## item_205_req061_route_action_and_recipe_progression_through_tiered_reward_calculators - req061 route action and recipe progression through tiered reward calculators
> From version: 0.9.38
> Understanding: 96%
> Confidence: 92%
> Progress: 100%
> Complexity: High
> Theme: Runtime / Progression
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`applyActionTick` currently derives progression from flat action-level XP values, which means higher-tier recipes often do not provide materially better skill/recipe progression than lower-tier ones.

# Scope
- In:
- Introduce centralized calculators/helpers for action/recipe reward progression.
- Make recipe progression gains depend on the new reward profile contract instead of only flat `xpSkill` / `xpRecipe`.
- Support intentional differentiation across recipe tiers, such as:
  - better XP efficiency,
  - better output efficiency,
  - soft triviality penalty on content far below the player’s progression level.
- Keep online and offline tick paths using the exact same reward logic.
- Out:
- No dungeon reward changes in this item.
- No broad UI communication work in this item.

# Acceptance criteria
- Higher-tier recipes produce measurably better progression payoff than trivial lower-tier recipes on intended axes.
- Reward math is centralized in dedicated helpers rather than inlined throughout `applyActionTick`.
- Existing action loops remain deterministic and compatible with offline catch-up.
- Any triviality penalty remains soft and does not break low-tier fallback usage.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_061_make_higher_tier_skills_recipes_and_dungeons_provide_meaningfully_better_progression.md`.
- Planned delivery via `logics/tasks/task_110_execute_req061_progression_reward_scaling_across_backlog_items_204_to_207.md`.
- Depends on:
  - `logics/backlog/item_204_req061_define_reward_profile_contracts_for_recipes_and_dungeons.md`
- Likely touch points:
  - `src/core/loop/actionTick.ts`
  - `src/data/definitions/actions.ts`
  - `src/data/definitions/recipes/*`
  - `tests/core/*`
