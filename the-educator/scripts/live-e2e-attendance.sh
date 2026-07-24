#!/usr/bin/env bash
set -euo pipefail

: "${EDUCATOR_ADMIN_EMAIL:?EDUCATOR_ADMIN_EMAIL is required}"
: "${EDUCATOR_ADMIN_PASSWORD:?EDUCATOR_ADMIN_PASSWORD is required}"

SITE_URL="${SITE_URL:-https://dr-aattallah.github.io/the-educator/attendance}"
SUPABASE_URL="${SUPABASE_URL:-https://obgmbgsgwxbenglltcwv.supabase.co}"
SUPABASE_KEY="${SUPABASE_KEY:-sb_publishable_Qa-0cZ5V15zHHYIWD_SXcA_yCZ0N2GM}"
work_dir="$(mktemp -d)"
trap 'rm -rf "$work_dir"' EXIT

assert_page() {
  local path="$1"
  local expected="$2"
  local output="$work_dir/page.html"
  curl --fail --silent --show-error --max-time 30 "$SITE_URL/$path" > "$output"
  grep -q "$expected" "$output"
}

echo "1/6 Production pages"
assert_page "admin/" "إدارة الجلسات"
assert_page "student/" "إرسال رمز التحقق"
assert_page "admin/pilot.html" "rehearsalCoverage"

echo "2/6 Supabase Auth health"
curl --fail --silent --show-error --max-time 30 \
  -H "apikey: $SUPABASE_KEY" \
  "$SUPABASE_URL/auth/v1/health" >/dev/null

echo "3/6 Administrator authentication"
auth_payload="$(
  ADMIN_EMAIL="$EDUCATOR_ADMIN_EMAIL" \
  ADMIN_PASSWORD="$EDUCATOR_ADMIN_PASSWORD" \
  python3 - <<'PY'
import json, os
print(json.dumps({
    "email": os.environ["ADMIN_EMAIL"],
    "password": os.environ["ADMIN_PASSWORD"]
}))
PY
)"
curl --fail --silent --show-error --max-time 30 \
  "$SUPABASE_URL/auth/v1/token?grant_type=password" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  --data "$auth_payload" > "$work_dir/auth.json"
access_token="$(
  python3 - "$work_dir/auth.json" <<'PY'
import json, sys
token = json.load(open(sys.argv[1])).get("access_token")
if not token:
    raise SystemExit("missing access token")
print(token)
PY
)"

echo "4/6 Live readiness and integrity RPC"
curl --fail --silent --show-error --max-time 30 \
  "$SUPABASE_URL/rest/v1/rpc/admin_get_pilot_readiness" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $access_token" \
  -H "Content-Type: application/json" \
  --data '{}' > "$work_dir/readiness.json"
python3 - "$work_dir/readiness.json" <<'PY'
import json, sys
data = json.load(open(sys.argv[1]))
issues = data.get("issues") or {}
required = {
    "orphan_attendance",
    "duplicate_attendance",
    "invalid_session_times",
    "stale_pending_excuses",
    "multiple_active_sessions",
    "missing_attendance_timestamps",
}
missing = required - issues.keys()
if missing:
    raise SystemExit(f"readiness response missing: {sorted(missing)}")
bad = {key: issues[key] for key in required if int(issues[key] or 0) > 0}
if bad:
    raise SystemExit(f"attendance integrity issues: {bad}")
metrics = data.get("metrics") or {}
if int(metrics.get("required_scenarios") or 0) != 9:
    raise SystemExit("unexpected field scenario count")
print("integrity issues=0, field scenarios=9")
PY

echo "5/6 Anonymous administrator RPC denial"
status="$(
  curl --silent --show-error --output "$work_dir/anon-admin.json" \
    --write-out '%{http_code}' --max-time 30 \
    "$SUPABASE_URL/rest/v1/rpc/admin_get_pilot_readiness" \
    -H "apikey: $SUPABASE_KEY" \
    -H "Content-Type: application/json" \
    --data '{}'
)"
if [[ "$status" -lt 400 || "$status" -ge 500 ]]; then
  echo "Expected an authorization denial; received HTTP $status" >&2
  exit 1
fi

echo "6/6 Anonymous user-table denial"
status="$(
  curl --silent --show-error --output "$work_dir/anon-users.json" \
    --write-out '%{http_code}' --max-time 30 \
    "$SUPABASE_URL/rest/v1/users?select=id&limit=1" \
    -H "apikey: $SUPABASE_KEY"
)"
if [[ "$status" -lt 400 || "$status" -ge 500 ]]; then
  echo "Expected an authorization denial; received HTTP $status" >&2
  exit 1
fi

echo "Live attendance E2E and security checks passed."
