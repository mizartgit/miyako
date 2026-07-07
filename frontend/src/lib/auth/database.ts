import {
  AuthErrorCode,
  authFailure,
  logAuthError,
  mapDatabaseError,
  type AuthFailure,
  type AuthResult,
} from "@/lib/auth/errors";
import { isDatabaseConfigured } from "@/lib/auth/env";
import { prisma } from "@/lib/db";

export type DatabaseHealth = {
  ok: true;
  userCount: number;
  tables: {
    user: boolean;
    account: boolean;
    session: boolean;
    verificationToken: boolean;
  };
};

export type DatabaseHealthFailure = AuthFailure;

/** Ping the database and verify core Auth.js tables exist. */
export async function checkDatabaseHealth(): Promise<
  DatabaseHealth | DatabaseHealthFailure
> {
  if (!isDatabaseConfigured()) {
    return authFailure(AuthErrorCode.MISSING_DATABASE_URL);
  }

  try {
    await prisma.$queryRaw`SELECT 1`;

    const tables = await prisma.$queryRaw<
      { table_name: string }[]
    >`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('User', 'Account', 'Session', 'VerificationToken')`;

    const names = new Set(tables.map((t) => t.table_name));

    const required = {
      user: names.has("User"),
      account: names.has("Account"),
      session: names.has("Session"),
      verificationToken: names.has("VerificationToken"),
    };

    if (!required.user || !required.account || !required.session) {
      logAuthError("database-health", AuthErrorCode.DATABASE_SCHEMA_MISSING, {
        found: [...names],
      });
      return authFailure(AuthErrorCode.DATABASE_SCHEMA_MISSING);
    }

    const userCount = await prisma.user.count();

    return { ok: true, userCount, tables: required };
  } catch (error) {
    const code = mapDatabaseError(error);
    logAuthError("database-health", code, error);
    return authFailure(code);
  }
}

/** Wrap a database mutation with consistent error handling. */
export async function withDatabase<T>(
  context: string,
  operation: () => Promise<T>,
): Promise<{ success: true; data: T } | AuthResult> {
  const env = await import("@/lib/auth/env").then((m) => m.assertAuthEnvironment());
  if (!env.success) return env;

  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    const code = mapDatabaseError(error);
    logAuthError(context, code, error);
    return authFailure(code);
  }
}
