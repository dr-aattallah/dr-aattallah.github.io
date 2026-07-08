# Educator.Api

ASP.NET Core Web API skeleton for The Educator.

Current scope:

- Minimal API project
- `/health` JSON endpoint
- `/health/live` ASP.NET Core health check endpoint
- Project references to Domain, Application, and Infrastructure
- Supabase/Auth configuration placeholders
- No Supabase connection
- No production credentials
- No authentication implementation yet

Run locally:

```bash
dotnet run --project the-educator/src/Educator.Api/Educator.Api.csproj
```

Then open:

```text
http://localhost:5088/health
```

Next backend step:

- Decide how Supabase Auth JWT validation will be handled.
- Do not commit secrets or production credentials.
- Add real configuration only through user secrets, environment variables, or deployment secrets.

Build the .NET solution:

```bash
dotnet build the-educator/Educator.sln
```
