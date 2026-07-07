# Technical Direction

This document recommends a future technical direction for **The Educator** after the static prototype phase.

No backend, framework migration, package manager, or build tool is introduced in this phase.

---

## Recommendation

For the first real application version, the recommended direction is:

```text
Frontend: Next.js
Backend platform: Supabase
Database: PostgreSQL through Supabase
Authentication: Supabase Auth
File storage: Supabase Storage
Deployment: Vercel for the app, Supabase for backend services
```

This gives The Educator the fastest path from static prototype to working academic platform while keeping a serious data model, SQL database, authentication, file storage, and role-based access policies.

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

Next.js is a strong frontend fit because it can preserve the current polished page structure while later supporting app routes, protected pages, server actions or API routes, and incremental migration from static pages.

---

## Option Comparison

| Option | Strengths | Tradeoffs | Fit |
|---|---|---|---|
| Supabase + Next.js | Fast to launch, PostgreSQL, auth, storage, row-level security | Requires learning Supabase policies carefully | Best first choice |
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

- Create a Next.js app shell
- Move visual styles into a small design system
- Create protected instructor and student route groups
- Configure Supabase project
- Add authentication
- Add user profile model

### Phase 3: Course And Resource Vertical Slice

Future work:

- Instructor can create/view courses
- Instructor can add resources
- Student can see enrolled course
- Student can open visible resources
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

---

## Suggested Route Direction

When the static prototype migrates to an app, the current pages can map to routes like this:

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

With Supabase, these rules should be enforced with row-level security policies.

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

- **Next.js** for the frontend application
- **Supabase** for auth, PostgreSQL database, storage, and access policies
- **Vercel** for deployment

Reason:

This path balances speed, academic data structure, maintainability, and future scalability without requiring a large custom backend from day one.

---

## Still Open

Before implementation starts, decide:

- Whether the first real app should be a new folder beside the static prototype or a replacement of `the-educator/`
- Whether institutional login is required in version 1
- Whether course creation is manual or admin-approved
- Whether students self-enroll, use invite links, or are imported by instructor
- Whether files need virus scanning or institutional storage policies
