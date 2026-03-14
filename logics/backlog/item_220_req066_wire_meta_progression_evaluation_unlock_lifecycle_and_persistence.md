## item_220_req066_wire_meta_progression_evaluation_unlock_lifecycle_and_persistence - req066 wire meta progression evaluation, unlock lifecycle, and persistence
> From version: 0.9.39
> Status: Done
> Understanding: 94%
> Confidence: 92%
> Progress: 100%
> Complexity: High
> Theme: Progression / Runtime / Persistence
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Meta progression only becomes meaningful once milestones are evaluated from actual gameplay and their unlock state persists safely. Without runtime evaluation and persistence wiring, the system remains a design artifact rather than a game feature.

# Scope
- In:
- Evaluate milestone progress from real gameplay events/systems.
- Persist meta progression state in saves.
- Apply the unlock lifecycle cleanly so roster/account-wide rewards can be resolved deterministically.
- Out:
- No full UI/communication layer in this item.
- No large balance redesign of existing hero progression.

# Acceptance criteria
- Milestone progress is updated from actual gameplay progression sources.
- Unlock state persists cleanly in saves.
- The runtime can resolve unlocked meta rewards deterministically.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_066_add_long_term_meta_progression_and_return_drivers_across_sessions.md`.
- Likely touch points:
  - `src/core/*`
  - `src/data/*`
  - `tests/core/*`
- Delivered via:
  - `src/core/reducer.ts`
  - `src/core/state.ts`
  - `src/core/serialization.ts`
  - `src/adapters/persistence/saveMigrations.ts`
