# The Educator repository architecture

## Rule
Each subsystem owns its pages, scripts, styles, media, data and subsystem-specific documentation. Cross-system navigation should use stable URLs rooted at `/the-educator/` rather than fragile deep relative paths when a file is touched in future work.

## Runtime namespaces
- `/the-educator/` — platform entry point only.
- `/the-educator/systems/learning/` — teaching content and course spaces.
- `/the-educator/systems/attendance/` — attendance system.
- `/the-educator/systems/classroom/` — course-management/LMS prototype.
- `/the-educator/systems/practice/` — lightweight interactive practice; reserved before pilot publication.

## Non-runtime namespaces
- `/the-educator/docs/` — architecture, standards and project records.
- `/the-educator/infrastructure/` — backend experiments, Supabase functions, tests and operational scripts.

## Expansion rule
A new independent system must be created as `/the-educator/systems/<system-name>/` and must keep its own `assets/`, `data/`, `docs/` and tests when applicable. Shared resources should only be promoted to `/the-educator/shared/` after at least two systems genuinely depend on them.

## Migration note
This restructuring is intentionally performed on a dedicated branch. The old main branch remains the rollback point until link verification is complete.