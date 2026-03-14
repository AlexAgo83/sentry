## item_186_req056_define_dungeon_combat_movement_state_and_snapshot_contract - req056 define deterministic movement state and arena snapshot contract for top-down combat
> From version: 0.9.38
> Status: Done
> Understanding: 97%
> Confidence: 93%
> Progress: 100%
> Complexity: Medium
> Theme: Architecture / Combat Runtime
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Top-down combat movement cannot evolve safely without a stable, explicit movement-state contract shared by simulation, frame builder, renderer, and replay. Current unit snapshots are focused on static slot placement plus attack cues.

# Scope
- In:
- Define movement state fields in arena snapshot/runtime types (for example: velocity, facing, behavior state, target range profile, state timers).
- Add deterministic defaults/fallbacks so missing data never breaks rendering/replay.
- Update frame building so movement-related fields are produced consistently for heroes and enemies.
- Document invariants required by replay determinism.
- Out:
- No tuning-heavy steering behavior implementation in this item.
- No renderer-facing polish logic beyond consuming the new contract.

# Acceptance criteria
- Arena types expose movement-state fields required by v1 choreography.
- Frame builder outputs consistent movement-state values for each unit.
- Replay payload/state remains backward compatible or has a safe migration path.
- No runtime crashes when older/missing movement state is encountered.

# Priority
- Impact: High
- Urgency: Medium

# Notes
- Derived from `logics/request/req_056_top_down_combat_movement_natural_choreography.md`.
- Implemented via `logics/tasks/task_105_execute_req056_top_down_combat_movement_choreography_across_backlog_items_186_to_189.md`.
- Likely touch points:
  - `src/app/components/dungeon/arenaPlayback/types.ts`
  - `src/app/components/dungeon/arenaPlayback/frameBuilder.ts`
  - `src/core/types.ts`
