## task_032_validate_cloud_save_payloads_server_side - Validate cloud save payloads server-side
> From version: 0.8.17
> Status: Done
> Non-semantic edit: Add the missing legacy closure checklist for operator cleanup 2026-11-12.
> Understanding: 92%
> Confidence: 90%
> Progress: 100%

# Context
Derived from `logics/backlog/item_037_validate_cloud_save_payloads.md`.
Shallow validation: version + top-level fields. Unknown fields allowed. Invalid payloads should return 400.

# Plan
- [x] 1. Define minimal save schema + version contract (top-level fields only).
- [x] 2. Implement server-side validator and reject invalid payloads with 400.
- [x] 3. Add logging/telemetry for validation failures.
- [x] 4. Add backend tests for valid and invalid payloads.
- [x] FINAL: Update Logics docs and notes.

# Validation
- npm run tests
- npm run lint

# Report
- Status: complete.
- Notes: Added a minimal schema + validator with warning logs and backend coverage for invalid payloads.

# Notes

# Definition of Done (DoD)
- [x] Historical `Done` status retained; no further work is planned (operator decision 2026-11-12).

Legacy metadata migration only: this records the existing terminal state, not a retrospective assessment of delivery criteria. Original scope, validation evidence, and completion reports remain authoritative.
