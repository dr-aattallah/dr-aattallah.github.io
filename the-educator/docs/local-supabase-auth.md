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
```

Only add `Supabase:ServiceRoleKey` locally when server-side database or admin operations are implemented and actually need it.

---

## Run The API

```bash
dotnet run --project the-educator/src/Educator.Api/Educator.Api.csproj --urls http://127.0.0.1:5088
```

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
- Valid token without a matching local Educator user profile: `404 Not Found`
- Valid token with a future local profile lookup implementation: `200 OK`

The local user lookup is still intentionally unconfigured, so a valid token may authenticate while the Educator profile resolution remains unfinished.

---

## Safety Rules

- Use `dotnet user-secrets` for local values.
- Use deployment secrets for hosted environments.
- Never commit real Supabase keys.
- Never commit access tokens.
- Never expose the service role key to static pages, browsers, or MAUI clients.
