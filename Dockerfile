# MIYAKO Medusa backend — production image.
#
# Medusa v2 production flow:
# 1. Build in backend/ → outputs backend/.medusa/server/
# 2. Install runtime deps in backend/.medusa/server/
# 3. Start with cwd backend/.medusa/server (admin at public/admin/index.html)

FROM node:20-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production
ENV NPM_CONFIG_PRODUCTION=false
ENV CI=true

# Root workspace manifests (frontend package.json required for workspace install)
COPY package.json package-lock.json .npmrc ./
COPY shared/package.json shared/tsconfig.json shared/tsconfig.build.json ./shared/
COPY shared/src ./shared/src/
COPY frontend/package.json ./frontend/

# Backend source + production start scripts
COPY backend ./backend

# Railway exposes service variables to Docker builds only as declared ARGs.
# `medusa build` inlines admin.backendUrl into the admin JS (`__BACKEND_URL__`).
# Without this, that bundle keeps the localhost fallback even when the
# runtime variable is set. Unset locally → medusa-config uses localhost.
ARG MEDUSA_BACKEND_URL
ENV MEDUSA_BACKEND_URL=${MEDUSA_BACKEND_URL}

# --- install + build ---
RUN npm ci --include=dev && \
    npm ci --include=dev --prefix backend && \
    npm run build:shared && \
    test -f shared/dist/index.js && \
    npm run build --prefix backend && \
    test -f backend/.medusa/server/public/admin/index.html && \
    if [ -n "$MEDUSA_BACKEND_URL" ] && ! printf '%s' "$MEDUSA_BACKEND_URL" | grep -q 'localhost'; then \
      if grep -R "http://localhost:9000" backend/.medusa/server/public/admin -q; then \
        echo "ERROR: admin bundle still contains http://localhost:9000. MEDUSA_BACKEND_URL was not applied at build time." >&2; \
        exit 1; \
      fi; \
    fi

# --- Medusa runtime prep (official: install deps in .medusa/server) ---
RUN chmod +x backend/scripts/prepare-medusa-server.sh && \
    bash backend/scripts/prepare-medusa-server.sh

WORKDIR /app/backend/.medusa/server

# Runtime cwd must match where medusa build wrote public/admin/
RUN test -f public/admin/index.html && \
    test -f medusa-config.js && \
    test -d node_modules/@medusajs/admin-bundler

EXPOSE 9000

CMD ["npx", "medusa", "start"]
