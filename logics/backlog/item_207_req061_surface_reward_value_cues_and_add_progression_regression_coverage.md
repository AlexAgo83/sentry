## item_207_req061_surface_reward_value_cues_and_add_progression_regression_coverage - req061 surface reward-value cues and add progression regression coverage
> From version: 0.9.38
> Understanding: 97%
> Confidence: 94%
> Progress: 0%
> Complexity: Medium
> Theme: UX / Quality
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Even with better underlying formulas, players still need some readable signal that advanced content is more rewarding, and the repo needs regression coverage to prevent reward scaling from drifting back toward flat progression.

# Scope
- In:
- Surface lightweight reward/risk/progression cues in relevant UI surfaces, such as:
  - recipe/action selection,
  - action summary,
  - dungeon selection / risk-reward area.
- Add regression tests locking the intended progression ordering between trivial and advanced content.
- Add coverage for reward calculators so reward scaling remains explicit and reviewable.
- Out:
- No full analytics dashboard or simulator UI.
- No broad visual redesign of gameplay panels.

# Acceptance criteria
- Players can understand, from at least one existing UI surface, why higher-tier choices are better.
- Tests fail if higher-tier content stops outperforming trivial content on intended axes.
- Reward/risk cues remain lightweight and do not overwhelm normal gameplay UI.
- Validation gates remain green with the new regression coverage.

# Priority
- Impact: Medium
- Urgency: Medium

# Notes
- Derived from `logics/request/req_061_make_higher_tier_skills_recipes_and_dungeons_provide_meaningfully_better_progression.md`.
- Planned delivery via `logics/tasks/task_110_execute_req061_progression_reward_scaling_across_backlog_items_204_to_207.md`.
- Depends on:
  - `logics/backlog/item_205_req061_route_action_and_recipe_progression_through_tiered_reward_calculators.md`
  - `logics/backlog/item_206_req061_rebalance_dungeon_progression_rewards_with_clear_tier_payoff.md`
- Likely touch points:
  - `src/app/components/ActionSelectionScreen.tsx`
  - `src/app/components/DungeonScreen.tsx`
  - `tests/app/*`
  - `tests/core/*`
