## item_202_req060_render_away_duration_context_in_startup_splash - req060 render away-duration context in the startup splash
> From version: 0.9.38
> Understanding: 97%
> Confidence: 93%
> Progress: 100%
> Complexity: Low
> Theme: UI / UX
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Even if the runtime exposes away-duration metadata, the startup splash still needs a clear and well-positioned presentation so players immediately understand why catch-up is happening without confusing that context with live progress details.

# Scope
- In:
- Render a dedicated away-duration line in the startup splash.
- Position it below the main status text and above the progress bar.
- Format the duration in a concise human-readable way aligned with existing offline recap language.
- Keep visual hierarchy secondary to the main progress message and bar.
- Hide the line when no meaningful away-duration context exists.
- Out:
- No broader startup splash redesign.
- No new telemetry/debug copy beyond the away-duration line.

# Acceptance criteria
- The splash displays away duration between the status text and the progress bar.
- The string is compact and readable across short and long durations.
- The line stays visually distinct from progress percentage and processing detail.
- The line is not shown when startup has no meaningful away context.

# Priority
- Impact: Medium
- Urgency: Medium

# Notes
- Derived from `logics/request/req_060_show_away_duration_on_startup_loading_screen.md`.
- Planned delivery via `logics/tasks/task_109_execute_req060_startup_away_duration_display_across_backlog_items_201_to_203.md`.
- Depends on:
  - `logics/backlog/item_201_req060_add_away_duration_metadata_to_startup_bootstrap_state.md`
- Likely touch points:
  - `src/app/components/StartupSplashScreen.tsx`
  - `src/app/AppContainer.tsx`
  - `src/app/styles/startup.css`
  - `tests/app/startupSplashScreen.test.tsx`
