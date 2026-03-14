## item_219_req066_define_meta_progression_state_milestone_taxonomy_and_reward_contracts - req066 define meta progression state, milestone taxonomy, and reward contracts
> From version: 0.9.39
> Status: Done
> Understanding: 95%
> Confidence: 93%
> Progress: 100%
> Complexity: High
> Theme: Progression / Architecture
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The project wants stronger long-term return motivation, but there is not yet an explicit contract for what meta progression tracks exist, what milestone categories they use, and what kinds of rewards they unlock. Without that contract, implementation would likely fragment across gameplay systems.

# Scope
- In:
- Define a v1 meta progression model that is primarily roster/account-wide.
- Define milestone categories and progression semantics for the initial meta layer.
- Define the reward contract so unlocks, utility, and strategic options are explicit and reviewable.
- Out:
- No runtime milestone evaluation in this item.
- No UI implementation in this item.

# Acceptance criteria
- The repository has an explicit contract for meta progression state and milestone categories.
- Reward types are clear enough to guide later runtime/UI work.
- The model favors directed, understandable milestones over sprawling open-ended tracks.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_066_add_long_term_meta_progression_and_return_drivers_across_sessions.md`.
- Likely touch points:
  - `src/core/types.ts`
  - `src/data/*`
  - `tests/*`
- Delivered via:
  - `src/core/types.ts`
  - `src/core/metaProgression.ts`
