## req_056_top_down_combat_movement_natural_choreography - Make top-down combat movement feel natural and readable
> From version: 0.9.38
> Understanding: 98%
> Confidence: 93%
> Complexity: High
> Theme: UX / Combat Feel
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.
> Status: Done

# Needs
- Improve dungeon combat movement so heroes and enemies feel like they are actively dueling in a top-down arena, instead of mostly static units with short hit motions.
- Make movement readable and intentional during combat exchanges:
  - who is engaging,
  - who is circling/repositioning,
  - who is preparing or recovering from attacks.
- Preserve deterministic replay and performance while introducing richer movement logic.

# Context
- Current arena playback places units on mostly fixed slots (`toUnitPositionMap`) and applies short procedural attack motion (lunge/recoil/spiral) in the renderer.
- Attack readability improved with VFX, but overall locomotion still feels limited because entities do not continuously navigate combat space.
- The game is viewed top-down, so spatial behavior (range control, circling, spacing, facing) strongly affects perceived combat quality.

# Goals
- Introduce a lightweight movement behavior model that creates natural top-down combat flow.
- Keep combat deterministic and replay-friendly.
- Keep implementation modular so tuning can happen through constants without rewriting combat logic.

# Non-goals
- Full physics simulation.
- Skeletal animation system replacement.
- Cinematic camera system or large renderer rewrite.

# Locked decisions (v1)
- Movement behavior uses a finite-state model per unit:
  - `Approach`
  - `Orbit`
  - `Attack`
  - `Recover`
  - `Reposition`
- Every combatant has a preferred combat distance band (`preferredRangeMin/Max`) instead of hard contact locking.
- Units should approach targets with slight curved/offset paths (not strict straight-line convergence).
- Movement should use inertial steering parameters (acceleration, max speed, turn rate, friction) to avoid robotic direction snapping.
- Add local separation/avoidance to prevent stack/blob behavior when multiple allies focus one enemy.
- Facing direction is decoupled from movement direction so units can strafe while tracking target.
- Attack windows explicitly affect motion:
  - reduced movement during wind-up,
  - short recovery drift/backstep after impact.
- Add small per-unit movement variation (reaction delay, orbit side, preferred range bias) to reduce mirror-like behavior.
- Keep global pathing and local steering separated:
  - global path for large repositioning,
  - local steering for combat micro-adjustments.

# Scope detail (draft)
## Arena simulation/playback model
- Extend arena unit snapshot data to carry motion state needed by renderer/replay, for example:
  - velocity vector,
  - facing vector/angle,
  - behavior state,
  - target range preference,
  - optional state timers (wind-up/recover).
- Ensure state transitions are deterministic and reproducible from replay data.

## Motion behaviors
- `Approach`: close distance toward preferred ring with curved entry.
- `Orbit`: maintain distance while circling around target (left/right side bias).
- `Attack`: constrain movement during wind-up/impact window.
- `Recover`: short controlled displacement after attack.
- `Reposition`: move to cleaner lane when blocked or too clustered.

## Steering and collision-lite rules
- Use composable steering vectors:
  - seek/range-keeping toward target ring,
  - tangent orbit component,
  - separation from nearby allies/enemies,
  - soft obstacle/occupied-space avoidance.
- Clamp steering output with configured acceleration/turn limits.

## Visual readability hooks
- Use facing state in renderer for better top-down motion clarity.
- Keep current attack cue/VFX integration and align it with new motion phases.
- Support strafe-like motion where body trajectory and target-facing differ.

## Tuning surface
- Add constants matrix for:
  - range bands by archetype/weapon type,
  - acceleration/speed/turn/friction,
  - orbit strength,
  - separation radius/weight,
  - wind-up/recovery movement dampening.

# Technical references to update (expected)
- `src/app/components/dungeon/arenaPlayback/types.ts`
- `src/app/components/dungeon/arenaPlayback/helpers.ts`
- `src/app/components/dungeon/arenaPlayback/frameBuilder.ts`
- `src/app/components/dungeon/renderer/updateFrame.ts`
- `src/app/components/dungeon/renderer/constants.ts`
- `src/core/dungeon/tick.ts` (if runtime simulation drives part of the movement state)
- `tests/app/dungeonArenaPlayback.test.ts`

# Acceptance criteria
- During combat, units no longer appear statically anchored to fixed slots for the full exchange.
- Melee units naturally approach, orbit, attack, and recover with readable spacing behavior.
- Multiple heroes focusing one enemy maintain visible separation and do not collapse into one point.
- Facing is coherent with target tracking and supports strafe-like movement.
- Replay remains deterministic for same seed/state.
- Movement additions do not cause noticeable visual jitter or major FPS regressions in typical runs.

# Test expectations
- Mandatory validation:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run typecheck:tests`
  - `npm run test:ci`
- Expected test additions:
  - behavior state transition unit tests,
  - steering composition tests (range + orbit + separation),
  - replay determinism regression tests for movement,
  - renderer frame update tests for facing/motion coherence.

# Risks / open points
- Added movement state may increase replay payload or frame-building complexity.
- Over-tuned separation/orbit can look jittery if damping is not balanced.
- Need to guard against oscillation near preferred range boundaries.
- May require a follow-up pass to tune enemy behavior separately from heroes.

# Backlog
- `logics/backlog/item_186_req056_define_dungeon_combat_movement_state_and_snapshot_contract.md`
- `logics/backlog/item_187_req056_implement_top_down_steering_approach_orbit_and_separation.md`
- `logics/backlog/item_188_req056_integrate_renderer_facing_strafe_and_motion_phase_feedback.md`
- `logics/backlog/item_189_req056_add_movement_determinism_performance_and_regression_coverage.md`
