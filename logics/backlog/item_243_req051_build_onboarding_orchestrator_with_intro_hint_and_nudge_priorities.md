## item_243_req051_build_onboarding_orchestrator_with_intro_hint_and_nudge_priorities - req051 build onboarding orchestrator with intro, hint, and nudge priorities
> From version: 0.9.40
> Status: Done
> Understanding: 100%
> Confidence: 100%
> Progress: 100%
> Complexity: High
> Theme: UX orchestration / State flow
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The request is not just “show some popups”. The app needs a single orchestrator that decides what guidance appears, in what order, and when to stay silent. Without that priority model, onboarding would become spammy and inconsistent.

# Scope
- In:
- Build the onboarding orchestration layer.
- Define priority rules for:
  - short intro flow,
  - one-shot per-screen hints,
  - conditional nudges.
- Enforce:
  - only one onboarding surface at a time,
  - no interruption during inappropriate moments,
  - no repeated prompts after completion/dismissal.
- Out:
- No final visual polish for every surface.
- No Settings controls in this item.

# Acceptance criteria
- The app can compute the next onboarding surface from app state and navigation context.
- Intro flow is prioritized first, then contextual hints, then nudges.
- The orchestrator prevents duplicate or simultaneous onboarding surfaces.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_051_one_time_onboarding_modals_first_minutes_and_per_screen_guidance.md`.
- Likely touch points:
  - `src/app/AppContainer.tsx`
  - `src/app/containers/AppModalsContainer.tsx`
  - dedicated onboarding orchestration hook/helper
