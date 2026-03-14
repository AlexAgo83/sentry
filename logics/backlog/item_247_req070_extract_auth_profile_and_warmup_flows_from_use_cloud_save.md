## item_247_req070_extract_auth_profile_and_warmup_flows_from_use_cloud_save - req070 extract auth profile and warmup flows from useCloudSave
> From version: 0.9.40
> Status: Done
> Understanding: 100%
> Confidence: 96%
> Progress: 100%
> Complexity: High
> Theme: Frontend / Cloud / Auth / Warmup
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Authentication/profile lifecycle and backend warmup logic currently live inside the same large hook body, along with unrelated save-sync logic. That makes status handling and retries harder to reason about and test.

# Scope
- In:
- Extract auth/profile concerns into a clearer dedicated internal module or hook.
- Extract backend warmup/probe/retry behavior into a clearer dedicated internal module or hook.
- Preserve current behavior for:
  - login/register,
  - silent refresh,
  - profile fetch/update,
  - warmup retry timing and messages,
  - offline transitions.
- Keep the provider-facing API stable unless a small compatibility adapter is needed.
- Out:
- No redesign of auth semantics.
- No autosync/conflict refactor unless directly needed to preserve wiring.

# Acceptance criteria
- Auth/profile lifecycle no longer lives only as implicit inline logic in the monolithic hook body.
- Warmup/probe/retry handling is separated into a clearer seam.
- Existing player-facing auth/cloud behavior remains stable.

# Priority
- Impact: High
- Urgency: Medium

# Notes
- Derived from `logics/request/req_070_modularize_cloud_save_orchestration_and_reduce_frontend_regression_risk.md`.
- Likely touch points:
  - `src/app/hooks/useCloudSave.tsx`
  - `src/app/hooks/cloudSave/cloudSaveActions.ts`
  - `src/app/hooks/cloudSave/cloudSaveModel.ts`
  - `tests/app/api/cloudClient.storage.test.ts`
