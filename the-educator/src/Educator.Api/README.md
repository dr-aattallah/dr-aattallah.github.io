# Educator.Api

ASP.NET Core Web API skeleton for The Educator.

Current scope:

- Minimal API project
- `/health` JSON endpoint
- `/health/live` ASP.NET Core health check endpoint
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

- Add project structure for domain/application/infrastructure boundaries.
- Decide how Supabase Auth JWT validation will be handled.
- Add configuration placeholders without committing secrets.
