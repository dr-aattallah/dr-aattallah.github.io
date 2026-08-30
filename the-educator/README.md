# The Educator

The Educator is organized as a small platform made of independent subsystems. The repository is intentionally structured so new teaching tools can be added without mixing their pages, assets or experiments.

## Runtime structure

```text
the-educator/
├── index.html                     # platform home
├── systems/
│   ├── index.html                 # system directory
│   ├── learning/
│   │   ├── index.html
│   │   └── courses/               # CPCS 351 and future courses
│   ├── attendance/                # complete attendance subsystem
│   ├── classroom/                 # LMS/course-management prototype
│   └── practice/                  # reserved for Practice Lab pilot
├── docs/
│   ├── ARCHITECTURE.md
│   ├── backend/
│   └── project-management/
└── infrastructure/
    ├── backend/
    ├── scripts/
    └── tests/
```

## Ownership rule
A subsystem owns its HTML, CSS, JavaScript, images, data and internal docs. Do not place new subsystem files in the project root.

## Stable URLs
- Learning: `/the-educator/systems/learning/`
- CPCS 351: `/the-educator/systems/learning/courses/cpcs351/`
- Attendance: `/the-educator/systems/attendance/`
- Classroom prototype: `/the-educator/systems/classroom/`
- Practice Lab: `/the-educator/systems/practice/`

See `docs/ARCHITECTURE.md` for expansion rules.