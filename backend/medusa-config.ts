import { loadEnv, defineConfig } from "@medusajs/framework/utils";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

const stripeEnabled = Boolean(process.env.STRIPE_API_KEY);
const backendUrl = process.env.MEDUSA_BACKEND_URL ?? "http://localhost:9000";

/**
 * MIYAKO Medusa backend configuration (Medusa 2.17).
 *
 * Note: `file-local` and `payment-stripe` are PROVIDERS, not modules.
 * They must be nested inside their parent module's `providers` array,
 * otherwise defineConfig() receives a provider where a module is expected
 * and crashes with "Cannot read properties of undefined (reading 'prototype')".
 *
 * @see backend/README.md for full setup instructions.
 */
module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    // Neon always requires SSL. MikroORM's Postgres driver does not read
    // `sslmode` from the connection URL, so SSL must be enabled explicitly
    // here for every environment (not just production).
    databaseDriverOptions: {
      connection: { ssl: { rejectUnauthorized: false } },
    },
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS ?? "http://localhost:3003",
      adminCors: process.env.ADMIN_CORS ?? "http://localhost:9000",
      authCors:
        process.env.AUTH_CORS ??
        "http://localhost:3003,http://localhost:9000",
      jwtSecret: process.env.JWT_SECRET ?? "dev-jwt-secret-change-me",
      cookieSecret: process.env.COOKIE_SECRET ?? "dev-cookie-secret-change-me",
    },
  },
  modules: [
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/file-local",
            id: "local",
            options: {
              upload_dir: "static",
              backend_url: `${backendUrl}/static`,
            },
          },
        ],
      },
    },
    ...(stripeEnabled
      ? [
          {
            resolve: "@medusajs/medusa/payment",
            options: {
              providers: [
                {
                  resolve: "@medusajs/medusa/payment-stripe",
                  id: "stripe",
                  options: {
                    api_key: process.env.STRIPE_API_KEY,
                    webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
                  },
                },
              ],
            },
          },
        ]
      : []),
  ],
});
