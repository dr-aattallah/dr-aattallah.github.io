# The Educator

The Educator is now organized as a modular academic platform. Runtime systems are separated so courses, attendance, classroom tools and future practice features can evolve without mixing their files.

## Structure

```text
the-educator/
├── index.html                    # platform home
├── learning/                     # learning-content subsystem
│   ├── index.html
│   └── courses/
│       └── cpcs351/
├── attendance/                   # attendance subsystem + its css/js/sql/docs/tests
├── classroom/                    # LMS/course-management prototype + local assets
├── practice/                     # reserved Practice Lab namespace
├── assets/                       # shared/compatibility platform assets
├── docs/
│   ├── ARCHITECTURE.md
│   ├── backend/
│   └── project-management/
├── infrastructure/
│   ├── backend/
│   ├── scripts/
│   └── tests/
├── login.html                    # compatibility redirect
└── help.html                     # compatibility redirect
```

## Stable runtime URLs
- Platform: `/the-educator/`
- Learning: `/the-educator/learning/`
- CPCS 351: `/the-educator/learning/courses/cpcs351/`
- Attendance: `/the-educator/attendance/`
- Classroom: `/the-educator/classroom/`
- Practice Lab: `/the-educator/practice/`

## Development rule
Do not add new system pages to the project root. Put each feature in the subsystem that owns it. Create a new top-level subsystem only when the feature has an independent purpose, navigation flow, or resource set.

See `docs/ARCHITECTURE.md` for the detailed rules.