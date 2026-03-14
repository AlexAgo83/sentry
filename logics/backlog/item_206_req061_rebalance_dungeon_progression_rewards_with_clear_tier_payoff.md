## item_206_req061_rebalance_dungeon_progression_rewards_with_clear_tier_payoff - req061 rebalance dungeon progression rewards with clear tier payoff
> From version: 0.9.38
> Status: Done
> Understanding: 96%
> Confidence: 92%
> Progress: 100%
> Complexity: High
> Theme: Dungeon / Progression
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Dungeon progression already grants combat XP and loot, but the architecture does not yet make “harder dungeon = stronger progression return” an explicit, tuneable contract. The payoff is therefore easy to under-deliver or drift silently.

# Scope
- In:
- Route dungeon progression rewards through dedicated tier-aware formulas driven by the reward profile contract.
- Strengthen the link between dungeon tier and progression payoff across one or more intended axes:
  - combat XP efficiency,
  - loot value / exclusivity / density,
  - overall long-term progression return.
- Keep deterministic reward behavior for live runs, replay/recap, and offline catch-up.
- Ensure the tuning still allows lower-tier dungeons to remain useful as safer fallback content.
- Out:
- No unrelated dungeon combat mechanics rework.
- No full loot-table redesign beyond what is needed to clarify tier payoff.

# Acceptance criteria
- Higher-tier dungeons provide a clearer progression advantage than lower-tier dungeons on intended axes.
- Dungeon reward math is centralized and data-driven.
- Live runs, offline catch-up, and recap paths all use the same dungeon reward logic.
- Dungeon progression tuning remains compatible with current dungeon architecture and save behavior.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_061_make_higher_tier_skills_recipes_and_dungeons_provide_meaningfully_better_progression.md`.
- Planned delivery via `logics/tasks/task_110_execute_req061_progression_reward_scaling_across_backlog_items_204_to_207.md`.
- Depends on:
  - `logics/backlog/item_204_req061_define_reward_profile_contracts_for_recipes_and_dungeons.md`
- Likely touch points:
  - `src/core/dungeon/formulas.ts`
  - `src/core/dungeon/tick.ts`
  - `src/data/dungeons.ts`
  - `tests/core/dungeon*.test.ts`
