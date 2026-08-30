# Educator.Infrastructure

Infrastructure integrations for The Educator.

Current scope:

- Dependency injection extension placeholder
- Supabase configuration options
- Authentication configuration options
- EF Core PostgreSQL `EducatorDbContext`
- EF repository implementations for courses, enrollments, resources, and local users
- Initial migration for `users`, `courses`, `enrollments`, and `resources`
- HTTP-context current user context
- Conditional Supabase PostgreSQL registration through `Supabase:DatabaseConnectionString`
- No production credentials

Future scope:

- Supabase Auth integration
- Supabase Storage integration
- Email/notification providers
