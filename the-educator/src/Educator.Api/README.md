# Educator.Api

ASP.NET Core Web API skeleton for The Educator.

Current scope:

- Minimal API project
- `/health` JSON endpoint
- `/health/live` ASP.NET Core health check endpoint
- `/api/me` protected current user contract endpoint
- Project references to Domain, Application, and Infrastructure
- Supabase/Auth configuration placeholders
- JWT bearer authentication wiring for future Supabase Auth tokens
- No Supabase connection
- No production credentials
- No protected production endpoints yet

Run locally:

```bash
dotnet run --project the-educator/src/Educator.Api/Educator.Api.csproj
```

Then open:

```text
http://localhost:5088/health
```

Reserved contract endpoint:

```text
http://localhost:5088/api/me
```

Without a valid Bearer token, this endpoint returns `401 Unauthorized`.

Next backend step:

- Follow `the-educator/docs/local-supabase-auth.md` to configure local Supabase Auth with user secrets.
- Create a local development Supabase Auth user and test an authenticated `/api/me` request with `the-educator/scripts/smoke-test-auth.sh`.
- Do not commit secrets or production credentials.
- Add real configuration only through user secrets, environment variables, or deployment secrets.

Build the .NET solution:

```bash
dotnet build the-educator/Educator.sln
```
