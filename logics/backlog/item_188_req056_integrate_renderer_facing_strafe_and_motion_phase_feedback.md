## item_188_req056_integrate_renderer_facing_strafe_and_motion_phase_feedback - req056 integrate facing-aware rendering and motion-phase feedback for top-down combat readability
> From version: 0.9.38
> Status: Done
> Understanding: 96%
> Confidence: 92%
> Progress: 100%
> Complexity: Medium
> Theme: UX / Visual Readability
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Even with improved movement simulation, combat can still read poorly if facing, strafing, and attack-phase feedback are not reflected clearly in rendering.

# Scope
- In:
- Make renderer consume movement state (position deltas + facing) to display coherent top-down motion.
- Support strafe-like behavior where target-facing differs from travel direction.
- Align attack-phase feedback with movement phases:
  - wind-up movement damping,
  - impact/recovery displacement cues.
- Keep compatibility with existing attack VFX and floating text layers.
- Out:
- No full character animation rig overhaul.
- No cinematic camera system.

# Acceptance criteria
- Facing consistently tracks combat target while movement can remain lateral.
- Wind-up/recovery windows are visually distinguishable from free movement.
- Existing attack VFX still render correctly with the updated motion pipeline.
- No visible jitter spikes introduced by renderer integration.

# Priority
- Impact: Medium
- Urgency: Medium

# Notes
- Derived from `logics/request/req_056_top_down_combat_movement_natural_choreography.md`.
- Implemented via `logics/tasks/task_105_execute_req056_top_down_combat_movement_choreography_across_backlog_items_186_to_189.md`.
- Depends on `logics/backlog/item_186_req056_define_dungeon_combat_movement_state_and_snapshot_contract.md` and `logics/backlog/item_187_req056_implement_top_down_steering_approach_orbit_and_separation.md`.
- Likely touch points:
  - `src/app/components/dungeon/renderer/updateFrame.ts`
  - `src/app/components/dungeon/renderer/drawing.ts`
  - `src/app/components/dungeon/renderer/constants.ts`
