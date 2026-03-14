## item_217_req065_add_difficulty_band_evaluation_and_tuning_friendly_report_outputs - req065 add difficulty-band evaluation and tuning-friendly report outputs
> From version: 0.9.39
> Status: Done
> Understanding: 100%
> Confidence: 96%
> Progress: 100%
> Complexity: Medium
> Theme: Balance / Reporting / Tuning
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Raw simulator outputs are not enough if they do not clearly indicate whether a dungeon sits in the intended part of the curve. The tool needs to translate outcomes into reviewable difficulty-band assessments and diff-friendly reports that can guide tuning work.

# Scope
- In:
- Add evaluation logic that maps simulation outcomes to intended difficulty bands.
- Produce reports that are practical for tuning, such as:
  - concise console summaries,
  - JSON for comparison,
  - optionally Markdown/CSV if the implementation warrants it.
- Make output easy to compare before and after dungeon tuning changes.
- Out:
- No automatic balancing of dungeon values.
- No broad CI enforcement in this item.

# Acceptance criteria
- Simulator output clearly communicates how each dungeon performs relative to the target difficulty bands.
- The report format is stable enough to support before/after tuning comparisons.
- The output helps identify walls, inversions, or unexpectedly safe/unsafe dungeons.

# Priority
- Impact: High
- Urgency: Medium

# Notes
- Derived from `logics/request/req_065_add_an_internal_dungeon_balance_simulator_for_difficulty_diagnostics_and_tuning.md`.
- Likely touch points:
  - `src/core/dungeonBalance.ts`
  - `scripts/*`
  - `tests/*balance*`
