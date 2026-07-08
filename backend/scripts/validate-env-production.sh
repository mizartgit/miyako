#!/usr/bin/env bash
# Validates backend/.env.production before Railway deploy.
#
# Does NOT use `source` — PostgreSQL/Redis URLs contain ? and & which break shell sourcing.
# Compatible with macOS bash 3.2 (no associative arrays).
#
# Usage: ./backend/scripts/validate-env-production.sh [path-to-env-file]

set -euo pipefail

ENV_FILE="${1:-$(cd "$(dirname "$0")/.." && pwd)/.env.production}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: Env file not found: $ENV_FILE" >&2
  exit 1
fi

# Read a single KEY=VALUE from the env file (first '=' split only; no shell expansion)
env_get() {
  local key="$1"
  local file="$2"
  local line val
  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line#"${line%%[![:space:]]*}"}"
    [[ -z "$line" || "$line" =~ ^# ]] && continue
    if [[ "$line" == "${key}="* ]]; then
      val="${line#*=}"
      echo "$val"
      return 0
    fi
  done < "$file"
  return 1
}

REQUIRED=(
  NODE_ENV
  DATABASE_URL
  REDIS_URL
  JWT_SECRET
  COOKIE_SECRET
  STOREFRONT_URL
  STORE_CORS
  AUTH_CORS
  MEDUSA_ADMIN_EMAIL
)

PLACEHOLDER_PATTERNS=(
  'USER:PASSWORD'
  'YOUR_MEDUSA_DB'
  'TOKEN@HOST'
  'YOUR-RAILWAY-URL'
  'your-service.up.railway.app'
)

missing=()
invalid=()

for key in "${REQUIRED[@]}"; do
  val="$(env_get "$key" "$ENV_FILE" || true)"
  if [[ -z "$val" ]]; then
    missing+=("$key")
    continue
  fi
  for pattern in "${PLACEHOLDER_PATTERNS[@]}"; do
    if [[ "$val" == *"$pattern"* ]]; then
      invalid+=("$key (still contains placeholder: $pattern)")
    fi
  done
done

if [[ ${#missing[@]} -gt 0 || ${#invalid[@]} -gt 0 ]]; then
  echo "ERROR: backend/.env.production is incomplete." >&2
  if [[ ${#missing[@]} -gt 0 ]]; then
    echo "  Missing values:" >&2
    printf '    - %s\n' "${missing[@]}" >&2
  fi
  if [[ ${#invalid[@]} -gt 0 ]]; then
    echo "  Placeholder values must be replaced:" >&2
    printf '    - %s\n' "${invalid[@]}" >&2
  fi
  echo "" >&2
  echo "Edit: $ENV_FILE" >&2
  exit 1
fi

JWT_SECRET="$(env_get JWT_SECRET "$ENV_FILE")"
COOKIE_SECRET="$(env_get COOKIE_SECRET "$ENV_FILE")"
NODE_ENV="$(env_get NODE_ENV "$ENV_FILE")"

if [[ ${#JWT_SECRET} -lt 32 || ${#COOKIE_SECRET} -lt 32 ]]; then
  echo "ERROR: JWT_SECRET and COOKIE_SECRET must be at least 32 characters." >&2
  exit 1
fi

if [[ "$NODE_ENV" != "production" ]]; then
  echo "WARN: NODE_ENV is '$NODE_ENV' (expected 'production')"
fi

echo "OK: backend/.env.production is valid for deployment."
echo "    DATABASE_URL: configured"
echo "    REDIS_URL: configured"
if [[ -n "$(env_get MEDUSA_ADMIN_PASSWORD "$ENV_FILE" || true)" ]]; then
  echo "    MEDUSA_ADMIN_PASSWORD: set"
else
  echo "    MEDUSA_ADMIN_PASSWORD: empty (auto-generated during production-setup.sh)"
fi
