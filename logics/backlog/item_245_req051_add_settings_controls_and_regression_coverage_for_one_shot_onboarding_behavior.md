## item_245_req051_add_settings_controls_and_regression_coverage_for_one_shot_onboarding_behavior - req051 add Settings controls and regression coverage for one-shot onboarding behavior
> From version: 0.9.40
> Status: Done
> Understanding: 100%
> Confidence: 100%
> Progress: 100%
> Complexity: Medium
> Theme: Settings / Testing / UX reliability
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The onboarding system is only acceptable if players stay in control and the one-shot guarantees hold over time. The project therefore needs Settings controls and targeted regression coverage.

# Scope
- In:
- Add Settings controls for:
  - onboarding enabled/disabled,
  - reset onboarding progress.
- Add regression coverage for:
  - save round-trip persistence,
  - intro first-run behavior,
  - skip/disable/reset behavior,
  - one-shot per-screen triggering,
  - one-surface-at-a-time guarantees.
- Out:
- No analytics or telemetry instrumentation.

# Acceptance criteria
- Players can disable onboarding and reset it from Settings.
- Onboarding behavior remains stable across relaunch and save transfer.
- Tests catch repeated-prompt regressions and orchestration mistakes.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_051_one_time_onboarding_modals_first_minutes_and_per_screen_guidance.md`.
- Likely touch points:
  - `src/app/components/SystemModal.tsx`
  - `tests/app/*`
  - `tests/core/serialization.test.ts`
  - `tests/adapters/persistence/saveMigrations.test.ts`
