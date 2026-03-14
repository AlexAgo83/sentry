## req_067_improve_gameplay_choice_clarity_with_lightweight_systematic_value_cues - Improve gameplay choice clarity with lightweight systematic value cues
> From version: 0.9.39
> Understanding: 96%
> Confidence: 94%
> Complexity: Medium
> Theme: UX / Gameplay readability / Decision support
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.
> Status: Ready

# Needs
- Players still need clearer signals about why one action, recipe, dungeon, or activity is worth choosing over another.
- Some recent reward improvements made advanced content better, but the game still communicates value too implicitly in several places.
- The project needs a lightweight but systematic readability pass so choices feel intentional rather than opaque.

# Context
- The game already includes many useful decision surfaces:
  - action selection,
  - recipe selection,
  - dungeon setup,
  - hero action screen,
  - stats/progression views.
- However, value communication is still uneven:
  - some choices surface progression cues,
  - others remain implicit,
  - risk/reward is not always easy to read.
- The project should improve choice readability without turning every screen into a dense analytics dashboard.

# Goals
- Make gameplay choices easier to evaluate at a glance.
- Surface value cues consistently across the most important decision points.
- Keep the UI lightweight and readable rather than overly analytical.
- Help the player understand:
  - what this choice does,
  - why it matters,
  - what tradeoff it represents.

# Non-goals
- Adding full spreadsheets or optimization dashboards to the player UI.
- Replacing gameplay experimentation with exact solver-style guidance.
- Redesigning every screen from scratch.

# Locked decisions (v1)
## Lightweight, not noisy
- The UI should use concise cues:
  - reward hints,
  - risk hints,
  - readiness bands,
  - expected gains,
  - progression relevance markers.
- Avoid cluttering every card/panel with too many metrics.
- Preferred v1 forms include compact chips, badges, short `Expected gains` lines, and lightweight readiness labels.

## Systematic over ad hoc
- Value communication should be applied consistently where it matters most, not only in isolated screens.
- Reuse shared selectors/view-models and formatting helpers where possible.

## Player comprehension over exactness
- Exact values are useful in some places, but the main goal is decision clarity.
- The UI should prefer “useful directionality” over excessive numeric noise.
- Exact values should be used when they are stable and honest.
- Otherwise the UI should prefer qualitative or banded cues over false precision.

## Prioritize the highest-cost decisions first
- v1 should prioritize:
  - dungeon readiness and risk/reward surfaces first,
  - then action/recipe choice surfaces,
  - then secondary hero/action contextual surfaces.

# Scope detail (draft)
## High-priority surfaces
- Action/recipe selection
- Dungeon setup and readiness surfaces
- Hero action status context
- Key progression/stat screens where the player decides what to do next
- Dungeon-facing readiness and value communication should be the first implementation priority.

## Candidate cues
- expected XP or progression payoff
- loot/reward opportunity
- risk/readiness bands
- “good next step” or progression-fit signals
- stronger contrast between trivial/safe/challenging options

## Implementation direction
- Add shared derived view-models rather than duplicating gameplay math inside components.
- Introduce formatting conventions for lightweight value cues so the UI remains coherent.

# Product/architecture constraints
- Choice cues must remain grounded in real runtime/data values.
- UI should not promise precision that gameplay systems do not actually guarantee.
- Derived presentation logic should be shareable across screens.

# Technical references likely impacted
- `src/app/components/*`
- `src/app/selectors/*`
- `src/app/ui/*`
- `src/core/rewards.ts`
- `src/data/*`
- `tests/app/*`

# Acceptance criteria
- Important gameplay choice surfaces expose clearer value cues.
- The UI remains readable and does not regress into noise.
- Value cues are derived consistently rather than invented ad hoc per component.

# Test expectations
- Follow-up execution should expect:
  - app tests for cue visibility/rendering,
  - selector/view-model tests for derived value signals,
  - regression coverage on key decision screens.

# Risks / open points
- Too much information will reduce clarity instead of improving it.
- If derived cues are inconsistent between screens, trust will drop.
- Some cues may need tuning once the dungeon balance simulator exists.

# Follow-up candidates
- shared value-cue view-models
- dungeon readiness cues
- action/recipe expected gain cues
- UX regression coverage

# Backlog
- `logics/backlog/item_223_req067_define_shared_choice_value_view_models_and_formatting_helpers.md`
- `logics/backlog/item_224_req067_add_dungeon_readiness_and_risk_reward_value_cues.md`
- `logics/backlog/item_225_req067_add_action_and_recipe_expected_gain_and_progression_fit_cues.md`
- `logics/backlog/item_226_req067_add_regression_coverage_for_shared_choice_value_cues.md`
