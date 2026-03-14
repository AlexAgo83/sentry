## item_187_req056_implement_top_down_steering_approach_orbit_and_separation - req056 implement deterministic top-down steering with approach/orbit/recover/reposition and separation
> From version: 0.9.38
> Status: Done
> Understanding: 96%
> Confidence: 91%
> Progress: 100%
> Complexity: High
> Theme: Gameplay / Movement
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Combat units currently feel anchored and robotic because they do not continuously navigate range control, orbit, and spacing. Natural top-down dueling requires a deterministic steering model with readable behavior transitions.

# Scope
- In:
- Implement v1 movement behavior states per unit: `Approach`, `Orbit`, `Attack`, `Recover`, `Reposition`.
- Add steering composition for:
  - range-keeping around preferred combat ring,
  - curved approach/orbit tangent,
  - local separation to avoid stacking on the same point.
- Apply inertial motion parameters (acceleration, max speed, turn rate, friction) and clamp logic.
- Add per-unit deterministic variation knobs (orbit side, reaction offset, range bias).
- Expose constants for tuning without logic rewrites.
- Out:
- No global navmesh or complex obstacle system.
- No non-deterministic randomness in movement decisions.

# Acceptance criteria
- Units no longer remain static in fixed slots during active combat phases.
- Melee units naturally approach target range, orbit briefly, then recover/reposition.
- Focus fire scenarios keep visible separation between allies.
- Movement remains deterministic for identical seed/state/replay input.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_056_top_down_combat_movement_natural_choreography.md`.
- Implemented via `logics/tasks/task_105_execute_req056_top_down_combat_movement_choreography_across_backlog_items_186_to_189.md`.
- Depends on `logics/backlog/item_186_req056_define_dungeon_combat_movement_state_and_snapshot_contract.md`.
- Likely touch points:
  - `src/app/components/dungeon/arenaPlayback/helpers.ts`
  - `src/app/components/dungeon/arenaPlayback/frameBuilder.ts`
  - `src/app/components/dungeon/renderer/constants.ts`
  - `src/core/dungeon/tick.ts`
