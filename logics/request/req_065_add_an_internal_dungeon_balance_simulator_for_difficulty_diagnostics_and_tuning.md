## req_065_add_an_internal_dungeon_balance_simulator_for_difficulty_diagnostics_and_tuning - Add an internal dungeon balance simulator for difficulty diagnostics and tuning
> From version: 0.9.39
> Understanding: 100%
> Confidence: 97%
> Complexity: High
> Theme: Gameplay / Balance / Dungeon / Tooling
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.
> Status: Done

# Needs
- Dungeon difficulty currently has to be judged mostly through manual playtesting and anecdotal runs.
- A single observed pain point such as `Black Sanctuary` feeling too hard is useful, but it should be treated as a signal about the broader dungeon difficulty curve rather than as an isolated one-off problem.
- The project needs a deterministic internal tool that can evaluate how reference teams perform across all dungeons, so balancing can be based on repeatable diagnostics instead of intuition alone.

# Context
- The game already has a headless dungeon simulation path through the core runtime:
  - dungeon definitions in `src/data/dungeons.ts`,
  - dungeon lifecycle in `src/core/dungeon/lifecycle.ts`,
  - combat stepping in `src/core/dungeon/tick.ts`,
  - formulas and progression hooks in `src/core/dungeon/formulas.ts`.
- This means a balance simulator should reuse the actual game systems rather than introducing a parallel fake combat model.
- Current design questions are systemic:
  - when should a dungeon be a likely fail,
  - when should it become a close clear,
  - when should it become a stable farm,
  - does hero level and baseline gear move those thresholds in a satisfying way across the full dungeon ladder.
- The simulator must therefore be usable not only to inspect results but also to support future tuning work.

# Goals
- Build an internal-only dungeon balance simulator that runs against the real dungeon domain logic.
- Define one or more canonical team presets representing expected player progress states.
- Measure performance of those presets across all dungeons in a repeatable and comparable way.
- Produce output that is useful for:
  - difficulty diagnostics,
  - spotting progression walls or tier inversions,
  - guiding future tuning changes.
- Establish explicit difficulty targets per dungeon state such as:
  - likely fail,
  - close clear,
  - safe clear.

# Non-goals
- Shipping a visible player-facing dungeon simulator UI in the game.
- Adding automatic self-balancing logic that edits dungeon values on its own.
- Replacing human judgment on dungeon feel, encounter identity, or boss personality.
- Modeling every possible team/build permutation in v1.

# Locked decisions (v1)
## Internal tool first
- The simulator should be an internal script/tooling surface only in v1.
- It may output to console, JSON, Markdown, or CSV, but it does not need an in-game UI.

## Canonical presets over combinatorial search
- v1 should use a small number of explicit team presets instead of trying to brute-force all possible compositions.
- v1 should begin with at least two explicit presets so the curve is not tuned around one single archetype only:
  - a `standard` preset such as `1 melee / 2 ranged / 1 support`,
  - an `aggressive` preset with a more DPS-leaning structure.
- Presets should reflect normal expected progression states rather than idealized min-max teams.

## Readiness should be modeled by progression milestone, not level alone
- Baseline expected gear/loadout should be defined by progression milestone or tier expectations, not only by hero level.
- Pure level-only assumptions are too weak to evaluate dungeon readiness meaningfully.

## Use real runtime logic
- The simulator must reuse the actual dungeon lifecycle/tick code path so results stay meaningful.
- It must not drift into a simplified parallel model unless a clearly justified abstraction layer is introduced.

## Tooling for tuning, not only observation
- The simulator must be designed so it can be reused after balance changes to compare before/after outcomes.
- Output should help answer:
  - which dungeon tiers are too punishing,
  - where progression walls appear,
  - whether a tuning change improved or overcorrected the curve.

## Difficulty targets should be explicit
- v1 should formalize target outcome bands such as:
  - `likely_fail`,
  - `close_clear`,
  - `safe_clear`.
- These bands should describe the intended readiness curve instead of leaving interpretation fully implicit.

# Scope detail (draft)
## A. Team preset model
- Define a compact internal representation for dungeon test presets, including:
  - party composition,
  - hero levels,
  - expected skill levels if relevant,
  - baseline equipment tier/loadout tied to progression milestone,
  - optional consumable assumptions if required by dungeon logic.
- v1 should keep presets intentionally small and understandable.

## B. Scenario matrix
- Allow simulation of all dungeon definitions against one or more chosen presets.
- Support multiple difficulty checkpoints per dungeon, such as:
  - underleveled attempt,
  - target level attempt,
  - above-target safe-farm attempt.
- The scenario matrix should help visualize the shape of the difficulty curve, not just one isolated run.

## C. Metrics and reporting
- The simulator should capture at least:
  - win/fail,
  - floor reached,
  - surviving heroes,
  - remaining HP summary,
  - remaining food,
  - run duration,
  - end reason.
- If seeds materially affect outcomes, v1 may support multiple seeded runs and aggregate simple win-rate style summaries.
- Output should be easy to review during tuning work.
- The report should be useful both as a one-off diagnostic and as a before/after tuning artifact.

## D. Difficulty target contract
- Define a simple vocabulary for desired outcomes:
  - `likely_fail`,
  - `close_clear`,
  - `safe_clear`.
- The project should be able to express expected readiness for a dungeon using those target bands.
- This contract should support future assertions or non-blocking reports such as:
  - “tier 5 target team should usually close-clear tier 5 dungeon”,
  - “same team should likely fail tier 6”.
- Any CI/report integration should begin as diagnostic or non-blocking before considering stronger enforcement.

## E. Tuning workflow support
- The tool should be easy to run before and after tuning dungeon parameters.
- It should support comparing reports across changes, whether through:
  - consistent JSON output,
  - summary tables,
  - or simple diff-friendly text.
- The goal is to make balancing iterative and evidence-based.

# Product/architecture constraints
- The simulator must stay close to actual game runtime behavior.
- Preset construction should avoid duplicating too much ad hoc game logic; if test-state builders are needed, they should be explicit and reusable.
- Output should remain deterministic for identical input presets and seeds.
- v1 should not become a huge generalized balancing platform; it should focus specifically on dungeon difficulty diagnostics.
- CI integration, if any, should likely begin as non-blocking or narrow smoke checks rather than a large brittle full-balance gate.

# Technical references likely impacted
- `src/core/dungeon/*`
- `src/core/state.ts`
- `src/core/reducer.ts`
- `src/core/types.ts`
- `src/data/dungeons.ts`
- `src/data/items/*`
- `scripts/*`
- `tests/core/*dungeon*`
- `tests/*balance*`

# Acceptance criteria
- An internal simulator exists that can run canonical reference teams against dungeon definitions using the real dungeon logic.
- The simulator produces a reviewable report of dungeon outcomes and core difficulty metrics.
- The tool can be used to inspect the global dungeon curve, not only a single dungeon in isolation.
- The output is structured enough to support future balancing work and before/after tuning comparisons.
- The design remains narrow enough to implement and maintain without turning into a full-blown generic balancing framework.

# Outcome
- Implemented in `src/core/dungeonBalance.ts` with:
  - canonical `standard` and `aggressive` presets,
  - milestone-aware loadout assumptions,
  - real lifecycle/tick-based scenario execution,
  - difficulty-band evaluation,
  - summary and threshold reports for tuning review.
- Added repo entrypoint `npm run balance:dungeons` backed by `scripts/balance/run-dungeon-balance.ts`.
- Added regression coverage in `tests/balance/dungeonBalanceSimulator.test.ts`.
- The first version is intentionally diagnostic-first and non-blocking; it surfaces curve mismatches rather than enforcing balance gates.

# Test expectations
- Mandatory validation for implementation slices will likely include:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run typecheck:tests`
  - targeted simulator/unit tests
  - `npm run test:ci`
- Expected additions:
  - deterministic tests for preset generation/state construction,
  - simulator/report regression tests for representative dungeon scenarios,
  - targeted validation that the simulator uses the real dungeon logic path.

# Risks / open points
- If preset assumptions are unrealistic, the simulator may produce misleading balance conclusions.
- If output is too verbose or too raw, it may not actually help tuning decisions.
- If the tool tries to cover too many dimensions at once, it may become slow or hard to trust.
- Seed variance may need careful handling so “close clear” does not look falsely stable or falsely random.
- Equipment assumptions must be explicit, otherwise level-based conclusions will be muddy.

# Follow-up candidates
- Preset catalog for multiple expected player archetypes.
- Report visualization or Markdown export.
- Non-blocking CI/report job for dungeon balance snapshots.
- Explicit target bands per dungeon tier and progression milestone.

# Backlog
- `logics/backlog/item_215_req065_define_dungeon_balance_simulator_presets_scenarios_and_reporting_contracts.md`
- `logics/backlog/item_216_req065_build_headless_dungeon_balance_runner_using_real_runtime_logic.md`
- `logics/backlog/item_217_req065_add_difficulty_band_evaluation_and_tuning_friendly_report_outputs.md`
- `logics/backlog/item_218_req065_add_dungeon_balance_simulator_regression_coverage_and_non_blocking_repo_entrypoints.md`
