# Backend Readiness Blueprint

This document prepares **The Educator** static prototype for a future backend implementation without adding authentication, databases, APIs, or build tooling yet.

The current product promise remains:

> Your course, beautifully organized.

---

## Current Phase

The Educator is still a static GitHub Pages prototype. The goal of this blueprint is to clarify what each page will become when the project moves into a real application.

This phase should not introduce:

- Real authentication
- Database connections
- File uploads
- Server-side grading
- Role-based access enforcement
- React, Next.js, or other framework migration

---

## Roles

### Public Visitor

Can access:

- Landing page
- Login prototype
- Help/about page

Future responsibilities:

- Understand the product quickly
- Start login or request access

### Instructor

Can access:

- Dashboard
- Course workspace
- Create course
- Course settings
- Add resource
- Create assignment
- Create announcement
- Submissions
- Students
- Gradebook
- Notifications
- Profile
- Help

Future responsibilities:

- Create and manage courses
- Publish course materials
- Manage assignments
- Review submissions
- Grade students
- Publish announcements
- Manage student roster

### Student

Can access:

- Student course view
- Assignment details
- My grades
- Resource details
- Notifications
- Profile
- Help

Future responsibilities:

- View course materials
- Read announcements
- Submit assignments
- View grades and feedback

### Admin

Not represented in the current prototype yet.

Future responsibilities:

- Manage users
- Manage system settings
- Support institutional course provisioning
- Review platform-wide activity

---

## Page Ownership

| File | Route Type | Primary Role | Future Access Rule |
|---|---|---|---|
| `index.html` | Public | Public Visitor | Public |
| `login.html` | Public/Auth | Public Visitor | Public until authenticated |
| `help.html` | Shared | Public/Instructor/Student | Public or authenticated |
| `dashboard.html` | App | Instructor | Instructor only |
| `course.html` | App | Instructor | Instructor assigned to course |
| `create-course.html` | App | Instructor | Instructor only |
| `course-settings.html` | App | Instructor | Course instructor or admin |
| `add-resource.html` | App | Instructor | Course instructor |
| `create-assignment.html` | App | Instructor | Course instructor |
| `create-announcement.html` | App | Instructor | Course instructor |
| `submissions.html` | App | Instructor | Course instructor |
| `students.html` | App | Instructor | Course instructor |
| `gradebook.html` | App | Instructor | Course instructor |
| `student-course.html` | App | Student | Enrolled student |
| `assignment.html` | App | Student | Enrolled student |
| `my-grades.html` | App | Student | Current student only |
| `resource.html` | Shared App | Instructor/Student | Course instructor or enrolled student |
| `notifications.html` | Shared App | Instructor/Student | Current authenticated user |
| `profile.html` | Shared App | Instructor/Student | Current authenticated user |

---

## Page-To-Data Mapping

### `dashboard.html`

Future data:

- Current instructor profile
- Instructor courses
- Course status
- Semester metadata
- Course activity summary

Primary models:

- User
- Course
- Enrollment
- Assignment
- Submission

### `course.html`

Future data:

- Course details
- Resource groups
- Assignments
- Announcements
- Roster count
- Submission and grading summaries

Primary models:

- Course
- Resource
- Assignment
- Announcement
- Enrollment
- Submission

### `student-course.html`

Future data:

- Enrolled course details
- Visible resources
- Visible assignments
- Student-specific deadlines
- Announcements
- Grade summary

Primary models:

- Course
- Enrollment
- Resource
- Assignment
- Announcement
- Submission

### `add-resource.html`

Future data:

- Course ID
- Resource title
- Resource type
- Section/category
- Visibility rules
- Link or uploaded file reference

Primary models:

- Course
- Resource
- FileObject

### `resource.html`

Future data:

- Resource metadata
- File or link preview
- Visibility
- Course context
- Access audit metadata

Primary models:

- Resource
- Course
- FileObject

### `create-assignment.html`

Future data:

- Course ID
- Assignment title
- Instructions
- Due date
- Total marks
- Rubric
- Visibility
- Submission type

Primary models:

- Course
- Assignment
- RubricItem

### `assignment.html`

Future data:

- Assignment details
- Student submission status
- Uploaded file reference
- Instructor feedback
- Grade visibility

Primary models:

- Assignment
- Submission
- Grade
- FileObject

### `submissions.html`

Future data:

- Assignment submissions
- Student identities
- Submission status
- Grade draft
- Feedback draft

Primary models:

- Assignment
- Submission
- User
- Grade

### `students.html`

Future data:

- Enrolled students
- Pending invitations
- Enrollment status
- Section/group membership

Primary models:

- User
- Course
- Enrollment
- Invitation

### `gradebook.html`

Future data:

- Students
- Assignments
- Scores
- Weighted totals
- Feedback status
- Export state

Primary models:

- Course
- Enrollment
- Assignment
- Grade
- Submission

### `my-grades.html`

Future data:

- Student grades
- Assignment feedback
- Grade visibility rules
- Course average or progress summary

Primary models:

- Enrollment
- Assignment
- Grade
- Submission

### `create-announcement.html`

Future data:

- Course ID
- Announcement title
- Message
- Priority
- Audience
- Pinning state
- Scheduled publish time

Primary models:

- Course
- Announcement
- Notification

### `notifications.html`

Future data:

- User notifications
- Read/unread state
- Notification type
- Related entity link

Primary models:

- Notification
- User

### `profile.html`

Future data:

- User profile
- Role
- Contact information
- Notification preferences
- Account status

Primary models:

- User
- UserPreference

---

## First Database Boundary

The first production backend should support a narrow but useful vertical slice:

1. User can authenticate.
2. Instructor can view their dashboard courses.
3. Instructor can open one course.
4. Instructor can add a resource.
5. Student enrolled in that course can view the resource.

This slice validates the essential product loop before grading, submissions, and notifications are implemented.

Recommended first models:

- User
- Course
- Enrollment
- Resource
- FileObject

Recommended later models:

- Assignment
- Submission
- Grade
- Announcement
- Notification
- Invitation
- UserPreference

---

## Suggested API Boundary

These are future API concepts only. Do not implement them in the static prototype.

### Auth

```text
POST /auth/login
POST /auth/logout
GET  /auth/me
```

### Courses

```text
GET    /courses
POST   /courses
GET    /courses/:courseId
PATCH  /courses/:courseId
POST   /courses/:courseId/archive
```

### Resources

```text
GET    /courses/:courseId/resources
POST   /courses/:courseId/resources
GET    /resources/:resourceId
PATCH  /resources/:resourceId
DELETE /resources/:resourceId
```

### Enrollments

```text
GET  /courses/:courseId/enrollments
POST /courses/:courseId/invitations
```

### Assignments

```text
GET  /courses/:courseId/assignments
POST /courses/:courseId/assignments
GET  /assignments/:assignmentId
```

### Submissions And Grades

```text
GET   /assignments/:assignmentId/submissions
POST  /assignments/:assignmentId/submissions
PATCH /submissions/:submissionId/grade
GET   /courses/:courseId/gradebook
GET   /me/grades
```

### Announcements And Notifications

```text
GET  /courses/:courseId/announcements
POST /courses/:courseId/announcements
GET  /me/notifications
POST /me/notifications/:notificationId/read
```

---

## Static-To-App Migration Notes

When the project is ready to move beyond static HTML, migrate in this order:

1. Preserve the current visual identity in a shared design system.
2. Convert page layouts into reusable components.
3. Add routing with role-aware route groups.
4. Add authentication.
5. Implement the first course/resource vertical slice.
6. Add assignments and submissions.
7. Add gradebook and feedback.
8. Add notifications.
9. Add admin tools only after instructor and student flows are stable.

Recommended first production routes:

```text
/
/login
/app/dashboard
/app/courses/:courseId
/app/courses/:courseId/resources/new
/app/resources/:resourceId
/student/courses/:courseId
```

---

## Backend Readiness Checklist

- [x] Static pages exist for core instructor and student flows
- [x] Shared stylesheet exists
- [x] Navigation has been standardized
- [x] Link testing has been completed
- [x] Page ownership is documented
- [x] Page-to-data mapping is documented
- [x] First backend vertical slice is defined
- [x] Future API boundary is drafted
- [ ] Backend technology choice
- [ ] Authentication provider choice
- [ ] Database schema design
- [ ] File storage provider choice
- [ ] Migration plan from static pages to app routes
