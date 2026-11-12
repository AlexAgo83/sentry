## task_058_dungeon_combat_per_step_perf_caching - Dungeon combat per-step perf caching
> From version: 0.9.8
> Status: Done
> Non-semantic edit: Add the missing legacy closure checklist for operator cleanup 2026-11-12.
> Understanding: 95%
> Confidence: 94%
> Progress: 100%
> Reminder: Update Understanding/Confidence/Progress when you edit this doc.

# Context
Derived from `logics/backlog/item_072_dungeon_combat_step_perf_cache.md`

# Decisions
- Cache is per step, recalculated each tick.
- Cache includes effective stats, attack interval, and base damage.
- No micro-profiling output (silent optimization).

# Plan
- [x] 1. Identify repeated per-step computations in `src/core/dungeon.ts` (effective stats, attack interval, base damage, party lookups).
- [x] 2. Implement per-step caches and pre-indexed party/hero lookups; keep combat outcomes identical.
- [x] 3. Verify determinism via existing tests and adjust if needed.
- [x] FINAL: Update related Logics docs

# Validation
- npm run tests
- npm run lint

# Report
- Added per-step hero stat caching and party indexing in `src/core/dungeon.ts` to reduce repeated computations.

# Definition of Done (DoD)
- [x] Historical `Done` status retained; no further work is planned (operator decision 2026-11-12).

Legacy metadata migration only: this records the existing terminal state, not a retrospective assessment of delivery criteria. Original scope, validation evidence, and completion reports remain authoritative.
