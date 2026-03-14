## item_242_req051_define_persisted_onboarding_state_and_migration_contract - req051 define persisted onboarding state and migration contract
> From version: 0.9.40
> Status: Ready
> Understanding: 96%
> Confidence: 93%
> Progress: 0%
> Complexity: Medium
> Theme: Architecture / Persistence / UX state
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The onboarding system needs durable one-shot behavior across relaunch, import/export, and cloud sync. Without an explicit persisted contract, the intro flow and contextual hints would either repeat incorrectly or become brittle to future version changes.

# Scope
- In:
- Define and persist the onboarding state contract for v1.
- Cover:
  - globally enabled/disabled onboarding,
  - intro completion,
  - shown/completed/dismissed step tracking,
  - migration/versioning safety.
- Wire the state into save serialization and migrations.
- Out:
- No onboarding UI in this item.
- No orchestration logic beyond the state contract.

# Acceptance criteria
- The repo has a clear persisted onboarding state model.
- The model survives save round-trips and is migration-safe.
- The contract supports intro steps, contextual hints, and later onboarding additions.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_051_one_time_onboarding_modals_first_minutes_and_per_screen_guidance.md`.
- Likely touch points:
  - `src/core/types.ts`
  - `src/core/state.ts`
  - `src/core/serialization.ts`
  - `src/adapters/persistence/saveMigrations.ts`
  - tests around serialization/migrations
