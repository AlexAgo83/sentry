## req_060_show_away_duration_on_startup_loading_screen - Show away duration on the startup loading screen
> From version: 0.9.38
> Understanding: 98%
> Confidence: 95%
> Complexity: Low
> Theme: UX / Startup
> Reminder: Update Understanding/Confidence and dependencies/references when you edit this doc.
> Status: Done

# Needs
- The startup loading screen should explain why offline catch-up is happening.
- Players should see how long they have been away since the last simulated save state.
- The new information should be positioned clearly without competing with progress updates.

# Context
- The startup loading screen already shows:
  - title,
  - static status message,
  - progress bar,
  - progress/stage label,
  - optional processing detail line.
- During offline catch-up, the runtime already knows the elapsed duration between the last saved tick/hidden timestamp and the current bootstrap time.
- Today that “time away” context is only visible later in the offline recap modal, not during the loading phase itself.
- This can make the loading screen feel opaque, especially when the app is replaying a large amount of offline time.

# Goals
- Show the elapsed away duration directly on the loading screen while offline catch-up is being prepared or processed.
- Keep the information easy to understand and visually secondary to the main progress indicator.
- Reuse existing bootstrap state/data where possible instead of recomputing the same concept in the UI.

# Non-goals
- Redesigning the startup loading screen.
- Changing recap semantics or recap content after bootstrap completes.
- Adding multiple new analytics/telemetry lines to the loading screen.
- Localizing all startup strings as part of this request.

# Locked decisions (v1)
## Content
- The loading screen should show a concise away-duration label such as:
  - `Away for 5h 12m`
  - or equivalent final copy chosen during implementation.
- The value should reflect the elapsed duration being considered for startup catch-up, not the processed duration.

## Placement
- The away-duration line should appear below the main status text and above the progress bar.
- It should be presented as contextual information, not as the main progress/detail line.

## Visibility rules
- Show the away-duration line only when startup bootstrap has a meaningful offline catch-up context.
- It may remain hidden when there is no startup catch-up or the away duration is negligible.

# Scope detail (draft)
## Bootstrap state/data
- Ensure the UI can access the away duration for the current startup bootstrap.
- Reuse existing bootstrap metadata if sufficient; otherwise extend the startup bootstrap contract minimally.

## UI
- Add a dedicated text line to the startup loading surface for away duration.
- Keep spacing and typographic hierarchy aligned with the current splash layout.
- Avoid conflating away duration with:
  - progress percentage,
  - processed tick counts,
  - processed/capped duration details.

## Formatting
- Format the duration in a compact human-readable form consistent with the app’s offline recap language.
- Handle short and long durations cleanly (seconds, minutes, hours, optionally days if needed).

# Technical references likely impacted
- `src/core/runtime.ts`
- `src/core/types.ts`
- `src/core/state.ts`
- `src/core/reducer.ts`
- `src/app/components/StartupSplashScreen.tsx`
- `src/app/AppContainer.tsx`
- `src/app/styles/startup.css`
- `tests/core/runtime.test.ts`
- `tests/app/startupSplashScreen.test.tsx`

# Acceptance criteria
- The startup loading screen shows the elapsed away duration when offline catch-up is relevant.
- The away-duration line is positioned between the main status message and the progress bar.
- The value is human-readable and stable during a single bootstrap run.
- No away-duration line is shown when startup has no meaningful offline catch-up context.
- Existing startup progress behavior remains unchanged.

# Test expectations
- Mandatory validation:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run typecheck:tests`
  - `npm run test:ci`
- Expected additions:
  - startup splash test for away-duration rendering,
  - startup splash test for hidden state when no catch-up is needed,
  - runtime/bootstrap state test if new metadata is added.

# Risks / open points
- The UI must distinguish clearly between “time away” and “time processed” if catch-up is capped.
- Formatting should stay concise enough not to crowd small/mobile layouts.
- If req059 later generalizes the loading surface across multiple origins, this away-duration line should remain specific to catch-up-aware flows.

# Backlog
- `logics/backlog/item_201_req060_add_away_duration_metadata_to_startup_bootstrap_state.md`
- `logics/backlog/item_202_req060_render_away_duration_context_in_startup_splash.md`
- `logics/backlog/item_203_req060_add_regression_coverage_for_startup_away_duration_display.md`
