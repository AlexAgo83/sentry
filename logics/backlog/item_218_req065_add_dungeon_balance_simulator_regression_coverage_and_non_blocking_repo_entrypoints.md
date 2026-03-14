## item_218_req065_add_dungeon_balance_simulator_regression_coverage_and_non_blocking_repo_entrypoints - req065 add dungeon balance simulator regression coverage and non-blocking repo entrypoints
> From version: 0.9.39
> Understanding: 95%
> Confidence: 93%
> Progress: 0%
> Complexity: Medium
> Theme: Balance / Quality / Tooling
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Once the simulator exists, the repo still needs a trustworthy way to run it and keep it from silently drifting. Without targeted regression coverage and a clear non-blocking entrypoint, the tool would be difficult to rely on during future balancing work.

# Scope
- In:
- Add deterministic tests around preset construction, reporting contracts, and representative simulation behavior.
- Add a clear repository command or commands for running the simulator locally.
- If CI/report integration is introduced, keep it non-blocking or narrow in v1.
- Out:
- No hard blocking full-balance CI gate.
- No public UI/report dashboard.

# Acceptance criteria
- The simulator has targeted regression coverage.
- Contributors have a clear local command for running it.
- Any repo/CI integration remains diagnostic-first rather than brittle.

# Priority
- Impact: Medium
- Urgency: Medium

# Notes
- Derived from `logics/request/req_065_add_an_internal_dungeon_balance_simulator_for_difficulty_diagnostics_and_tuning.md`.
- Likely touch points:
  - `package.json`
  - `scripts/*`
  - `tests/*balance*`

