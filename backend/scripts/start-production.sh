#!/usr/bin/env bash
# Start Medusa in production from the compiled server directory.
#
# Usage (from repo root):
#   ./backend/scripts/start-production.sh

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
BACKEND="${REPO_ROOT}/backend"
SERVER="${BACKEND}/.medusa/server"

if [[ ! -d "${SERVER}/node_modules" ]]; then
  bash "${BACKEND}/scripts/prepare-medusa-server.sh"
fi

# Medusa loadEnv reads from process.cwd(); production runs from .medusa/server
# where no .env files exist. Railway injects vars; locally we load from backend/.
if [[ -f "${BACKEND}/.env.production" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "${BACKEND}/.env.production"
  set +a
elif [[ -f "${BACKEND}/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "${BACKEND}/.env"
  set +a
fi

cd "$SERVER"
exec npx medusa start "$@"
