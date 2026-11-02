#!/usr/bin/env bash
# Creates a local test staff account. Usage: ADMIN_PASSWORD=... bash scripts/bootstrap-local.sh <email> "<full name>" [role]
set -euo pipefail
cd "$(dirname "$0")/.."
eval "$(supabase --workdir . status -o env 2>/dev/null | grep -E '^(API_URL|SERVICE_ROLE_KEY)=')"
SUPABASE_URL="$API_URL" SUPABASE_SERVICE_ROLE_KEY="$SERVICE_ROLE_KEY" node scripts/bootstrap-admin.mjs "$@"
