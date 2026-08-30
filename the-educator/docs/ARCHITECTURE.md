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

## Naming rule
Runtime directories use lowercase kebab-case only. Course topic directories keep the numeric prefix followed by a stable slug, for example `05-software-requirements-elicitation`. Display titles remain human-readable inside HTML and data files; URLs should not contain spaces or mixed case.

## Link rule
Within a subsystem, relative links are preferred when files move together. Cross-subsystem navigation should use stable paths rooted at `/the-educator/` so moving internal folders does not break other systems.

## Asset ownership
Subsystem-specific assets belong to their subsystem. During migration, `/the-educator/assets/` contains compatibility mirrors of some Classroom assets because older shared pages and other subsystems still reference the stable root asset URLs. The Classroom copy is the subsystem-owned source; the root copy is a compatibility bridge and must not be edited independently. Once all consumers are migrated to explicit shared assets, the mirror can be removed in one controlled change.

## Compatibility
`/the-educator/login.html`, `/the-educator/help.html`, and `/the-educator/reset-password.html` are tiny redirect shims retained because existing navigation and Attendance flows refer to those stable entry points. They route to the Classroom subsystem and keep older links working during migration.

## Integrity checks
The branch runs two automated checks on every relevant push:
1. static link audit — verifies local HTML/CSS/JS references and rejects legacy subsystem paths;
2. architecture audit — checks runtime namespaces, topic directory naming, empty placeholders, and compatibility asset mirrors.

## Migration safety
The restructuring is performed on the `restructure-the-educator-systems` branch. `main` remains unchanged until verification and explicit approval to merge.
