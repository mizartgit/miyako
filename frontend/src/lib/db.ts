import { PrismaClient } from "@prisma/client";
import { isDatabaseConfigured } from "@/lib/auth/env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/** @deprecated Prefer `isDatabaseConfigured()` from `@/lib/auth/env`. */
export function isDbConfigured(): boolean {
  return isDatabaseConfigured();
}
