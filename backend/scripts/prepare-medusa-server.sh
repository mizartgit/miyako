#!/usr/bin/env bash
# Prepare Medusa production build output for `medusa start`.
#
# Medusa v2 runs from backend/.medusa/server (not backend/).
# Admin assets live at public/admin/index.html relative to that directory.
#
# Usage (from repo root):
#   ./backend/scripts/prepare-medusa-server.sh

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
BACKEND="${REPO_ROOT}/backend"
SERVER="${BACKEND}/.medusa/server"
SHARED="${REPO_ROOT}/shared"

if [[ ! -f "${SERVER}/public/admin/index.html" ]]; then
  echo "ERROR: ${SERVER}/public/admin/index.html not found. Run medusa build first." >&2
  exit 1
fi

if [[ ! -f "${SHARED}/dist/index.js" ]]; then
  echo "ERROR: ${SHARED}/dist/index.js not found. Run npm run build:shared first." >&2
  exit 1
fi

echo "==> Preparing Medusa runtime directory: backend/.medusa/server"

export SERVER_DIR="$SERVER"

node <<'EOF'
const fs = require("fs");
const path = require("path");

const serverDir = process.env.SERVER_DIR;
if (!serverDir) {
  throw new Error("SERVER_DIR is not set");
}
const pkgPath = path.join(serverDir, "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

if (pkg.dependencies?.["@miyako/shared"]) {
  pkg.dependencies["@miyako/shared"] = "file:../../../shared";
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
}

const lockPath = path.join(serverDir, "package-lock.json");
if (fs.existsSync(lockPath)) {
  const lock = fs.readFileSync(lockPath, "utf8");
  fs.writeFileSync(
    lockPath,
    lock
      .replaceAll('"file:../shared"', '"file:../../../shared"')
      .replaceAll('"file:../../shared"', '"file:../../../shared"'),
  );
}
EOF

cd "$SERVER"
npm install --omit=dev --legacy-peer-deps

if [[ ! -f node_modules/@miyako/shared/dist/index.js ]]; then
  echo "ERROR: @miyako/shared not linked in ${SERVER}/node_modules" >&2
  exit 1
fi

echo "    OK: backend/.medusa/server ready (public/admin/index.html present)"
