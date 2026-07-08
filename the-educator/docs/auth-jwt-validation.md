# Supabase Auth JWT Validation Plan

This document defines how **The Educator** should validate Supabase Auth JWTs in the future ASP.NET Core Web API.

This is a planning document only. It does not add authentication packages, production secrets, Supabase keys, or runtime authentication code yet.

---

## Goal

The ASP.NET Core API should trust requests only when they include a valid Supabase Auth access token.

The future API should:

- Validate JWT signature and issuer.
- Validate audience.
- Extract the authenticated user id.
- Map the user id to the local `users` table.
- Apply role and course-level authorization rules.
- Reject expired, malformed, or unauthorized tokens.

---

## Token Source

Future clients will authenticate with Supabase Auth.

After login, clients receive an access token. They should call the ASP.NET Core API with:

```text
Authorization: Bearer <access_token>
```

The API should not accept user identity from request body fields, query strings, or frontend-provided role values.

---

## Expected Configuration

Configuration placeholders already exist in `Educator.Api`:

```json
{
  "Authentication": {
    "Authority": "",
    "Audience": "authenticated"
  },
  "Supabase": {
    "ProjectUrl": "",
    "AnonKey": "",
    "ServiceRoleKey": "",
    "DatabaseConnectionString": ""
  }
}
```

Future production values must come from:

- User secrets in local development
- Environment variables
- Deployment secrets

Do not commit real Supabase keys, service role keys, or database passwords.

---

## Recommended ASP.NET Core Direction

Use ASP.NET Core JWT bearer authentication.

Future conceptual setup:

```text
AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
AddJwtBearer(...)
AddAuthorization(...)
```

The API should validate:

- Issuer/authority
- Audience
- Token lifetime
- Signature
- Subject claim

The `sub` claim should be treated as the Supabase authenticated user id.

---

## Claims Mapping

Expected useful claims:

| Claim | Purpose |
|---|---|
| `sub` | Supabase user id |
| `email` | User email, if available |
| `role` | Supabase token role, not application role |
| `aud` | Token audience |
| `iss` | Token issuer |
| `exp` | Expiration |

Important distinction:

The token `role` claim should not be treated as the user's academic role. The academic application role should come from the local `users.role` field in PostgreSQL.

---

## Application Role Resolution

After token validation:

1. Read Supabase user id from `sub`.
2. Look up local user in `users`.
3. Load application role:
   - `instructor`
   - `student`
   - `admin`
4. Apply route authorization based on the local role and course relationship.

Example:

```text
JWT sub -> users.id -> users.role -> authorization policy
```

---

## Authorization Policies

Future policies should include:

### `RequireInstructor`

Allows:

- Instructor
- Admin

Used by:

- Create course
- Add resource
- Create assignment
- Grade submissions

### `RequireStudent`

Allows:

- Student
- Admin, only where appropriate

Used by:

- Student course view
- Assignment submission
- My grades

### `RequireCourseInstructor`

Allows:

- Instructor assigned to the requested course
- Admin

Used by:

- Course settings
- Gradebook
- Student roster
- Submissions

### `RequireCourseEnrollment`

Allows:

- Student actively enrolled in the requested course
- Course instructor
- Admin

Used by:

- Course resources
- Student course materials
- Assignment details

---

## Endpoint Protection Plan

| Endpoint Area | Future Protection |
|---|---|
| `/health` | Public |
| `/health/live` | Public |
| `/api/me` | Authenticated |
| `/api/courses` | Authenticated, role-aware results |
| `/api/courses/{courseId}` | Course instructor or enrolled student |
| `/api/courses/{courseId}/resources` | Course instructor or enrolled student |
| `/api/courses/{courseId}/assignments` | Course instructor or enrolled student |
| `/api/assignments/{assignmentId}/submissions` | Course instructor or current student |
| `/api/courses/{courseId}/gradebook` | Course instructor or admin |
| `/api/me/grades` | Current student only |

---

## Supabase Service Role Key Rule

The Supabase service role key is powerful and must never be exposed to browsers, mobile apps, static pages, or public repositories.

Allowed:

- Server-side API only
- Secret manager
- Environment variables

Not allowed:

- Static HTML
- JavaScript frontend
- MAUI client
- GitHub repository
- Example config with real value

---

## Row-Level Security Relationship

ASP.NET Core authorization and Supabase Row-Level Security should complement each other.

Recommended approach:

- ASP.NET Core enforces API route and business rules.
- Supabase/PostgreSQL RLS protects data at the database level.
- Storage policies protect private files.

Do not rely only on frontend route checks.

---

## Implementation Order

When authentication implementation begins, use this order:

1. Add JWT bearer package/reference if needed.
2. Add authentication configuration validation.
3. Add `/api/me` endpoint.
4. Add user lookup contract in Application.
5. Add user lookup implementation in Infrastructure.
6. Add role-based policies.
7. Add course-specific authorization handlers.
8. Protect course/resource endpoints.
9. Add integration tests for authorized and unauthorized requests.

---

## Current Status

- [x] Supabase/Auth configuration placeholders exist
- [x] JWT validation plan documented
- [x] `/api/me` contract endpoint reserved
- [x] Current user context contract added
- [x] Local user lookup contract added
- [ ] JWT bearer authentication implemented
- [ ] `/api/me` authenticated implementation
- [ ] Local user lookup implemented
- [ ] Role policies implemented
- [ ] Course authorization handlers implemented
- [ ] Auth tests implemented

---

## Next Backend Step

The next implementation step should be:

> Wire `/api/me` through the local user lookup contract, still without connecting real Supabase credentials.
