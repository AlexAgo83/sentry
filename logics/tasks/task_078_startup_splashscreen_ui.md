## task_078_startup_splashscreen_ui - Add startup splashscreen UI
> From version: 0.9.10
> Owner: —
> Status: Done
> Non-semantic edit: Add the missing legacy closure checklist for operator cleanup 2026-11-12.
> Understanding: 95%
> Confidence: 93%
> Progress: 100%

# Summary
Create a minimal splashscreen with a gated Continue button on launch.

# Dependencies
- item_092_startup_splashscreen_ui
- task_077_startup_splashscreen_state

# Steps
1. Add a full-screen splash view with a title and `Continue` button.
2. Show `Loading...` until ready, then switch to `Ready`.
3. Disable the button until readiness is true.
4. Hide the splash after the user clicks `Continue`.

# Decisions
- Splash shown on every launch.
- No auto-continue.
- Minimal UI (no progress bar).

# Acceptance criteria
- Splashscreen appears on startup and blocks the main UI.
- Button only enables when ready.
- App proceeds only after user clicks `Continue`.

# Definition of Done (DoD)
- [x] Historical `Done` status retained; no further work is planned (operator decision 2026-11-12).

Legacy metadata migration only: this records the existing terminal state, not a retrospective assessment of delivery criteria. Original scope, validation evidence, and completion reports remain authoritative.
