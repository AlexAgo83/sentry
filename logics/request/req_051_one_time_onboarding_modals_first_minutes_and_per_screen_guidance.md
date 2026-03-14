## req_051_one_time_onboarding_modals_first_minutes_and_per_screen_guidance - Add one-time onboarding modals for first minutes and per-screen guidance
> From version: 0.9.40
> Status: Ready
> Understanding: 98%
> Confidence: 95%
> Complexity: High
> Theme: UX / Onboarding
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.

# Needs
- Improve onboarding with a lightweight one-time guidance system that helps the player:
  - during the first minutes after installing/starting the app,
  - and when entering key screens for the first time.
- Onboarding must be **single-use** by default:
  - once a step is completed/dismissed, it should not appear again automatically.
- Players must be able to:
  - skip onboarding,
  - disable future prompts,
  - optionally reset onboarding (so they can re-see tips).

# Context
- The game has multiple screens/panels (actions, roster, inventory, dungeon preparation, etc.).
- New players may not discover important flows (selecting first action, recipes, where to find inventory/equipment, how dungeon prep works, cloud save benefits).
- The app already has a modal system and persistent save/migration pipeline.

# Goals
- Increase early retention by helping players reach “first fun” quickly:
  - create/select first hero,
  - start first actions,
  - understand inventory and equipment,
  - understand dungeon prep and first dungeon entry (when relevant).
- Make onboarding non-annoying:
  - no repeated popups once dismissed,
  - no prompt spam,
  - no prompts while the backend is offline/warming (if any onboarding step depends on cloud),
  - no interruptive tutorial modal during active high-attention gameplay flows.
- Keep onboarding maintainable:
  - intro steps and hints are declarative and versionable,
  - can add new steps in future versions without breaking existing saves.

# Non-goals
- A fully animated/tutorialized overlay system with spotlight positioning.
- Translating all onboarding copy to multiple languages unless i18n infra exists.
- Telemetry/analytics pipeline for onboarding (optional later).
- A long scripted tutorial chain that blocks exploration.

# Locked decisions (v1)
## Guidance model
- v1 uses three layers:
  - a very short `first minutes` intro flow,
  - per-screen one-shot contextual hints,
  - conditional nudges for obvious player blockers.
- Do not rely on “many modals everywhere”.
- The preferred UX is:
  - modal for the short intro sequence,
  - lightweight anchored hint / coachmark / inline callout for per-screen guidance,
  - only one visible guidance surface at a time.

## One-time step registry
- Onboarding guidance steps are keyed by stable IDs.
- State is persisted in the save payload so behavior survives relaunch, export/import, and cloud sync.
- The onboarding state must be versionable:
  - use a `schemaVersion` or equivalent migration-safe structure.
- Track at least:
  - onboarding globally enabled/disabled,
  - steps already shown,
  - steps completed/dismissed,
  - whether the intro flow is finished.

## Player control
- The intro flow must support:
  - `Next` / `Got it`,
  - `Skip`,
  - `Don't show again`.
- Contextual hints must support:
  - dismiss / got it,
  - global disable fallback through Settings.
- Settings must expose:
  - toggle: onboarding enabled/disabled,
  - action: reset onboarding progress.

## Triggering rules
- “First minutes” onboarding starts after initial app ready (post-hydration) and must not block core rendering.
- Per-screen hints should trigger:
  - on first navigation to that screen,
  - only if onboarding is enabled and the hint has not already been completed/dismissed.
- Conditional nudges should trigger only when the player appears blocked or inactive in a meaningful way.
- Never show more than one onboarding surface at the same time.

# Suggested onboarding content (draft)
## First minutes intro flow (example)
1. Welcome / main goal: “Start your first action.”
2. Hero/action basics: select a hero, pick a skill, choose a recipe.
3. Short payoff framing: items, quests, and dungeon progression come next.

## Per-screen one-shot hints (example)
- Action / Hero: how to start the first action and interpret recipe choice.
- Inventory / Equipment: where gear appears and why equipping matters.
- Dungeon: requirement for 4 available heroes and the meaning of basic prep/reward info.
- Shop: roster slots, account-level progression, and key long-term upgrades.
- Quests: where milestones and progression goals live.

## Conditional nudges (example)
- If no hero has started an action after the first intro: nudge `Start your first action`.
- If the player opens dungeon before it is realistically usable: non-blocking helper.
- If useful new equipment is available but never inspected: inventory/equipment nudge.
- Cloud save hint remains optional and only when backend availability makes it relevant.

# Scope detail (v1)
## Data model
- Add a persisted onboarding state structure:
  - `enabled: boolean`
  - `introCompleted: boolean`
  - `shownStepIds: Record<string, true>`
  - `completedStepIds: Record<string, true>`
  - `dismissedStepIds: Record<string, true>`
  - `schemaVersion?: number`

## Orchestration
- Add an onboarding orchestrator that can:
  - compute the next intro step or hint given current app state/screen,
  - open the correct guidance surface,
  - mark steps completed,
  - handle skip/disable/reset.
- The orchestrator should prioritize:
  - intro flow first,
  - then one-shot per-screen hints,
  - then conditional nudges.

## UI
- Add reusable onboarding UI surfaces consistent with the existing system style:
  - compact intro modal(s)
  - lightweight per-screen hint component(s)
- Prefer anchored or inline guidance for screen-specific help instead of full modal interruption.
- Ensure all onboarding controls have `title`/`aria-label` per tooltip conventions.

## Warmup/offline constraints
- Steps that require backend (e.g. cloud save suggestion) must only show if backend is confirmed online.
- Warmup/offline should never cause onboarding to loop/spam.

## Testing
- Add tests covering:
  - onboarding state persistence via save round-trip,
  - intro flow triggers (first run vs subsequent runs),
  - skip/disable/reset behavior,
  - per-screen step triggers not firing repeatedly,
  - “only one guidance surface at a time” behavior.

# Technical references to update (expected)
- `src/app/AppContainer.tsx` / modal orchestrator container
- `src/app/containers/AppModalsContainer.tsx`
- `src/core/types.ts` / `src/core/state.ts` / `src/core/serialization.ts`
- `src/adapters/persistence/saveMigrations.ts`
- `src/app/components/SystemModal.tsx` (settings toggle/reset)
- `tests/app/*`
- `tests/core/serialization.test.ts`
- `tests/adapters/persistence/saveMigrations.test.ts`

# Acceptance criteria
- First run shows a short guided onboarding flow to reach first actions quickly.
- Entering key screens triggers one-shot guidance the first time only.
- The implementation does not devolve into repeated blocking modals across normal play.
- Onboarding can be skipped, disabled, and reset from settings.
- Onboarding completion state persists through relaunch and save transfers.
- Tests prevent regressions on one-shot behavior and persistence.

# Test expectations
- Mandatory validation:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run typecheck:tests`
  - `npm run test:ci`
- Recommended:
  - `npm run coverage:ci`
  - `npm run build`

# Risks / open points
- Persisting onboarding state in cloud-synced saves means onboarding completion syncs across devices (usually desired).
- Adding many steps can annoy players; keep v1 small and high-impact.
- If anchored hints are introduced, target resolution/fallback behavior must stay robust on mobile and responsive layouts.

# Backlog
- `logics/backlog/item_242_req051_define_persisted_onboarding_state_and_migration_contract.md`
- `logics/backlog/item_243_req051_build_onboarding_orchestrator_with_intro_hint_and_nudge_priorities.md`
- `logics/backlog/item_244_req051_ship_compact_intro_modal_and_contextual_hint_surfaces_for_key_screens.md`
- `logics/backlog/item_245_req051_add_settings_controls_and_regression_coverage_for_one_shot_onboarding_behavior.md`

# Task
- `logics/tasks/task_120_execute_req051_one_time_onboarding_across_backlog_items_242_to_245.md`
