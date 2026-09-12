# CPCS 351 Lab Practice

This folder is an independent practice module for The Educator.

## Architectural rule

Lab behavior must not be added to `study.js` or duplicated inside topic lesson pages. Topic pages may eventually link to the lab, but the lab owns its own UI, engine, state and activity data.

## Structure

- `index.html` — thin lab entry page; composes the engine and selected mission.
- `lab.css` — lab-only presentation layer.
- `core/lab-engine.js` — reusable activity rendering, evaluation, feedback and diagnostic summary.
- `data/topic01.js` — Topic 01 mission/activity definitions only; no UI code.

## Data flow

`Mission data → LabEngine → Student interaction → Evaluation → Why feedback → Engineering consequence → Readiness summary`

## Current pilot

**Mission 01 — From Idea to Engineered Software**

Topic 01 stages:
1. Software Reality
2. The Management Decision
3. The Project Grows
4. Team Trouble
5. Engineering Control Room
6. Build the Lifecycle
7. Where Is the Evidence?
8. Final Engineering Review

## Design constraints

- Mobile-first and keyboard-accessible.
- No drag-and-drop dependency; accessible select/click controls are the baseline.
- Feedback explains reasoning, not just correct/incorrect.
- Missions diagnose concepts/skills, not only a total score.
- New topics should add data modules rather than fork the engine.
- Shared course navigation remains owned by the course site; lab logic remains owned here.
