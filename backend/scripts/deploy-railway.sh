#!/usr/bin/env bash
# Deploy MIYAKO Medusa backend to Railway and run production setup.
#
# Usage (from repo root):
#   ./backend/scripts/deploy-railway.sh

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO_ROOT"

ENV_FILE="${REPO_ROOT}/backend/.env.production"
ENV_EXAMPLE="${REPO_ROOT}/backend/.env.production.example"
VALIDATE="${REPO_ROOT}/backend/scripts/validate-env-production.sh"

if ! command -v railway >/dev/null 2>&1; then
  RAILWAY="npx @railway/cli"
else
  RAILWAY="railway"
fi

if ! $RAILWAY whoami >/dev/null 2>&1; then
  echo "ERROR: Not logged in to Railway. Run: railway login" >&2
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  if [[ ! -f "$ENV_EXAMPLE" ]]; then
    echo "ERROR: Missing $ENV_EXAMPLE" >&2
    exit 1
  fi
  cp "$ENV_EXAMPLE" "$ENV_FILE"
  echo "Created backend/.env.production from the example template."
  echo ""
  echo "Fill in these values before deploying:"
  echo "  - DATABASE_URL   (Neon → your existing 'medusa' database connection string)"
  echo "  - REDIS_URL      (Upstash → rediss:// TCP URL, not REST)"
  echo ""
  echo "JWT_SECRET and COOKIE_SECRET are pre-generated in the example if you copied"
  echo "a prepared file; otherwise run: openssl rand -base64 32"
  echo ""
  echo "Then run this script again."
  exit 1
fi

echo "==> Validating backend/.env.production..."
bash "$VALIDATE" "$ENV_FILE"

RAILWAY_SERVICE="${RAILWAY_SERVICE:-miyako-medusa}"

ensure_railway_project() {
  if $RAILWAY status >/dev/null 2>&1; then
    echo "==> Railway project already linked."
    $RAILWAY status
    return 0
  fi

  echo "==> No Railway project linked to this folder."
  echo "    Creating a new Railway project: miyako-medusa"
  if $RAILWAY init -n miyako-medusa; then
    echo "==> Railway project created and linked."
    return 0
  fi

  echo "" >&2
  echo "ERROR: Could not create or link a Railway project." >&2
  echo "" >&2
  echo "If you already created a project in the Railway dashboard, link it:" >&2
  echo "  railway link" >&2
  echo "" >&2
  echo "Then run this script again:" >&2
  echo "  ./backend/scripts/deploy-railway.sh" >&2
  exit 1
}

ensure_railway_project

service_exists() {
  $RAILWAY service list --json 2>/dev/null | grep -q "\"name\":\"${RAILWAY_SERVICE}\"" \
    || $RAILWAY service list 2>/dev/null | grep -qw "$RAILWAY_SERVICE"
}

service_linked() {
  $RAILWAY status 2>/dev/null | grep -qE "(Service:[[:space:]]+${RAILWAY_SERVICE}|Linked service[[:space:]]+${RAILWAY_SERVICE})"
}

ensure_railway_service() {
  if service_exists; then
    echo "==> Railway service '$RAILWAY_SERVICE' already exists."
    if ! service_linked; then
      echo "==> Linking service '$RAILWAY_SERVICE'..."
      $RAILWAY service link "$RAILWAY_SERVICE"
    fi
    return 0
  fi

  echo "==> Creating Railway service '$RAILWAY_SERVICE' (non-interactive)..."
  $RAILWAY add --service "$RAILWAY_SERVICE" --json >/dev/null
  $RAILWAY service link "$RAILWAY_SERVICE"
  echo "==> Service created and linked."
}

ensure_railway_service

echo "==> Setting environment variables on Railway..."
while IFS= read -r line || [[ -n "$line" ]]; do
  [[ -z "$line" || "$line" =~ ^# ]] && continue
  key="${line%%=*}"
  val="${line#*=}"
  [[ -z "$key" ]] && continue
  # Skip empty optional vars (Stripe, auto-generated admin password, post-deploy URLs)
  [[ -z "$val" ]] && continue
  echo "    $key"
  $RAILWAY variable set "$key=$val" --environment production --service "$RAILWAY_SERVICE"
done < "$ENV_FILE"

echo "==> Deploying to Railway..."
$RAILWAY up --detach --service "$RAILWAY_SERVICE"

echo "==> Waiting for deployment to become healthy..."
sleep 45

RAILWAY_URL="$($RAILWAY domain --service "$RAILWAY_SERVICE" 2>/dev/null | head -1 || true)"
if [[ -z "$RAILWAY_URL" ]]; then
  echo ""
  echo "WARN: No public Railway domain yet."
  echo "  1. Open Railway → your service → Settings → Networking"
  echo "  2. Generate a public domain"
  echo "  3. Run: railway variable set MEDUSA_BACKEND_URL=https://YOUR-DOMAIN --environment production"
  echo "  4. Run: railway run -- bash backend/scripts/production-setup.sh"
  exit 0
fi

if [[ "$RAILWAY_URL" != http* ]]; then
  RAILWAY_URL="https://${RAILWAY_URL}"
fi

echo "==> Setting MEDUSA_BACKEND_URL=$RAILWAY_URL"
$RAILWAY variable set "MEDUSA_BACKEND_URL=$RAILWAY_URL" --environment production --service "$RAILWAY_SERVICE"
$RAILWAY variable set "ADMIN_CORS=$RAILWAY_URL" --environment production --service "$RAILWAY_SERVICE"

echo "==> Running production database setup on Railway..."
$RAILWAY run --service "$RAILWAY_SERVICE" -- bash backend/scripts/production-setup.sh

echo ""
echo "=============================================="
echo " Deployment complete"
echo " Railway URL: $RAILWAY_URL"
echo " Admin:       $RAILWAY_URL/app"
echo "=============================================="
echo "Add to Vercel (Production):"
echo "  MEDUSA_BACKEND_URL=$RAILWAY_URL"
echo "  NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=<from setup output above>"
echo "=============================================="
