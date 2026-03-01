## task_105_execute_req056_top_down_combat_movement_choreography_across_backlog_items_186_to_189 - Execute req056 top-down combat movement choreography across backlog items 186 to 189
> From version: 0.9.38
> Understanding: 98%
> Confidence: 94%
> Progress: 100%
> Complexity: High
> Theme: Gameplay / Combat Feel
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc.

# Context
Derived from:
- `logics/backlog/item_186_req056_define_dungeon_combat_movement_state_and_snapshot_contract.md`
- `logics/backlog/item_187_req056_implement_top_down_steering_approach_orbit_and_separation.md`
- `logics/backlog/item_188_req056_integrate_renderer_facing_strafe_and_motion_phase_feedback.md`
- `logics/backlog/item_189_req056_add_movement_determinism_performance_and_regression_coverage.md`

Request reference:
- `logics/request/req_056_top_down_combat_movement_natural_choreography.md`

This orchestration task delivers req056 end-to-end:
- deterministic movement-state contract shared by runtime/frame/renderer/replay,
- top-down steering with approach/orbit/attack/recover/reposition behavior flow,
- facing-aware renderer integration with readable strafe and attack-phase motion,
- determinism/performance guardrails and regression coverage for choreography behavior.

# Decisions (v1)
- Movement choreography must remain deterministic for identical seed/state/replay input.
- Use a finite-state behavior model per unit (`Approach`, `Orbit`, `Attack`, `Recover`, `Reposition`).
- Enforce preferred range bands and curved approach/orbit instead of static slot anchoring.
- Compose movement via bounded steering vectors (range control + orbit + separation + soft avoidance).
- Decouple facing from travel direction to support strafe-like readability.
- Keep tuning data-driven through constants and avoid hardcoding per-encounter behaviors.

# Plan
- [x] 1. Execute `item_186` (movement-state contract + snapshot model):
  - Extend arena/runtime types with movement state fields (velocity/facing/state/timers/range profile).
  - Ensure safe defaults/fallback behavior for legacy/missing fields.
  - Keep replay compatibility guarantees explicit.
- [x] 2. Execute `item_187` (deterministic steering and behavior transitions):
  - Implement behavior transitions and steering composition.
  - Add inertial limits (acceleration/speed/turn/friction) and deterministic per-unit variation.
  - Add separation rules for focus-fire spacing.
- [x] 3. Execute `item_188` (renderer integration and motion readability):
  - Consume facing/motion state in frame rendering.
  - Reflect wind-up/recovery movement dampening and strafe behavior visually.
  - Preserve compatibility with existing attack VFX and floating text layers.
- [x] 4. Execute `item_189` (quality gates and regressions):
  - Add transition/steering unit tests and replay determinism coverage.
  - Add renderer stability/coherence regression tests (including no-throw paths).
  - Validate no major frame-path performance regression under typical combat density.
- [x] FINAL: Update related Logics docs (request/backlog/task alignment)

# Validation
Final gate (mandatory at task end):
- `npm run lint`
- `npm run typecheck`
- `npm run typecheck:tests`
- `npm run test:ci`

Recommended:
- `npm run build`
- `npm run test:e2e`

# Report
Delivered:
- Added movement-state snapshot contract in arena playback units (`movementState`, `targetId`, `facing`, `velocity`, preferred ranges) while keeping backward-safe optional fields.
- Implemented deterministic choreography/steering in frame building:
  - state flow `approach/orbit/attack/recover/reposition`,
  - preferred range control by role/weapon type,
  - curved orbit behavior,
  - deterministic per-unit variation and reaction delay,
  - local same-team separation.
- Integrated renderer-facing readability:
  - hero facial direction now follows facing vector,
  - enemy sprite left/right orientation follows facing,
  - attack charge bar gets attack/recover phase accents.
- Added regression coverage for deterministic movement/facing/spacing in `tests/app/dungeonArenaPlayback.test.ts`.

Validation results:
- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm run typecheck:tests` ✅
- `npm run test:ci` ✅
- `npm run build` ✅
