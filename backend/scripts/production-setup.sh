#!/usr/bin/env bash
# One-time production database setup for Medusa on Railway.
# Run AFTER the first successful deploy, with env vars loaded:
#
#   cd backend
#   railway link          # if not linked
#   railway run ./scripts/production-setup.sh
#
# Or locally against production DATABASE_URL:
#   set -a && source .env.production && set +a && ./scripts/production-setup.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Medusa production setup"
echo "    DATABASE_URL: ${DATABASE_URL:+configured}"
echo "    REDIS_URL: ${REDIS_URL:+configured}"

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "ERROR: DATABASE_URL is not set." >&2
  exit 1
fi

echo "==> Running migrations..."
npx medusa db:migrate

echo "==> Seeding MIYAKO works catalog..."
npx medusa exec ./src/scripts/seed-miyako-works.ts

ADMIN_EMAIL="${MEDUSA_ADMIN_EMAIL:-admin@miyako.art}"
ADMIN_PASSWORD="${MEDUSA_ADMIN_PASSWORD:-}"

if [[ -z "$ADMIN_PASSWORD" ]]; then
  ADMIN_PASSWORD="$(openssl rand -base64 18 | tr -d '/+=' | head -c 20)"
  echo "==> Generated admin password (save this): $ADMIN_PASSWORD"
fi

echo "==> Creating admin user ($ADMIN_EMAIL)..."
if npx medusa user -e "$ADMIN_EMAIL" -p "$ADMIN_PASSWORD" 2>/dev/null; then
  echo "    Admin user created."
else
  echo "    Admin user may already exist — skipping."
fi

echo "==> Ensuring publishable API key..."
npx medusa exec ./src/scripts/ensure-publishable-key.ts 2>&1 | tee /tmp/miyako-publishable-key.log
PUBLISHABLE_KEY="$(grep 'PUBLISHABLE_API_KEY=' /tmp/miyako-publishable-key.log | tail -1 | cut -d= -f2-)"

echo ""
echo "=============================================="
echo " Production setup complete"
echo "=============================================="
echo " Admin email:    $ADMIN_EMAIL"
echo " Admin password: $ADMIN_PASSWORD"
echo " Admin URL:      ${MEDUSA_BACKEND_URL:-<set MEDUSA_BACKEND_URL>}/app"
echo ""
if [[ -n "$PUBLISHABLE_KEY" ]]; then
  echo " Publishable key (add to Vercel):"
  echo "   NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$PUBLISHABLE_KEY"
fi
echo ""
echo " Vercel env vars:"
echo "   MEDUSA_BACKEND_URL=${MEDUSA_BACKEND_URL:-https://YOUR-RAILWAY-URL}"
echo "   NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=<key above>"
echo "=============================================="
