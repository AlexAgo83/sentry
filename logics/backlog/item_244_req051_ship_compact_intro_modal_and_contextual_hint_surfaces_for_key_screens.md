## item_244_req051_ship_compact_intro_modal_and_contextual_hint_surfaces_for_key_screens - req051 ship compact intro modal and contextual hint surfaces for key screens
> From version: 0.9.40
> Status: Done
> Understanding: 100%
> Confidence: 100%
> Progress: 100%
> Complexity: High
> Theme: UX / UI / Onboarding
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The onboarding request needs player-visible surfaces, but a modal-heavy implementation would be intrusive. The first shipped UI should keep the intro short and use lighter contextual guidance for ongoing help.

# Scope
- In:
- Ship the player-facing onboarding surfaces for v1:
  - compact first-minutes intro modal(s),
  - one-shot contextual hints for key screens,
  - limited conditional nudge surfaces for obvious blockers.
- Cover the primary key screens:
  - `Hero / Action`
  - `Inventory / Equipment`
  - `Dungeon`
  - `Shop`
  - `Quests`
- Keep cloud-save guidance optional and backend-aware.
- Out:
- No heavy spotlight/spot-tour system.
- No large scripted tutorial chain.

# Acceptance criteria
- New players receive a short intro flow that helps them reach their first action quickly.
- Key screens can show one-shot hints without modal overload.
- Conditional nudges remain limited and useful rather than noisy.
- The UI remains aligned with the existing game style and tooltip/accessibility conventions.

# Priority
- Impact: High
- Urgency: High

# Notes
- Derived from `logics/request/req_051_one_time_onboarding_modals_first_minutes_and_per_screen_guidance.md`.
- Likely touch points:
  - onboarding modal/hint components
  - `src/app/components/*`
  - `src/app/containers/*`
  - shared styles
