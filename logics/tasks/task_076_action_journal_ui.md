## task_076_action_journal_ui - Display the action journal
> From version: 0.9.10
> Owner: —
> Status: Done
> Non-semantic edit: Add the missing legacy closure checklist for operator cleanup 2026-11-12.
> Understanding: 94%
> Confidence: 92%
> Progress: 100%

# Summary
Expose the last 10 action entries in the System/Settings area.

# Dependencies
- item_090_action_journal_ui
- task_075_action_journal_state

# Steps
1. Add a compact list UI in the System/Settings area.
2. Render newest entries first with relative time.
3. Keep entries on a single line where possible.
4. Style the list consistently with existing info lists.

# Decisions
- Location: System/Settings area.
- Show newest entries first.
- Display relative time only.

# Acceptance criteria
- The list shows the last 10 entries.
- Entries update live as new actions occur.
- Layout is readable on desktop and mobile.

# Definition of Done (DoD)
- [x] Historical `Done` status retained; no further work is planned (operator decision 2026-11-12).

Legacy metadata migration only: this records the existing terminal state, not a retrospective assessment of delivery criteria. Original scope, validation evidence, and completion reports remain authoritative.
