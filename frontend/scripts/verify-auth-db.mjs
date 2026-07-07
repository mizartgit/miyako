/**
 * Local / CI auth database verification.
 *
 * Usage (from repo root):
 *   cd frontend && npx dotenv -e .env.local -- node scripts/verify-auth-db.mjs
 *
 * For production Neon, point DATABASE_URL at the production connection string first.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    console.error("FAIL: DATABASE_URL is not set");
    process.exit(1);
  }

  console.log("DATABASE_URL: configured");

  await prisma.$queryRaw`SELECT 1`;
  console.log("OK: database ping");

  const tables = await prisma.$queryRaw`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN ('User', 'Account', 'Session', 'VerificationToken')
  `;

  const names = new Set(tables.map((t) => t.table_name));
  const required = ["User", "Account", "Session", "VerificationToken"];

  for (const table of required) {
    if (!names.has(table)) {
      console.error(`FAIL: missing table "${table}" — run: npm run db:push -w frontend`);
      process.exit(1);
    }
    console.log(`OK: table "${table}" exists`);
  }

  const userCount = await prisma.user.count();
  console.log(`OK: User table reachable (${userCount} user(s))`);

  console.log("\nAuth database verification passed.");
}

main()
  .catch((error) => {
    console.error("FAIL:", error.message ?? error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
