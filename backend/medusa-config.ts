import { loadEnv, defineConfig } from "@medusajs/framework/utils";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

const stripeEnabled = Boolean(process.env.STRIPE_API_KEY);

const storefrontUrl =
  process.env.STOREFRONT_URL ?? "https://miyako-psi.vercel.app";

/** Public URL of this Medusa server (set to Railway URL in production). */
const backendUrl = process.env.MEDUSA_BACKEND_URL ?? "http://localhost:9000";

const defaultStoreCors = `http://localhost:3003,${storefrontUrl}`;

/**
 * MIYAKO Medusa backend configuration (Medusa 2.17).
 *
 * Production (Railway): set DATABASE_URL, REDIS_URL, JWT_SECRET, COOKIE_SECRET,
 * MEDUSA_BACKEND_URL=https://<your-railway-domain>, and CORS vars below.
 *
 * @see backend/README.md
 */
module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    databaseDriverOptions: {
      connection: { ssl: { rejectUnauthorized: false } },
    },
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS ?? defaultStoreCors,
      adminCors: process.env.ADMIN_CORS ?? backendUrl,
      authCors:
        process.env.AUTH_CORS ??
        `http://localhost:3003,${storefrontUrl},${backendUrl}`,
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
              backend_url: `${backendUrl.replace(/\/$/, "")}/static`,
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
