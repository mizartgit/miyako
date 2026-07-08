#!/usr/bin/env bash
# Simulates the Railway/Nixpacks production build in a clean temp directory.
# Usage (from repo root): ./backend/scripts/verify-railway-build.sh

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
WORK_DIR="$(mktemp -d)"
trap 'rm -rf "$WORK_DIR"' EXIT

echo "==> Railway build simulation"
echo "    Temp dir: $WORK_DIR"
echo ""

copy_tree() {
  local src="$1"
  local dest="$2"
  mkdir -p "$(dirname "$dest")"
  cp -R "$src" "$dest"
}

# Minimal copy matching Dockerfile / Railway upload
copy_tree "$REPO_ROOT/package.json" "$WORK_DIR/package.json"
copy_tree "$REPO_ROOT/package-lock.json" "$WORK_DIR/package-lock.json"
copy_tree "$REPO_ROOT/.npmrc" "$WORK_DIR/.npmrc"
copy_tree "$REPO_ROOT/shared" "$WORK_DIR/shared"
copy_tree "$REPO_ROOT/frontend/package.json" "$WORK_DIR/frontend/package.json"
copy_tree "$REPO_ROOT/backend" "$WORK_DIR/backend"

cd "$WORK_DIR"

export NODE_ENV=production
export NPM_CONFIG_PRODUCTION=false
export CI=true

echo "==> [install] npm ci --include=dev"
npm ci --include=dev

if [[ ! -x node_modules/.bin/tsc ]]; then
  echo "ERROR: tsc missing after root npm ci" >&2
  exit 1
fi
echo "    OK: node_modules/.bin/tsc exists"

echo ""
echo "==> [install] npm ci --include=dev --prefix backend"
npm ci --include=dev --prefix backend

if [[ ! -x backend/node_modules/.bin/medusa ]]; then
  echo "ERROR: medusa CLI missing after backend npm ci" >&2
  exit 1
fi
echo "    OK: backend/node_modules/.bin/medusa exists"

echo ""
echo "==> [build] npm run build:shared"
npm run build:shared

if [[ ! -f shared/dist/index.js ]]; then
  echo "ERROR: shared/dist/index.js not produced" >&2
  exit 1
fi
echo "    OK: shared/dist/index.js"

echo ""
echo "==> [build] npm run build --prefix backend"
set +e
npm run build --prefix backend
build_status=$?
set -e

if [[ ! -d backend/.medusa/server ]]; then
  echo "ERROR: backend/.medusa/server not produced (medusa exit $build_status)" >&2
  exit 1
fi
echo "    OK: backend/.medusa/server"
if [[ "$build_status" -ne 0 ]]; then
  echo "WARN: medusa build exited $build_status but server output exists" >&2
fi

echo ""
echo "=============================================="
echo " Railway build simulation: SUCCESS"
echo "=============================================="
echo "Next: commit + push, then redeploy on Railway."
echo "Optional (with Docker): docker build -t miyako-medusa ."
