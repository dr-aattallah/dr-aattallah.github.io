# Static-To-App Migration Roadmap

This roadmap explains how **The Educator** can move from the current static HTML/CSS prototype into a real application using:

```text
Backend API: ASP.NET Core Web API
Database: Supabase PostgreSQL
Auth: Supabase Auth
Storage: Supabase Storage
Code hosting: GitHub
Future mobile/desktop client: .NET MAUI
```

This document is a planning artifact only. It does not introduce a backend, framework migration, package manager, build tooling, or runtime dependency.

---

## Guiding Strategy

The current static prototype should remain stable while the real app is built in small, controlled phases.

Recommended strategy:

1. Keep the current `the-educator/` static prototype live on GitHub Pages.
2. Create the real application in a separate future folder when implementation begins.
3. Build the ASP.NET Core API and Supabase schema around the smallest useful vertical slice.
4. Migrate UI screens only after the data and access model is stable.
5. Add .NET MAUI only after the web/API foundation is working.

---

## Proposed Future Repository Shape

When implementation begins, use a structure like this:

```text
the-educator/
├── README.md
├── docs/
│   ├── backend-readiness.md
│   ├── technical-direction.md
│   ├── database-schema.md
│   └── static-to-app-roadmap.md
├── prototype/
│   └── static-site/
├── src/
│   ├── Educator.Api/
│   ├── Educator.Application/
│   ├── Educator.Domain/
│   ├── Educator.Infrastructure/
│   └── Educator.Web/
├── tests/
│   ├── Educator.Api.Tests/
│   └── Educator.Application.Tests/
└── mobile/
    └── Educator.Maui/
```

For the current GitHub Pages setup, do not move files yet. This structure is for the future app phase.

---

## Phase 0: Preserve Static Prototype

Status: current phase.

Goals:

- Keep the static prototype available at `/the-educator/`.
- Preserve visual identity and navigation.
- Keep documentation up to date.
- Avoid accidental backend or framework changes.

Outputs:

- Static HTML/CSS prototype
- Shared CSS
- Standardized navigation
- Backend-readiness docs
- Technical direction docs
- Database schema docs

Do not do:

- Do not add ASP.NET Core yet.
- Do not add Supabase credentials.
- Do not add real authentication.
- Do not move the static prototype until a migration branch is planned.

---

## Phase 1: Backend Foundation

Goal:

Create the backend foundation without replacing the current prototype.

Future outputs:

- `Educator.Api` ASP.NET Core Web API project
- Environment configuration strategy
- Supabase PostgreSQL connection strategy
- Health check endpoint
- Basic API project structure
- API error response pattern
- API versioning decision

Suggested first endpoints:

```text
GET /health
GET /api/me
GET /api/courses
GET /api/courses/{courseId}
```

Key decisions:

- Use Supabase Auth JWT directly or validate tokens in ASP.NET Core.
- Use Entity Framework Core, Dapper, or Supabase client patterns.
- Decide where role authorization lives: API policies, PostgreSQL RLS, or both.

Do not do yet:

- Do not build assignment grading.
- Do not build notifications.
- Do not build MAUI.
- Do not migrate all screens at once.

---

## Phase 2: Supabase Project And First Schema

Goal:

Prepare the data platform for the first vertical slice.

Future outputs:

- Supabase project
- PostgreSQL tables for the first slice
- Auth configuration
- Storage bucket plan
- RLS policy draft
- Seed data for one instructor, one student, and one course

First tables:

```text
users
courses
enrollments
resources
file_objects
```

First storage buckets:

```text
course-resources
profile-images
```

Do not do yet:

- Do not add submissions or grades until course/resource access works.
- Do not make buckets public by default.
- Do not store secrets in GitHub.

---

## Phase 3: Course And Resource Vertical Slice

Goal:

Prove the core product loop:

1. Instructor signs in.
2. Instructor sees their courses.
3. Instructor opens one course.
4. Instructor creates a resource.
5. Student signs in.
6. Student sees the course only if enrolled.
7. Student opens visible resources.

Future API scope:

```text
GET    /api/courses
POST   /api/courses
GET    /api/courses/{courseId}
GET    /api/courses/{courseId}/resources
POST   /api/courses/{courseId}/resources
GET    /api/resources/{resourceId}
```

Future UI scope:

- Dashboard
- Instructor course workspace
- Add resource
- Resource detail
- Student course view

Success criteria:

- Instructor cannot edit courses they do not own.
- Student cannot see courses where they are not enrolled.
- Student cannot open hidden resources.
- File access follows course ownership/enrollment rules.

---

## Phase 4: Web App Migration

Goal:

Start moving prototype screens into the real web app.

Frontend decision required:

- Blazor if the project should stay primarily in C#.
- Next.js if the priority is a modern JavaScript/TypeScript frontend ecosystem.

Recommended migration order:

1. Shared layout and navigation
2. Login shell
3. Instructor dashboard
4. Instructor course workspace
5. Resource pages
6. Student course view

Preserve:

- Current light academic visual identity
- Warm ivory background
- Soft mint, sky, and amber accents
- Rounded cards
- Simple academic wording

Do not do:

- Do not rebuild every page before the first data-backed flow works.
- Do not change the product language dramatically.

---

## Phase 5: Assignments And Submissions

Goal:

Add the second core academic workflow.

Future tables:

```text
assignments
rubric_items
submissions
```

Future API scope:

```text
GET  /api/courses/{courseId}/assignments
POST /api/courses/{courseId}/assignments
GET  /api/assignments/{assignmentId}
POST /api/assignments/{assignmentId}/submissions
GET  /api/assignments/{assignmentId}/submissions
```

Future UI scope:

- Create assignment
- Student assignment detail
- Submission upload
- Instructor submissions review

---

## Phase 6: Grades, Announcements, Notifications

Goal:

Add the course management layer after resources and submissions are stable.

Future tables:

```text
grades
announcements
notifications
user_preferences
```

Future UI scope:

- Gradebook
- My grades
- Create announcement
- Notifications center
- Profile preferences

Important rule:

Students should only see released grades and their own feedback.

---

## Phase 7: .NET MAUI Client

Goal:

Add mobile/desktop access only after the API is stable.

Future MAUI scope:

- Student course list
- Course resources
- Assignment details
- Submission status
- Grades and feedback
- Notifications

Do not use MAUI as:

- The backend
- The database layer
- The source of authorization rules

MAUI should call the ASP.NET Core API like any other client.

---

## Deployment Direction

Recommended future deployment:

```text
GitHub: source control and CI/CD
ASP.NET Core API: Azure App Service or another .NET-capable host
Database: Supabase PostgreSQL
Storage: Supabase Storage
Static prototype: GitHub Pages until replaced
```

GitHub Pages can continue serving the prototype while the production application is developed elsewhere.

---

## Migration Checklist

- [x] Static prototype stable
- [x] Shared CSS and navigation cleanup complete
- [x] Backend readiness documented
- [x] Technical direction documented
- [x] Database schema drafted
- [x] Static-to-app roadmap drafted
- [x] ASP.NET Core API project created
- [x] API project boundaries created
- [x] Supabase configuration placeholders added
- [x] Supabase Auth JWT validation plan documented
- [x] First authenticated API contract reserved
- [ ] Supabase project created
- [ ] First database migration prepared
- [ ] Auth strategy implemented
- [ ] Course/resource vertical slice implemented
- [ ] Web app shell selected and created
- [ ] Assignment/submission workflow implemented
- [ ] Gradebook workflow implemented
- [ ] .NET MAUI client evaluated

---

## Next Implementation Step

The API skeleton, project boundaries, Supabase configuration placeholders, JWT validation plan, and first authenticated API contract now exist. The next implementation task should be:

> Add a current user context contract in the application layer. Do not connect secrets or production Supabase credentials in the next commit.
