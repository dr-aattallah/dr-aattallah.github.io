# Educator.Api

ASP.NET Core Web API skeleton for The Educator.

Current scope:

- Minimal API project
- `/health` JSON endpoint
- `/health/live` ASP.NET Core health check endpoint
- `/api/me` reserved contract endpoint returning `501 Not Implemented`
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

Next backend step:

- Protect `/api/me` with authorization once local Supabase Auth configuration is available.
- Do not commit secrets or production credentials.
- Add real configuration only through user secrets, environment variables, or deployment secrets.

Build the .NET solution:

```bash
dotnet build the-educator/Educator.sln
```
