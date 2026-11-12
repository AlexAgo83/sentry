## task_038_add_bundle_size_and_perf_budgets - Add bundle size and perf budgets
> From version: 0.8.17
> Status: Done
> Non-semantic edit: Add the missing legacy closure checklist for operator cleanup 2026-11-12.
> Understanding: 92%
> Confidence: 90%
> Progress: 100%

# Context
Derived from `logics/backlog/item_043_bundle_perf_budgets.md`.
Add build size reporting + HTML report and fail CI on thresholds.

# Plan
- [x] 1. Add build size reporting (Vite analyzer or custom script).
- [x] 2. Define bundle size thresholds and add CI failure logic.
- [x] 3. Generate HTML report for inspection.
- [x] FINAL: Update Logics docs and notes.

# Validation
- npm run build

# Report
- Status: complete.
- Notes: Added bundle visualizer HTML report and a bundle size budget script wired into CI/release.

# Notes

# Definition of Done (DoD)
- [x] Historical `Done` status retained; no further work is planned (operator decision 2026-11-12).

Legacy metadata migration only: this records the existing terminal state, not a retrospective assessment of delivery criteria. Original scope, validation evidence, and completion reports remain authoritative.
