## item_216_req065_build_headless_dungeon_balance_runner_using_real_runtime_logic - req065 build a headless dungeon balance runner using real runtime logic
> From version: 0.9.39
> Status: Done
> Understanding: 100%
> Confidence: 97%
> Progress: 100%
> Complexity: High
> Theme: Balance / Dungeon / Scripts
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The simulator is only useful if it runs against the actual dungeon lifecycle and tick logic. Without a headless runner that builds canonical test states and executes real dungeon runs, balance diagnostics would risk diverging from gameplay reality.

# Scope
- In:
- Build a headless runner that:
  - constructs simulator teams from the preset contract,
  - starts dungeon runs through the real dungeon lifecycle,
  - advances them through the real dungeon tick pipeline,
  - records outcome metrics for each scenario.
- Keep the runner deterministic for identical presets, dungeons, and seeds.
- Out:
- No player-facing UI.
- No CI gating decisions in this item.

# Acceptance criteria
- A scriptable internal runner can execute simulator presets against dungeon definitions using real game logic.
- The runner produces stable outcomes for identical inputs.
- Results include the core metrics required by the reporting contract.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_065_add_an_internal_dungeon_balance_simulator_for_difficulty_diagnostics_and_tuning.md`.
- Likely touch points:
  - `src/core/dungeon/*`
  - `src/core/dungeonBalance.ts`
  - `src/core/state.ts`
  - `src/core/reducer.ts`
  - `scripts/*`
