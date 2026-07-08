# The Educator

**The Educator** is a minimal academic course platform prototype designed to give every course one clean, organized space for instructors and students.

The goal is simple:

> Your course, beautifully organized.

The platform is currently a **static HTML/CSS prototype** hosted through GitHub Pages. It does not yet include real login, database, file upload, grading storage, or backend authentication.

---

## Live Site

Main platform page:

```text
https://dr-aattallah.github.io/the-educator/
```

---

## Project Purpose

The Educator is intended to help instructors organize course materials and help students find everything they need in one place.

The platform focuses on:

- Course spaces
- Syllabus and lecture files
- Slides and links
- Assignments and submissions
- Announcements and notifications
- Student roster
- Gradebook and feedback
- Simple student grade view

---

## Current Prototype Pages

### Public and Access Pages

| Page | File | Purpose |
|---|---|---|
| Landing Page | `index.html` | Public introduction to The Educator |
| Login | `login.html` | Prototype login page |
| Help | `help.html` | Explains how the platform works |

---

### Instructor Pages

| Page | File | Purpose |
|---|---|---|
| Dashboard | `dashboard.html` | Instructor course dashboard |
| Course Workspace | `course.html` | Main instructor view for a course |
| Create Course | `create-course.html` | Create a new course space |
| Course Settings | `course-settings.html` | Edit course details and visibility |
| Add Resource | `add-resource.html` | Add files, links, slides, videos, or notes |
| Resource Details | `resource.html` | View a single resource |
| Create Assignment | `create-assignment.html` | Create an assignment and rubric |
| Submissions | `submissions.html` | Review and grade student submissions |
| Create Announcement | `create-announcement.html` | Publish course announcements |
| Students | `students.html` | Manage student roster and invitations |
| Gradebook | `gradebook.html` | Instructor gradebook view |
| Notifications | `notifications.html` | Course and system notifications |
| Profile | `profile.html` | Instructor/student profile page |

---

### Student Pages

| Page | File | Purpose |
|---|---|---|
| Student Course View | `student-course.html` | Student view of course materials |
| Assignment Details | `assignment.html` | Student assignment instructions and submission prototype |
| My Grades | `my-grades.html` | Student view of grades and feedback |

---

## Suggested Navigation Flow

### Instructor Flow

```text
index.html
→ login.html
→ dashboard.html
→ course.html
→ add-resource.html
→ create-assignment.html
→ submissions.html
→ gradebook.html
```

### Student Flow

```text
index.html
→ login.html
→ student-course.html
→ assignment.html
→ my-grades.html
```

---

## Current Unified Navigation

### Instructor Navigation

Instructor-facing pages use this navigation block:

```html
<div class="nav-links">
  <a href="dashboard.html">Dashboard</a>
  <a href="course.html">Course</a>
  <a href="notifications.html">Notifications</a>
  <a href="profile.html">Profile</a>
  <a href="help.html">Help</a>
  <a class="nav-primary" href="login.html">Logout</a>
</div>
```

Applied to:

```text
dashboard.html
course.html
add-resource.html
create-course.html
create-assignment.html
create-announcement.html
submissions.html
students.html
gradebook.html
course-settings.html
resource.html
profile.html
notifications.html
help.html
```

### Student Navigation

Student-facing pages use this navigation block:

```html
<div class="nav-links">
  <a href="student-course.html">Course</a>
  <a href="assignment.html">Assignment</a>
  <a href="my-grades.html">My Grades</a>
  <a href="notifications.html">Notifications</a>
  <a href="profile.html">Profile</a>
  <a class="nav-primary" href="login.html">Logout</a>
</div>
```

Applied to:

```text
student-course.html
assignment.html
my-grades.html
```

---

## Design Direction

The current design follows a:

- Light visual identity
- Minimal interface
- Soft academic look
- Warm ivory background
- Mint, sky blue, and soft amber accents
- Rounded cards and clean spacing
- Persuasive but simple product language

The design avoids:

- Heavy dark themes
- Gaming-style visuals
- Overly technical language
- Crowded academic dashboards

---

## Current Technical Status

This version is a static frontend prototype.

### What works now

- Page layout
- Navigation between pages
- Visual identity
- Instructor and student user flows
- Prototype forms
- Prototype dashboards
- Course resource structure

### What does not work yet

- Real login
- User accounts
- Database
- File upload
- Assignment submission storage
- Real grading logic
- Notifications backend
- Student enrollment system
- Role-based permissions

---

## Future Backend Requirements

To convert The Educator into a working system, the next phase should include:

1. Authentication and user roles
   - Instructor
   - Student
   - Admin

2. Database
   - Users
   - Courses
   - Resources
   - Assignments
   - Submissions
   - Grades
   - Announcements
   - Notifications

3. File storage
   - PDFs
   - Slides
   - Assignment files
   - Resource attachments

4. Role-based access
   - Instructor can create and manage
   - Student can view and submit
   - Admin can manage system-level settings

5. Deployment plan
   - Frontend hosting
   - Backend API
   - Database hosting
   - Secure file storage

The backend-readiness blueprint is documented in:

```text
docs/backend-readiness.md
```

The recommended future technical direction is documented in:

```text
docs/technical-direction.md
```

The future database schema draft is documented in:

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

## Suggested Data Models

### User

```text
id
name
email
role
university_id
profile_image
created_at
```

### Course

```text
id
course_code
title
description
semester
section
instructor_id
status
created_at
```

### Resource

```text
id
course_id
title
type
description
url
file_path
section
visibility
created_at
```

### Assignment

```text
id
course_id
title
instructions
total_marks
due_date
submission_type
visibility
created_at
```

### Submission

```text
id
assignment_id
student_id
file_path
comment
submitted_at
status
grade
feedback
```

### Announcement

```text
id
course_id
title
message
priority
audience
pinned
created_at
```

---

## Development Notes

The current prototype is intentionally built as separate HTML files to make the structure clear and easy to review.

All prototype pages now link the shared stylesheet at:

```html
<link rel="stylesheet" href="assets/css/style.css" />
```

The shared stylesheet is used as the common design foundation. All prototype pages now rely on `assets/css/style.css` instead of large inline style blocks. Page-specific rules are scoped with body classes such as `page-course`, `page-login`, and `page-student-course` so styles do not unintentionally leak across pages.

A future production version should refactor this into:

- Shared layout components
- Reusable cards and forms
- Dynamic routing
- ASP.NET Core Web API integration

Suggested frontend options:

- Blazor
- React
- Next.js
- Vue
- SvelteKit

Selected backend direction:

- ASP.NET Core Web API for backend logic
- Supabase PostgreSQL for database
- Supabase Auth for authentication
- Supabase Storage for files
- GitHub for source control and future CI/CD only
- .NET MAUI later for mobile/desktop clients if needed

---

## Project Folder

Current folder:

```text
the-educator/
```

Recommended structure for the current prototype:

```text
the-educator/
├── index.html
├── login.html
├── dashboard.html
├── course.html
├── student-course.html
├── add-resource.html
├── resource.html
├── create-course.html
├── create-assignment.html
├── assignment.html
├── submissions.html
├── create-announcement.html
├── students.html
├── gradebook.html
├── my-grades.html
├── course-settings.html
├── notifications.html
├── profile.html
├── help.html
├── docs/
│   ├── backend-readiness.md
│   ├── technical-direction.md
│   ├── database-schema.md
│   ├── static-to-app-roadmap.md
│   └── auth-jwt-validation.md
├── src/
│   ├── Educator.Api/
│   ├── Educator.Application/
│   ├── Educator.Domain/
│   └── Educator.Infrastructure/
└── assets/
    ├── css/
    │   └── style.css
    ├── fonts/
    │   └── masmak.otf
    ├── icons/
    │   └── favicon.svg
    └── images/
```

---

## Prototype Completion Checklist

- [x] Landing page
- [x] Login page
- [x] Instructor dashboard
- [x] Instructor course page
- [x] Student course page
- [x] Add resource page
- [x] Resource details page
- [x] Create course page
- [x] Create assignment page
- [x] Assignment details page
- [x] Submissions and grading page
- [x] Announcement page
- [x] Students management page
- [x] Gradebook page
- [x] Student grades page
- [x] Notifications page
- [x] Profile page
- [x] Help page
- [x] Unified navigation review
- [x] Link testing
- [x] CSS cleanup
  - [x] Dashboard styles moved into `assets/css/style.css`
  - [x] Course page styles
  - [x] Student course page styles
  - [x] Login page styles
  - [x] Remaining page styles scoped in `assets/css/style.css`
- [x] Backend readiness blueprint
  - [x] Role ownership documented
  - [x] Page-to-data mapping documented
  - [x] First backend vertical slice defined
  - [x] Future API boundary drafted
- [ ] Backend implementation planning
  - [x] Backend technology recommendation
  - [x] Database schema design
  - [x] Static-to-app migration roadmap
  - [x] ASP.NET Core API skeleton
  - [x] API project boundaries
  - [x] Supabase configuration placeholders
  - [x] Supabase Auth JWT validation plan
  - [x] First authenticated API contract
  - [x] Current user context contract
  - [x] Local user lookup contract
  - [x] `/api/me` local user lookup flow
  - [x] JWT bearer authentication wiring
  - [x] Protected `/api/me` authorization
  - [x] Local Supabase Auth development configuration guide
  - [x] Auth smoke test script
  - [ ] Authenticated `/api/me` smoke test
  - [x] Core domain models for users, courses, enrollments, and resources
  - [x] Course/resource application contracts
  - [ ] `GET /api/courses` contract endpoint

---

## Next Step

The next recommended step is:

> Add a protected `GET /api/courses` contract endpoint for the first backend vertical slice, without connecting a database yet.

After that, the project can move from a static prototype into a real web application with backend services.

---

## Author

**Dr. Abdulaziz Attaallah**  
Associate Professor of Software Engineering  
King Abdulaziz University
