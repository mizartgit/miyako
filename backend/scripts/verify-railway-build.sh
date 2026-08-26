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

if [[ ! -f backend/.medusa/server/public/admin/index.html ]]; then
  echo "ERROR: admin build missing at backend/.medusa/server/public/admin/index.html" >&2
  exit 1
fi
echo "    OK: backend/.medusa/server/public/admin/index.html"

echo ""
echo "==> [runtime prep] prepare-medusa-server.sh"
bash backend/scripts/prepare-medusa-server.sh

if [[ ! -f backend/.medusa/server/node_modules/@miyako/shared/dist/index.js ]]; then
  echo "ERROR: @miyako/shared missing from .medusa/server/node_modules" >&2
  exit 1
fi

# Wrong cwd (backend/) is what Railway used before the fix — admin is not there.
if [[ -f backend/public/admin/index.html ]]; then
  echo "WARN: backend/public/admin/index.html exists (unexpected duplicate)" >&2
fi
if [[ ! -f backend/public/admin/index.html ]]; then
  echo "    OK: backend/public/admin/index.html absent (expected — admin is under .medusa/server)"
fi

node <<'EOF'
const fs = require("fs");
const path = require("path");
const wrong = path.join("backend", "public", "admin", "index.html");
const right = path.join("backend", ".medusa", "server", "public", "admin", "index.html");
if (fs.existsSync(wrong)) {
  console.error("ERROR: admin index at backend/public/admin would mask misconfiguration");
  process.exit(1);
}
if (!fs.existsSync(right)) {
  console.error("ERROR: admin index missing at backend/.medusa/server/public/admin/index.html");
  process.exit(1);
}
console.log("    OK: production admin path resolves from backend/.medusa/server only");
EOF

echo ""
echo "=============================================="
echo " Railway build simulation: SUCCESS"
echo "=============================================="
echo "Next: commit + push, then redeploy on Railway."
echo "Optional (with Docker): docker build -t miyako-medusa ."
