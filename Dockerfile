# MIYAKO Medusa backend — production image.
# Mirrors nixpacks.toml phases for reproducible local + Railway builds.

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

# Backend (standalone install + Medusa build)
COPY backend ./backend

# --- install phase (nixpacks.toml [phases.install]) ---
RUN npm ci --include=dev && \
    npm ci --include=dev --prefix backend

# --- build phase (nixpacks.toml [phases.build]) ---
RUN test -x node_modules/.bin/tsc && \
    npm run build:shared && \
    test -f shared/dist/index.js && \
    npm run build --prefix backend

EXPOSE 9000

CMD ["npm", "run", "start", "--prefix", "backend"]
