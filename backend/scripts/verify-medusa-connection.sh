#!/usr/bin/env bash
# Verify the frontend can reach the Medusa Store API.
#
# Usage:
#   MEDUSA_BACKEND_URL=https://xxx.up.railway.app \
#   NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_... \
#   ./backend/scripts/verify-medusa-connection.sh

set -euo pipefail

BASE="${MEDUSA_BACKEND_URL:?Set MEDUSA_BACKEND_URL}"
KEY="${NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY:?Set NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY}"
BASE="${BASE%/}"

echo "==> Health check: $BASE/store/custom"
HTTP="$(curl -s -o /dev/null -w "%{http_code}" "$BASE/store/custom")"
if [[ "$HTTP" != "200" ]]; then
  echo "FAIL: expected 200, got $HTTP" >&2
  exit 1
fi
echo "OK"

echo "==> Regions: $BASE/store/regions"
REGIONS="$(curl -s -H "x-publishable-api-key: $KEY" "$BASE/store/regions")"
if echo "$REGIONS" | grep -q '"regions"'; then
  echo "OK: regions endpoint reachable"
else
  echo "FAIL: regions response unexpected:" >&2
  echo "$REGIONS" >&2
  exit 1
fi

echo "==> Work product: $BASE/store/works/moonlit-chawan"
WORK="$(curl -s -H "x-publishable-api-key: $KEY" "$BASE/store/works/moonlit-chawan")"
if echo "$WORK" | grep -q '"product"'; then
  echo "OK: work endpoint reachable"
else
  echo "WARN: moonlit-chawan not found (run seed-miyako-works if empty catalog)"
  echo "$WORK" | head -c 200
  echo ""
fi

echo ""
echo "Medusa connection verified."
