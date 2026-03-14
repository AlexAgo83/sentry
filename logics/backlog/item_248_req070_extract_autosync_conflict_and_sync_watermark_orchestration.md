## item_248_req070_extract_autosync_conflict_and_sync_watermark_orchestration - req070 extract autosync conflict and sync watermark orchestration
> From version: 0.9.40
> Status: Ready
> Understanding: 95%
> Confidence: 92%
> Progress: 0%
> Complexity: High
> Theme: Frontend / Cloud / Sync / Reliability
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Autosync push logic, conflict escalation, cloud/local snapshot comparison, and sync watermark persistence are tightly coupled in the same large orchestration file. This raises the chance of save regressions when changing any one of those behaviors.

# Scope
- In:
- Extract autosync orchestration into a clearer dedicated module or hook.
- Extract conflict escalation and resolution helpers into a clearer seam.
- Extract or isolate sync watermark persistence/coordination helpers.
- Preserve current behavior for:
  - best-effort bootstrap refresh,
  - conflict detection,
  - load-cloud vs overwrite-cloud conflict resolution,
  - visibility/online-triggered autosync.
- Out:
- No cloud-save product feature redesign.
- No changes to backend payload schema or revision semantics.

# Acceptance criteria
- Autosync/conflict orchestration is no longer embedded as one dense inline block inside the main hook.
- Sync watermark behavior remains stable and testable.
- Cloud conflict flows continue to behave the same from a player perspective.

# Priority
- Impact: High
- Urgency: Medium

# Notes
- Derived from `logics/request/req_070_modularize_cloud_save_orchestration_and_reduce_frontend_regression_risk.md`.
- Likely touch points:
  - `src/app/hooks/useCloudSave.tsx`
  - `tests/compat/saveBootstrapCompatibility.test.ts`
  - `tests/app/*cloud*`
  - `tests/e2e/smoke.spec.ts`
