## task_071_dungeon_completion_counter_state - Persist completion counts
> From version: 0.9.9
> Owner: —
> Status: Done
> Non-semantic edit: Add the missing legacy closure checklist for operator cleanup 2026-11-12.
> Understanding: 95%
> Confidence: 91%
> Progress: 100%

# Summary
Add and persist a per-dungeon completion counter that increments on victory only.

# Dependencies
- item_085_dungeon_completion_counter_state

# Steps
1. Add a `completionCounts` map keyed by dungeon ID to persisted state.
2. Increment count on victory run end in dungeon runtime.
3. Add save migration for the new state field.
4. Update any selectors/tests referencing dungeon state.

# Decisions
- Victory is `status === "victory"`.
- Increment on `run_end` for victory only (avoid double increment).

# Acceptance criteria
- Counter increments exactly once per victory run.
- Counter persists across reloads.
- Replay does not increment the counter.

# Definition of Done (DoD)
- [x] Historical `Done` status retained; no further work is planned (operator decision 2026-11-12).

Legacy metadata migration only: this records the existing terminal state, not a retrospective assessment of delivery criteria. Original scope, validation evidence, and completion reports remain authoritative.
