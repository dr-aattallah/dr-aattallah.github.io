# The Educator repository architecture

## Architectural rule
The project root is a platform shell. Every independent runtime subsystem receives a stable top-level namespace under `/the-educator/<system>/` and owns its pages and system-specific resources. This keeps URLs short, avoids fragile extra nesting, and allows each system to evolve independently.

## Runtime namespaces
- `/the-educator/` — platform home only.
- `/the-educator/learning/` — teaching content and course spaces.
- `/the-educator/attendance/` — attendance system.
- `/the-educator/classroom/` — course-management/LMS prototype.
- `/the-educator/practice/` — lightweight interactive practice; reserved before pilot publication.
- `/the-educator/assets/` — compatibility/shared platform assets used by more than one runtime area.

## Non-runtime namespaces
- `/the-educator/docs/` — architecture, standards and project records.
- `/the-educator/infrastructure/` — backend experiments, Supabase functions, tests and operational scripts.

## Expansion rule
A new independent system must be created as `/the-educator/<system-name>/`. It should keep its own `assets/`, `data/`, `docs/` and tests when those resources are system-specific. A resource belongs in root `/assets/` only when it is genuinely platform-wide or required as a compatibility bridge.

## Link rule
Within a subsystem, relative links are preferred when files move together. Cross-subsystem navigation should use stable paths rooted at `/the-educator/` so moving internal folders does not break other systems.

## Compatibility
`/the-educator/login.html` and `/the-educator/help.html` are tiny redirect shims retained because existing shared navigation refers to those stable entry points. They route to the Classroom subsystem and keep older links working during migration.

## Migration safety
The restructuring is performed on the `restructure-the-educator-systems` branch. `main` remains unchanged until verification and explicit approval to merge.