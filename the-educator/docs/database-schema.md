# Future Database Schema

This document drafts the future database structure for **The Educator**.

It is written for a future PostgreSQL/Supabase implementation, but it does not add a backend, migrations, SQL files, build tools, or runtime dependencies.

---

## Design Principles

The schema should support:

- Clear instructor and student roles
- One organized space per course
- Course resources and files
- Assignment submission and grading workflows
- Student-specific grade visibility
- Announcements and notifications
- Future admin controls
- Private-by-default access rules

The first real backend should implement a narrow vertical slice before the full schema:

```text
users
courses
enrollments
resources
file_objects
```

---

## Core Entities

### `users`

Represents instructors, students, and future admins.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key; should align with auth user id |
| `name` | text | Display name |
| `email` | text | Unique |
| `role` | enum | `instructor`, `student`, `admin` |
| `university_id` | text | Optional institutional ID |
| `profile_image_path` | text | Optional storage path |
| `status` | enum | `active`, `invited`, `disabled` |
| `created_at` | timestamp | Created time |
| `updated_at` | timestamp | Last update time |

Important rules:

- A user can have one primary platform role in the first version.
- Multi-role support can be added later with a separate `user_roles` table if needed.

---

### `courses`

Represents one academic course space.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `course_code` | text | Example: `CPCS-351` |
| `title` | text | Course title |
| `description` | text | Optional |
| `semester` | text | Example: `Fall 2026` |
| `section` | text | Optional |
| `instructor_id` | uuid | References `users.id` |
| `visibility` | enum | `draft`, `published`, `archived` |
| `created_at` | timestamp | Created time |
| `updated_at` | timestamp | Last update time |

Important rules:

- Only the assigned instructor or admin can edit a course.
- Students only see published courses where they are enrolled.

---

### `enrollments`

Connects students to courses.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `course_id` | uuid | References `courses.id` |
| `student_id` | uuid | References `users.id` |
| `status` | enum | `active`, `pending`, `dropped`, `completed` |
| `section` | text | Optional |
| `created_at` | timestamp | Created time |
| `updated_at` | timestamp | Last update time |

Important rules:

- A student should only have one active enrollment per course.
- Enrollment controls access to resources, assignments, submissions, and grades.

---

### `resources`

Represents course materials such as PDFs, slides, links, videos, and notes.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `course_id` | uuid | References `courses.id` |
| `title` | text | Resource title |
| `description` | text | Optional |
| `type` | enum | `pdf`, `slides`, `link`, `video`, `note`, `other` |
| `section` | text | Example: `Week 1`, `Syllabus` |
| `url` | text | For external links/videos |
| `file_object_id` | uuid | Optional reference to `file_objects.id` |
| `visibility` | enum | `draft`, `visible`, `hidden` |
| `created_by` | uuid | References `users.id` |
| `created_at` | timestamp | Created time |
| `updated_at` | timestamp | Last update time |

Important rules:

- Students only see resources marked `visible`.
- File resources should point to private storage paths through `file_objects`.

---

### `file_objects`

Tracks uploaded files and storage metadata.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `owner_id` | uuid | References `users.id` |
| `course_id` | uuid | Optional reference to `courses.id` |
| `bucket` | text | Storage bucket name |
| `path` | text | Storage path |
| `file_name` | text | Original filename |
| `mime_type` | text | File MIME type |
| `size_bytes` | integer | File size |
| `visibility` | enum | `private`, `course`, `public` |
| `created_at` | timestamp | Created time |

Important rules:

- Files should be private by default.
- Access should be derived from course ownership or enrollment.

---

## Assignment And Grading Entities

### `assignments`

Represents assignments created inside a course.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `course_id` | uuid | References `courses.id` |
| `title` | text | Assignment title |
| `instructions` | text | Student-facing instructions |
| `total_marks` | numeric | Maximum score |
| `due_at` | timestamp | Due date/time |
| `submission_type` | enum | `file`, `text`, `link`, `mixed` |
| `visibility` | enum | `draft`, `published`, `hidden` |
| `created_by` | uuid | References `users.id` |
| `created_at` | timestamp | Created time |
| `updated_at` | timestamp | Last update time |

Important rules:

- Students only see published assignments in enrolled courses.
- Draft assignments are visible only to instructors/admins.

---

### `rubric_items`

Optional grading rubric attached to assignments.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `assignment_id` | uuid | References `assignments.id` |
| `label` | text | Criterion name |
| `description` | text | Optional |
| `marks` | numeric | Marks allocated |
| `sort_order` | integer | Display order |

---

### `submissions`

Represents a student's submission for an assignment.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `assignment_id` | uuid | References `assignments.id` |
| `student_id` | uuid | References `users.id` |
| `file_object_id` | uuid | Optional reference to `file_objects.id` |
| `text_response` | text | Optional |
| `link_url` | text | Optional |
| `status` | enum | `draft`, `submitted`, `late`, `returned` |
| `submitted_at` | timestamp | Submission time |
| `created_at` | timestamp | Created time |
| `updated_at` | timestamp | Last update time |

Important rules:

- A student should have one active submission per assignment.
- Students can only read and update their own submissions before grading rules lock them.

---

### `grades`

Stores instructor grading and feedback.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `submission_id` | uuid | References `submissions.id` |
| `assignment_id` | uuid | References `assignments.id` |
| `student_id` | uuid | References `users.id` |
| `graded_by` | uuid | References `users.id` |
| `score` | numeric | Awarded score |
| `feedback` | text | Student-facing feedback |
| `visibility` | enum | `draft`, `released` |
| `graded_at` | timestamp | Grading time |
| `updated_at` | timestamp | Last update time |

Important rules:

- Students only see grades where `visibility` is `released`.
- Instructors can view draft and released grades for their courses.

---

## Communication Entities

### `announcements`

Represents course announcements.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `course_id` | uuid | References `courses.id` |
| `title` | text | Announcement title |
| `message` | text | Announcement body |
| `priority` | enum | `normal`, `important`, `urgent` |
| `audience` | enum | `all`, `students`, `instructors` |
| `is_pinned` | boolean | Pin to top |
| `published_at` | timestamp | Optional |
| `created_by` | uuid | References `users.id` |
| `created_at` | timestamp | Created time |
| `updated_at` | timestamp | Last update time |

---

### `notifications`

Represents user-specific notifications.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `user_id` | uuid | References `users.id` |
| `title` | text | Notification title |
| `message` | text | Notification body |
| `type` | enum | `announcement`, `assignment`, `grade`, `submission`, `system` |
| `related_type` | text | Optional entity type |
| `related_id` | uuid | Optional entity id |
| `read_at` | timestamp | Null means unread |
| `created_at` | timestamp | Created time |

Important rules:

- Users only read their own notifications.
- Notifications should be generated by backend events later.

---

## Invitation And Preference Entities

### `invitations`

Supports inviting students to a course.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `course_id` | uuid | References `courses.id` |
| `email` | text | Invitee email |
| `role` | enum | Usually `student` |
| `status` | enum | `pending`, `accepted`, `expired`, `revoked` |
| `token_hash` | text | Store hashed token, not raw token |
| `expires_at` | timestamp | Expiration |
| `created_by` | uuid | References `users.id` |
| `created_at` | timestamp | Created time |

---

### `user_preferences`

Stores user-level settings.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `user_id` | uuid | References `users.id` |
| `email_notifications` | boolean | Default true |
| `timezone` | text | Optional |
| `language` | text | Optional |
| `created_at` | timestamp | Created time |
| `updated_at` | timestamp | Last update time |

---

## Relationship Summary

```text
users 1--many courses as instructor
users many--many courses through enrollments as students
courses 1--many resources
courses 1--many assignments
courses 1--many announcements
assignments 1--many submissions
submissions 1--one grades
users 1--many notifications
users 1--many file_objects
courses 1--many file_objects
```

---

## Row-Level Security Direction

Future Supabase row-level security should enforce:

- Instructors can select and update courses where `courses.instructor_id = auth.uid()`.
- Students can select courses through active enrollments.
- Students can select visible resources only for enrolled courses.
- Students can insert submissions only for themselves.
- Students can select grades only for themselves and only when released.
- Instructors can select submissions and grades for courses they teach.
- Users can select and update their own profile and preferences.
- Users can select only their own notifications.

These rules should be implemented in database policies, not only in frontend route guards.

---

## First Migration Scope

The first migration should include only:

- `users`
- `courses`
- `enrollments`
- `resources`
- `file_objects`

The first app milestone should prove:

1. Instructor can sign in.
2. Instructor can view assigned courses.
3. Instructor can create a course resource.
4. Student can sign in.
5. Student can view the resource only if enrolled.

After this is stable, add:

- `assignments`
- `submissions`
- `grades`
- `announcements`
- `notifications`

---

## Open Schema Questions

- Should instructors be allowed to co-teach the same course?
- Should a student be allowed to enroll in multiple sections of the same course?
- Should gradebook support weighted categories from the first version?
- Should assignment resubmissions create new versions or update the same submission?
- Should resources have scheduled release dates?
- Should institutional IDs be required or optional?
- Should admins create official courses, or can instructors create them freely?
