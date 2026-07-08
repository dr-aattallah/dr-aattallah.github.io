# Technical Direction

This document recommends a future technical direction for **The Educator** after the static prototype phase.

No backend, framework migration, package manager, or build tool is introduced in this phase.

---

## Recommendation

For the first real application version, the recommended direction is:

```text
Web frontend: Static prototype first, then Next.js or Blazor when migration begins
Backend API: ASP.NET Core Web API
Backend platform: Supabase
Database: PostgreSQL through Supabase
Authentication: Supabase Auth
File storage: Supabase Storage
Code hosting: GitHub
API hosting: Azure App Service or another .NET-capable host
Database/storage hosting: Supabase
Future mobile/desktop client: .NET MAUI
```

This gives The Educator a Microsoft-friendly backend path while keeping PostgreSQL, authentication, storage, and role-based access available through Supabase.

GitHub is not the backend. GitHub should be used for source control, history, collaboration, issues, and future CI/CD workflows. Runtime backend services should live in Supabase and the ASP.NET Core API host.

---

## Why This Direction Fits The Educator

The Educator needs:

- Instructor and student accounts
- Course ownership
- Student enrollment
- Resource files
- Assignment submissions
- Grade visibility rules
- Notifications
- Future admin controls

These requirements benefit from a relational data model. Supabase is a strong fit because it provides PostgreSQL, authentication, storage, and row-level security in one platform.

ASP.NET Core Web API is a strong backend fit because it provides a clean place for academic business logic, validation, role checks, course workflows, and integration boundaries without putting all logic directly in the frontend.

.NET MAUI should not be treated as the backend. It is a future client option for mobile or desktop apps after the core web/API platform is stable.

---

## Option Comparison

| Option | Strengths | Tradeoffs | Fit |
|---|---|---|---|
| Supabase PostgreSQL + ASP.NET Core Web API | Microsoft-friendly backend, strong API layer, PostgreSQL, auth, storage | More setup than using Supabase directly from the frontend | Recommended choice |
| Supabase + Next.js direct integration | Fast to launch, PostgreSQL, auth, storage, row-level security | Business logic can drift into frontend/API routes if not disciplined | Good lightweight alternative |
| Firebase + React/Next.js | Fast auth, realtime features, good hosting ecosystem | No native relational database model; gradebook queries can become awkward | Good but less ideal for academic records |
| Node.js + Express + PostgreSQL | Full backend control, familiar API model | More setup, auth, storage, security, deployment work | Good later if custom control is needed |
| Django + PostgreSQL | Strong admin, mature backend, excellent data modeling | Heavier stack and frontend integration planning | Strong institutional option |
| Laravel + PostgreSQL/MySQL | Productive backend, good auth patterns | PHP ecosystem choice must be intentional | Good if team prefers Laravel |

---

## Recommended Phased Architecture

### Phase 1: Keep Static Prototype Stable

Current state:

- Static HTML/CSS pages
- Shared CSS
- Standardized navigation
- Backend-readiness documentation

No runtime backend is added here.

### Phase 2: Build App Foundation

Future work:

- ASP.NET Core Web API shell created
- Configure Supabase project
- Add Supabase PostgreSQL connection strategy
- Add authentication strategy with Supabase Auth
- Add user profile model and role checks
- Keep the current static prototype stable until the app shell is ready

### Phase 3: Course And Resource Vertical Slice

Future work:

- ASP.NET Core API exposes course/resource endpoints
- Instructor can create/view courses through the API
- Instructor can add resources through the API
- Student can see enrolled course through the API
- Student can open visible resources only when authorized
- File upload and download works

This phase should validate the core product loop before adding grading.

### Phase 4: Assignments And Submissions

Future work:

- Instructor creates assignments
- Student submits assignment
- Instructor reviews submission
- Basic feedback and score are saved

### Phase 5: Gradebook And Notifications

Future work:

- Instructor gradebook
- Student grade view
- Announcement publishing
- Notification read/unread state

### Phase 6: Admin And Institutional Controls

Future work:

- Admin dashboard
- User management
- Course provisioning
- Audit logs
- Import/export tools

---

## First Production Data Boundary

The first production version should not attempt to implement every planned feature. It should start with:

- Users
- Courses
- Enrollments
- Resources
- File objects

This keeps the first backend release focused and testable.

Assignments, submissions, grades, announcements, and notifications should follow after the course/resource loop is stable.

The full future schema draft is documented in:

```text
docs/database-schema.md
```

The static-to-app migration roadmap is documented in:

```text
docs/static-to-app-roadmap.md
```

The Supabase Auth JWT validation plan is documented in:

```text
docs/auth-jwt-validation.md
```

---

## Suggested Route Direction

When the static prototype migrates to a web app, the current pages can map to routes like this:

| Static Page | Future App Route |
|---|---|
| `index.html` | `/` |
| `login.html` | `/login` |
| `dashboard.html` | `/app/dashboard` |
| `course.html` | `/app/courses/[courseId]` |
| `create-course.html` | `/app/courses/new` |
| `course-settings.html` | `/app/courses/[courseId]/settings` |
| `add-resource.html` | `/app/courses/[courseId]/resources/new` |
| `resource.html` | `/app/resources/[resourceId]` |
| `student-course.html` | `/student/courses/[courseId]` |
| `assignment.html` | `/student/assignments/[assignmentId]` |
| `my-grades.html` | `/student/grades` |
| `submissions.html` | `/app/assignments/[assignmentId]/submissions` |
| `gradebook.html` | `/app/courses/[courseId]/gradebook` |
| `students.html` | `/app/courses/[courseId]/students` |
| `notifications.html` | `/app/notifications` |
| `profile.html` | `/app/profile` |
| `help.html` | `/help` |

---

## Security Direction

The future application should enforce access in the backend, not only in the frontend.

Minimum future controls:

- Users can only access their own profile.
- Instructors can only manage courses they own or are assigned to.
- Students can only view courses where they are enrolled.
- Students can only view their own submissions and grades.
- Files must be protected by course enrollment or instructor ownership.
- Admin access must be separate from instructor access.

With the recommended stack, these rules should be enforced in two layers:

- ASP.NET Core policies and service-level authorization
- Supabase/PostgreSQL row-level security where direct database access or storage policies require it

---

## File Storage Direction

The Educator will eventually need file storage for:

- Lecture PDFs
- Slides
- Assignment attachments
- Student submissions
- Profile images

Recommended storage buckets:

```text
course-resources
assignment-attachments
student-submissions
profile-images
```

Access should be private by default. Public files should be a deliberate exception, not the default behavior.

---

## Decision Summary

Recommended first real-app stack:

- **ASP.NET Core Web API** for the backend API and business logic
- **Supabase PostgreSQL** for the database
- **Supabase Auth** for authentication
- **Supabase Storage** for files
- **GitHub** for source control and future CI/CD
- **.NET MAUI** later as a mobile/desktop client, not as the backend

Reason:

This path balances Microsoft-oriented development, academic data structure, maintainability, and future scalability while keeping PostgreSQL and Supabase services as the data platform.

---

## Still Open

Before implementation starts, decide:

- Whether the first real app should be a new folder beside the static prototype or a replacement of `the-educator/`
- Whether the first web app should use Blazor or Next.js for the frontend
- Whether institutional login is required in version 1
- Whether course creation is manual or admin-approved
- Whether students self-enroll, use invite links, or are imported by instructor
- Whether files need virus scanning or institutional storage policies
