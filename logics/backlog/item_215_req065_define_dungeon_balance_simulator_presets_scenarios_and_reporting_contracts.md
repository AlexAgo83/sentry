## item_215_req065_define_dungeon_balance_simulator_presets_scenarios_and_reporting_contracts - req065 define dungeon balance simulator presets, scenarios, and reporting contracts
> From version: 0.9.39
> Status: Done
> Understanding: 100%
> Confidence: 97%
> Progress: 100%
> Complexity: Medium
> Theme: Balance / Architecture / Tooling
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The project wants an internal dungeon balance simulator, but without explicit contracts for team presets, readiness assumptions, scenario bands, and report shape, implementation would quickly drift into ad hoc scripts that are hard to trust or compare over time.

# Scope
- In:
- Define the internal contract for simulator presets, including:
  - composition archetype,
  - level assumptions,
  - gear/readiness assumptions by progression milestone,
  - optional consumable assumptions.
- Define the initial scenario matrix and difficulty bands:
  - `likely_fail`,
  - `close_clear`,
  - `safe_clear`.
- Define the output/report shape for a dungeon simulation result so before/after balance comparisons remain possible.
- Out:
- No simulator execution engine in this item.
- No runtime balancing changes in this item.

# Acceptance criteria
- The repository has a clear internal contract for dungeon balance presets and scenario expectations.
- The initial v1 presets cover at least a standard team and one more aggressive DPS-leaning variant.
- Report output fields are explicit enough to support tuning diffs and later automation.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_065_add_an_internal_dungeon_balance_simulator_for_difficulty_diagnostics_and_tuning.md`.
- Likely touch points:
  - `src/core/dungeonBalance.ts`
  - `scripts/*`
  - `tests/*balance*`
