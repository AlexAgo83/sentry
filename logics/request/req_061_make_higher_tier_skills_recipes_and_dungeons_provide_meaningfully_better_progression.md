## req_061_make_higher_tier_skills_recipes_and_dungeons_provide_meaningfully_better_progression - Make higher-tier skills, recipes, and dungeons provide meaningfully better progression
> From version: 0.9.38
> Understanding: 96%
> Confidence: 93%
> Complexity: High
> Theme: Balance / Progression / Architecture
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.
> Status: Done

# Needs
- Higher-level recipes and harder dungeons should provide a clear gameplay benefit versus lower-tier content.
- Progression unlocks must feel worthwhile instead of cosmetic or optional when they are strictly harder to access.
- Reward scaling should stay deterministic, data-driven, and maintainable rather than relying on scattered hard-coded constants.

# Context
- Action skill progression is currently driven by a flat action reward model:
  - `xpSkill = 1`
  - `xpRecipe = 2`
  - shared across all action skills in `ACTION_DEFINITIONS`
- Most recipe differentiation currently comes from:
  - `unlockLevel`
  - item costs/rewards
  - occasional gold/item outputs
- Dungeon combat XP currently uses a simple linear floor formula and loot scales mostly through dungeon-specific loot tables, but the overall “higher tier = better progression return” contract is still weak or implicit.
- As a result, players can unlock harder content without receiving a clear gain in:
  - XP per minute,
  - progression efficiency,
  - resource value,
  - risk/reward return.

# Goals
- Make higher-tier recipes and dungeons materially better on at least one clear progression axis.
- Keep progression architecture explicit and reviewable through dedicated reward profile contracts and calculators.
- Avoid making all low-tier content instantly obsolete; older content may remain useful as safe/cheap fallback.
- Preserve deterministic outcomes for identical save state and elapsed runtime.

# Non-goals
- Full rebalance of every economy/quest/loot/stat subsystem in one pass.
- Introducing a new hero-level system separate from existing skill progression.
- Reworking every UI panel to expose full DPS/efficiency simulations.
- Solving all long-term balance questions beyond a first coherent reward architecture.

# Locked decisions (v1)
## Reward philosophy
- Harder or later-unlocked content must be clearly better on at least one of these axes:
  - skill XP efficiency,
  - recipe XP efficiency,
  - resource/gold output efficiency,
  - dungeon combat progression,
  - loot quality / exclusivity / density.
- “Better” does not mean strictly dominant on every axis.

## Architecture direction
- Replace or augment flat reward constants with explicit reward profiles attached to recipes and dungeons.
- Keep reward calculation centralized in dedicated formulas/helpers rather than embedding balance logic directly in UI or long runtime loops.

## Low-level content relevance
- Lower-tier content may remain useful through:
  - lower cost,
  - lower risk,
  - specific materials,
  - smoother recovery/safe farming.
- A soft triviality penalty or efficiency falloff may be used to discourage staying forever on trivial content.

## Determinism
- Reward scaling must remain deterministic for:
  - online ticks,
  - offline catch-up,
  - dungeon replay/recap paths.

# Scope detail (draft)
## Reward model contract
- Introduce explicit reward metadata for action/recipe progression:
  - reward tier / difficulty weight,
  - optional XP multipliers,
  - optional output value/risk metadata if needed.
- Introduce clearer progression/reward metadata for dungeons:
  - tier-based combat XP scaling,
  - expected reward/risk profile,
  - stronger tie between dungeon tier and long-term progression payoff.

## Runtime calculators
- Extract reward computation into focused formulas/helpers for:
  - action skill XP,
  - recipe XP,
  - dungeon combat XP,
  - optional triviality penalty / efficiency falloff.
- Keep `applyActionTick` and dungeon tick/lifecycle flows consuming these helpers rather than hard-coding reward math inline.

## Data layer
- Update recipes and dungeons data to carry the minimum metadata needed for meaningful scaling.
- Keep the schema simple enough to tune incrementally without touching many unrelated systems.

## UI / player communication
- Surface enough context so players can understand why a higher-tier choice is better.
- Candidate surfaces:
  - recipe selection / action summary,
  - dungeon selection card / risk tier / expected reward hints.
- UI communication may remain lightweight in v1, but reward advantages must be legible somewhere.

## Validation and tuning
- Add regression tests locking core reward progression expectations.
- Add targeted tuning checks so higher-tier content is measurably better than trivial baseline content on intended axes.

# Technical references likely impacted
- `src/core/types.ts`
- `src/data/definitions/actions.ts`
- `src/data/definitions/recipes/*`
- `src/data/dungeons.ts`
- `src/core/loop/actionTick.ts`
- `src/core/loop.ts`
- `src/core/dungeon/formulas.ts`
- `src/core/dungeon/tick.ts`
- `src/app/components/ActionSelectionScreen.tsx`
- `src/app/components/DungeonScreen.tsx`
- `src/app/selectors/*`
- `tests/core/*`
- `tests/app/*`
- `logics/request/req_019_dungeon_combat_xp_and_roaming_skill_split.md`
- `logics/request/req_018_group_idle_dungeon_combat_loop.md`

# Acceptance criteria
- Higher-tier recipes provide better progression value than trivial lower-tier recipes on at least one explicit axis.
- Higher-tier dungeons provide better progression payoff than lower-tier dungeons on at least one explicit axis.
- Reward formulas are centralized and data-driven rather than spread across multiple ad hoc constants.
- Offline catch-up and normal runtime use the same reward logic with deterministic results.
- The player can understand, from gameplay or UI hints, why advancing to harder content is beneficial.

# Test expectations
- Mandatory validation:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run typecheck:tests`
  - `npm run test:ci`
- Expected additions:
  - action reward progression tests across recipe tiers,
  - dungeon reward progression tests across dungeon tiers,
  - regression tests for triviality-penalty or fallback rules if added,
  - UI tests for reward/risk/progression hints where surfaced.

# Risks / open points
- Over-buffing advanced content can make all early content dead too quickly.
- A triviality penalty that is too aggressive can feel punitive rather than guiding.
- UI hints must stay simple; too much exposed math will increase cognitive load.
- Reward architecture should not become so granular that tuning requires editing dozens of unrelated files.

# Backlog
- `logics/backlog/item_204_req061_define_reward_profile_contracts_for_recipes_and_dungeons.md`
- `logics/backlog/item_205_req061_route_action_and_recipe_progression_through_tiered_reward_calculators.md`
- `logics/backlog/item_206_req061_rebalance_dungeon_progression_rewards_with_clear_tier_payoff.md`
- `logics/backlog/item_207_req061_surface_reward_value_cues_and_add_progression_regression_coverage.md`
