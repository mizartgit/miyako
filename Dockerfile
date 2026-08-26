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

# --- install + build ---
RUN npm ci --include=dev && \
    npm ci --include=dev --prefix backend && \
    npm run build:shared && \
    test -f shared/dist/index.js && \
    npm run build --prefix backend && \
    test -f backend/.medusa/server/public/admin/index.html

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
