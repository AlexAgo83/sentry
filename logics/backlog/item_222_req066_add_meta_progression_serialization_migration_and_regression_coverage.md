## item_222_req066_add_meta_progression_serialization_migration_and_regression_coverage - req066 add meta progression serialization, migration, and regression coverage
> From version: 0.9.39
> Understanding: 94%
> Confidence: 92%
> Progress: 100%
> Complexity: Medium
> Theme: Progression / Quality / Persistence
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Meta progression introduces durable player state. Without serialization, migration, and regression coverage, the system would be risky to evolve and could easily regress save compatibility or milestone correctness.

# Scope
- In:
- Add tests for meta progression persistence and milestone behavior.
- Add migration coverage if the save contract changes.
- Validate that milestone rewards remain deterministic and stable across save/load cycles.
- Out:
- No new progression features in this item.

# Acceptance criteria
- Meta progression state round-trips correctly through saves.
- New or migrated saves preserve milestone correctness.
- Regression coverage exists for the main milestone and reward flows introduced by the request.

# Priority
- Impact: High
- Urgency: Medium

# Notes
- Derived from `logics/request/req_066_add_long_term_meta_progression_and_return_drivers_across_sessions.md`.
- Likely touch points:
  - `tests/core/*`
  - `tests/app/*`
  - serialization/migration code
- Delivered via:
  - `tests/core/metaProgression.test.ts`
  - `tests/core/serialization.test.ts`
  - `tests/adapters/persistence/saveEnvelope.test.ts`
  - `tests/app/questsPanel.test.tsx`
