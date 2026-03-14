## item_246_req070_define_cloud_orchestration_module_boundaries_and_public_contracts - req070 define cloud orchestration module boundaries and public contracts
> From version: 0.9.40
> Status: Ready
> Understanding: 96%
> Confidence: 93%
> Progress: 0%
> Complexity: Medium
> Theme: Frontend / Cloud / Architecture
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`src/app/hooks/useCloudSave.tsx` currently acts as one large orchestration surface for several different cloud responsibilities. That makes internal boundaries implicit and increases the risk that a change in one area leaks into others.

# Scope
- In:
- Identify and define the intended internal module seams for cloud orchestration.
- Keep the public `CloudSaveController` surface stable where practical.
- Establish explicit boundaries for at least:
  - auth/profile lifecycle,
  - warmup/probe/retry lifecycle,
  - autosync/conflict orchestration,
  - sync watermark persistence,
  - optional E2E bridge helpers.
- Document the responsibilities and ownership of each seam before large logic moves begin.
- Out:
- No player-facing feature changes.
- No backend API changes.

# Acceptance criteria
- The project has an explicit internal architecture plan for cloud orchestration modules.
- The expected public controller contract and the private module seams are clear enough to guide the refactor.

# Priority
- Impact: High
- Urgency: Medium

# Notes
- Derived from `logics/request/req_070_modularize_cloud_save_orchestration_and_reduce_frontend_regression_risk.md`.
- Likely touch points:
  - `src/app/hooks/useCloudSave.tsx`
  - `src/app/api/cloudClient.ts`
  - `src/app/types/*`
