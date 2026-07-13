# Local Supabase Auth Setup

This guide explains how to configure **The Educator API** for local Supabase Auth testing without committing secrets.

Do not place real Supabase keys, database passwords, access tokens, or user credentials in Git.

---

## Required Local Values

You need these values from a development Supabase project:

| Value | Example shape | Store in Git? |
|---|---|---|
| Project URL | `https://YOUR_PROJECT_REF.supabase.co` | No |
| Auth authority | `https://YOUR_PROJECT_REF.supabase.co/auth/v1` | No |
| JWT audience | `authenticated` | Safe as placeholder |
| Anon key | Supabase anon public key | No |
| Service role key | Supabase service role key | Never |

The API validates Supabase JWTs through:

```text
Authentication:Authority
Authentication:Audience
```

---

## Configure User Secrets

From the repository root, run:

```bash
dotnet user-secrets set "Authentication:Authority" "https://YOUR_PROJECT_REF.supabase.co/auth/v1" --project the-educator/src/Educator.Api/Educator.Api.csproj
dotnet user-secrets set "Authentication:Audience" "authenticated" --project the-educator/src/Educator.Api/Educator.Api.csproj
dotnet user-secrets set "Supabase:ProjectUrl" "https://YOUR_PROJECT_REF.supabase.co" --project the-educator/src/Educator.Api/Educator.Api.csproj
dotnet user-secrets set "Supabase:AnonKey" "YOUR_LOCAL_DEV_ANON_KEY" --project the-educator/src/Educator.Api/Educator.Api.csproj
dotnet user-secrets set "Supabase:DatabaseConnectionString" "Host=YOUR_DB_HOST;Port=5432;Database=postgres;Username=postgres;Password=YOUR_LOCAL_DEV_PASSWORD;SSL Mode=Require;Trust Server Certificate=true" --project the-educator/src/Educator.Api/Educator.Api.csproj
```

Only add `Supabase:ServiceRoleKey` locally when server-side database or admin operations are implemented and actually need it.

---

## Apply Local Development Migration

After setting `Supabase:DatabaseConnectionString` locally, apply the initial schema:

```bash
dotnet ef database update \
  --project the-educator/src/Educator.Infrastructure/Educator.Infrastructure.csproj \
  --startup-project the-educator/src/Educator.Api/Educator.Api.csproj
```

This creates the first backend tables:

- `users`
- `courses`
- `enrollments`
- `resources`

For Supabase projects where the direct database host is IPv6-only, use the **Session pooler** connection string in .NET format:

```text
Host=YOUR_SESSION_POOLER_HOST;Port=5432;Database=postgres;Username=YOUR_POOLER_USER;Password=YOUR_LOCAL_DEV_PASSWORD;SSL Mode=Require;Trust Server Certificate=true;Timeout=15;Command Timeout=120
```

Avoid using the URI form directly with EF Core; Npgsql expects the .NET key-value connection string format.

---

## Seed Development Data

After applying migrations, seed a small development dataset:

```bash
dotnet run --project the-educator/src/Educator.Api/Educator.Api.csproj -- --seed-dev-data
```

This creates:

- Instructor profile: `aattallah@kau.edu.sa`
- Demo student profile: `student.demo@the-educator.local`
- Course: `CPCS-351 Software Engineering I`
- Active demo enrollment
- Visible syllabus resource

The seeder is idempotent and can be run more than once.

---

## Run The API

```bash
dotnet run --project the-educator/src/Educator.Api/Educator.Api.csproj --urls http://127.0.0.1:5088
```

Use `dotnet run` for local smoke tests so launch settings run the API in `Development` and load `dotnet user-secrets`.
Running the compiled DLL directly defaults to `Production` and will not load local user secrets unless you explicitly set the environment.

Health check:

```bash
curl -i http://127.0.0.1:5088/health
```

Expected public response:

```text
HTTP/1.1 200 OK
```

Current user without a token:

```bash
curl -i http://127.0.0.1:5088/api/me
```

Expected protected response:

```text
HTTP/1.1 401 Unauthorized
```

---

## Authenticated Smoke Test

After creating a development Supabase Auth user, obtain a local development access token from Supabase. Then call:

```bash
curl -i http://127.0.0.1:5088/api/me \
  -H "Authorization: Bearer YOUR_LOCAL_DEV_ACCESS_TOKEN"
```

Expected behavior at the current stage:

- Invalid or expired token: `401 Unauthorized`
- Valid token without a matching local Educator user profile by id or email: `404 Not Found`
- Valid token matching a seeded or stored local profile by id or email: `200 OK`

You can also run the smoke-test script:

```bash
EDUCATOR_SUPABASE_ACCESS_TOKEN="YOUR_LOCAL_DEV_ACCESS_TOKEN" \
  ./the-educator/scripts/smoke-test-auth.sh
```

Without `EDUCATOR_SUPABASE_ACCESS_TOKEN`, the script still verifies:

- `/health` returns `200 OK`
- `/api/me` without a token returns `401 Unauthorized`

---

## Safety Rules

- Use `dotnet user-secrets` for local values.
- Use deployment secrets for hosted environments.
- Never commit real Supabase keys.
- Never commit access tokens.
- Never expose the service role key to static pages, browsers, or MAUI clients.
