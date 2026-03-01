## item_192_req057_ship_startup_progress_ui_and_non_blocking_app_shell_behavior - req057 ship startup progress UI and non-blocking app shell behavior
> From version: 0.9.38
> Understanding: 95%
> Confidence: 91%
> Progress: 0%
> Complexity: Medium
> Theme: UI / UX
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The startup splash currently shows a static status and disabled continue control while startup work runs. Users cannot see meaningful loading progression and perceive startup as blocked.

# Scope
- In:
- Bind startup splash UI to the new bootstrap progress contract.
- Show stage-aware loading feedback (label + progress value/bar + optional detail text).
- Keep startup presentation responsive throughout bootstrap processing.
- Keep accessibility semantics updated (`aria-live`/status announcement for progress/stage changes).
- Align app-shell gating with startup phases (`appReady` + bootstrap completion rules).
- Out:
- No broad visual redesign outside startup loading surface.
- No changes to cloud login prompt behavior unrelated to startup loading progress.

# Acceptance criteria
- Startup screen visibly advances through progress and stages during long bootstrap paths.
- Continue control behavior is consistent with readiness policy and does not regress current gating safety.
- Startup UI remains responsive and accessible while background/bootstrap work advances.
- No regressions in existing startup modal test paths after adapting expectations.

# Priority
- Impact: High
- Urgency: Medium

# Notes
- Derived from `logics/request/req_057_make_startup_loading_non_blocking_with_visible_progress_and_background_processing.md`.
- Implemented via `logics/tasks/task_106_execute_req057_non_blocking_startup_loading_across_backlog_items_190_to_193.md`.
- Depends on:
  - `logics/backlog/item_190_req057_define_startup_bootstrap_stage_and_progress_contract.md`
  - `logics/backlog/item_191_req057_offload_startup_offline_catch_up_and_heavy_boot_work_off_main_thread.md`
- Likely touch points:
  - `src/app/components/StartupSplashScreen.tsx`
  - `src/app/AppContainer.tsx`
  - `src/app/styles/startup.css`
  - `tests/app/startupSplashScreen.test.tsx`
  - `tests/app/App.test.tsx`
