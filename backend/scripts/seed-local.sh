#!/usr/bin/env bash
# Seeds the local Supabase stack from the frontend fixtures (keys come from `supabase status`, never stored).
set -euo pipefail
cd "$(dirname "$0")/.."
eval "$(supabase --workdir . status -o env 2>/dev/null | grep -E '^(API_URL|SERVICE_ROLE_KEY)=')"
SUPABASE_URL="$API_URL" SUPABASE_SERVICE_ROLE_KEY="$SERVICE_ROLE_KEY" node scripts/seed-from-fixtures.mjs
