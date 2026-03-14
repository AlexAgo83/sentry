## req_066_add_long_term_meta_progression_and_return_drivers_across_sessions - Add long-term meta progression and return drivers across sessions
> From version: 0.9.39
> Understanding: 95%
> Confidence: 93%
> Complexity: High
> Theme: Product / Progression / Retention
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.
> Status: Ready

# Needs
- The game loop is increasingly solid at the moment-to-moment level, but it still needs stronger reasons for players to return across multiple sessions.
- Current progression can feel too focused on immediate efficiency rather than medium- or long-term goals.
- The project needs a meta progression layer that gives the player clearer milestones, aspiration, and a stronger sense of account-wide or roster-wide advancement.

# Context
- Recent work improved local clarity and runtime safety:
  - startup/import/bootstrap flows,
  - reward scaling,
  - contextual action/dungeon UX,
  - stronger CI/test governance.
- Those improvements make the game more stable and readable, but they do not by themselves create enough longer-horizon motivation.
- The next product step should not only ask “what is the best action now?” but also “what am I building toward over the next few sessions?”

# Goals
- Introduce longer-term progression goals that create a meaningful return loop across sessions.
- Give players visible milestones that feel like real advancement rather than only marginal throughput increases.
- Build a meta layer that reinforces, rather than replaces, the existing hero/action/dungeon systems.
- Improve retention by adding medium-horizon objectives with clear payoff.

# Non-goals
- Adding a full live-service seasons system in v1.
- Replacing the existing hero progression model.
- Adding shallow chores or checklist grind that do not open real decisions or rewards.
- Reworking every progression system at once.

# Locked decisions (v1)
## Milestones first
- v1 should focus on milestone-based meta progression before more complex recurring systems.
- The design should prioritize clear long-term goals over “busywork”.

## Build on existing systems
- Meta progression should leverage existing hero, dungeon, inventory, and progression systems rather than creating a detached parallel game.
- The best results will come from connecting milestones to systems the player already understands.

## Prefer roster/account-wide progression in v1
- The first meta progression layer should be mostly roster-wide or account-wide rather than heavily hero-specific.
- This should create a stronger sense of global advancement across sessions.

## Reward meaning over volume
- Meta rewards should unlock meaningful value:
  - new access,
  - better strategic options,
  - clear permanent progress,
  - account/roster-wide utility,
  - limited comfort or power gains where appropriate.
- Avoid flooding the player with tiny passive bonuses that are hard to notice.
- Avoid relying too heavily on broad raw multiplicative power bonuses in v1.

# Scope detail (draft)
## Candidate progression layers
- Progression milestones tied to:
  - dungeon clears,
  - weapon/gear tiers,
  - roster development,
  - skill mastery,
  - collection/discovery goals.
- Optional milestone categories may include:
  - progression track,
  - mastery track,
  - discovery/collection track.
- v1 should prefer milestone structures that are directed and legible over highly open-ended systems.

## Reward directions
- Candidate meta rewards may include:
  - unlocks,
  - stronger optional choices,
  - roster-wide passive utility,
  - access to harder or more rewarding content,
  - prestige-style progression markers if justified later.
- In v1, unlocks, strategic options, and meaningful utility should be prioritized over passive numeric inflation.

## UX expectations
- Meta progression should be understandable without requiring a separate “system wiki”.
- Players should be able to answer:
  - what goal am I progressing toward,
  - why does it matter,
  - what unlocks or improves when I reach it.

# Product/architecture constraints
- Meta progression should reuse current save/runtime architecture cleanly.
- It should not introduce opaque cross-system coupling that is hard to test or migrate.
- Unlocks and milestone state must remain deterministic and serializable.

# Technical references likely impacted
- `src/core/*`
- `src/data/*`
- `src/app/components/*`
- `src/app/selectors/*`
- `tests/*`

# Acceptance criteria
- A concrete meta progression direction exists that creates meaningful longer-term return goals.
- The design builds on existing systems rather than fragmenting progression across disconnected layers.
- Follow-up backlog work can decompose this into milestone state, reward contracts, UI surfaces, and regression coverage.

# Test expectations
- Follow-up execution should expect:
  - progression state tests,
  - migration/serialization coverage if new persistent state is added,
  - app tests for milestone visibility and reward communication.

# Risks / open points
- Meta progression can become grindy if it adds obligation without meaningful payoff.
- Too many tracks at once could dilute the main game loop.
- Rewards must feel strong enough to matter without invalidating core progression.

# Follow-up candidates
- milestone state and persistence
- milestone reward contract design
- meta progression UI surfaces
- progression and migration coverage

# Backlog
- `logics/backlog/item_219_req066_define_meta_progression_state_milestone_taxonomy_and_reward_contracts.md`
- `logics/backlog/item_220_req066_wire_meta_progression_evaluation_unlock_lifecycle_and_persistence.md`
- `logics/backlog/item_221_req066_ship_initial_meta_progression_ui_and_goal_communication_surfaces.md`
- `logics/backlog/item_222_req066_add_meta_progression_serialization_migration_and_regression_coverage.md`
