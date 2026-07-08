#!/usr/bin/env bash
set -euo pipefail

API_BASE_URL="${EDUCATOR_API_BASE_URL:-http://127.0.0.1:5088}"
ACCESS_TOKEN="${EDUCATOR_SUPABASE_ACCESS_TOKEN:-}"

echo "Checking public health endpoint..."
health_status="$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE_URL/health")"

if [[ "$health_status" != "200" ]]; then
  echo "Expected /health to return 200, got $health_status."
  exit 1
fi

echo "Checking protected /api/me without a token..."
anonymous_status="$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE_URL/api/me")"

if [[ "$anonymous_status" != "401" ]]; then
  echo "Expected /api/me without a token to return 401, got $anonymous_status."
  exit 1
fi

if [[ -z "$ACCESS_TOKEN" ]]; then
  echo "No EDUCATOR_SUPABASE_ACCESS_TOKEN set; authenticated smoke test skipped."
  echo "Set EDUCATOR_SUPABASE_ACCESS_TOKEN locally to test a real Supabase Auth token."
  exit 0
fi

echo "Checking protected /api/me with a Supabase access token..."
authenticated_status="$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  "$API_BASE_URL/api/me")"

case "$authenticated_status" in
  200|404)
    echo "Authenticated smoke test accepted expected status $authenticated_status."
    ;;
  401)
    echo "Token was rejected with 401. Check Supabase Auth authority, audience, and token freshness."
    exit 1
    ;;
  *)
    echo "Unexpected authenticated /api/me status: $authenticated_status."
    exit 1
    ;;
esac
