## task_107_execute_req058_atomic_startup_persistence_across_backlog_items_194_to_196 - Execute req058 atomic startup persistence across backlog items 194 to 196
> From version: 0.9.38
> Status: Done
> Understanding: 96%
> Confidence: 93%
> Progress: 100%
> Complexity: Medium
> Theme: Reliability / Persistence
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Derived from:
- `logics/backlog/item_194_req058_gate_runtime_persistence_while_startup_bootstrap_is_running.md`
- `logics/backlog/item_195_req058_block_startup_interrupt_persistence_and_finalize_single_commit_write.md`
- `logics/backlog/item_196_req058_add_atomic_startup_persistence_regression_coverage.md`

Request reference:
- `logics/request/req_058_make_startup_offline_catch_up_atomic_and_prevent_partial_save_persistence.md`

This task delivers atomic startup persistence semantics for offline catch-up so startup replay is treated as all-or-nothing from the durable save point of view.

# Decisions (v1)
- Startup bootstrap must not produce durable writes until it completes successfully.
- The implementation may use runtime-level persistence gating rather than a separate temporary store in v1.
- Lifecycle interrupt paths must follow the same rule as the main bootstrap path:
  - no partial save writes during startup,
  - one final durable save only after successful completion.
- Deterministic recomputation on next launch is acceptable and preferred over partial persistence.

# Architecture summary
- Persist safety belongs in `GameRuntime`, not in UI code.
- The persistence contract should be enforced centrally so regular writes, forced writes, and lifecycle-triggered writes all obey the same startup rule.
- Lifecycle handlers (`beforeunload`, visibility changes, stop/abort) must be audited as part of the same delivery because they are alternate write entry points.
- Regression coverage should target runtime semantics directly; UI assertions are secondary.

# Plan
- [x] 1. Execute `item_194` (central runtime persistence gate):
  - Add an explicit runtime predicate for “startup bootstrap persistence allowed”.
  - Ensure `persist()` respects it across default and forced calls.
  - Keep final successful bootstrap save path intact.
- [x] 2. Execute `item_195` (interrupt semantics + single final write):
  - Prevent `beforeunload`/visibility/bootstrap interruption paths from forcing startup writes.
  - Verify successful bootstrap still commits one durable save after completion.
  - Confirm restart semantics remain deterministic after interrupted startup.
- [x] 3. Execute `item_196` (regression + validation):
  - Add runtime regression coverage for in-progress startup, interrupt paths, and successful completion.
  - Add any necessary app-level tests only where runtime semantics need UI confirmation.
  - Run validation suite and fix failures.
- [x] FINAL: Update related Logics docs (request/backlog/task alignment)

# Validation
Final gate (mandatory at task end):
- `npm run lint`
- `npm run typecheck`
- `npm run typecheck:tests`
- `npm run test:ci`
