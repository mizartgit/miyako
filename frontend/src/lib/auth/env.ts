import {
  AuthErrorCode,
  authFailure,
  logAuthError,
  type AuthFailure,
  type AuthResult,
} from "@/lib/auth/errors";

export function getDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL?.trim();
  return url || undefined;
}

export function getAuthSecret(): string | undefined {
  const secret =
    process.env.AUTH_SECRET?.trim() ??
    process.env.NEXTAUTH_SECRET?.trim() ??
    (process.env.NODE_ENV === "development"
      ? "dev-local-auth-secret-minimum-32-chars"
      : undefined);
  return secret || undefined;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(getDatabaseUrl());
}

export function isAuthSecretConfigured(): boolean {
  return Boolean(getAuthSecret());
}

/** Validates env vars required for account registration / credentials auth. */
export function assertAuthEnvironment(): AuthResult {
  if (!isDatabaseConfigured()) {
    logAuthError("env", AuthErrorCode.MISSING_DATABASE_URL);
    return authFailure(AuthErrorCode.MISSING_DATABASE_URL);
  }

  if (!isAuthSecretConfigured()) {
    logAuthError("env", AuthErrorCode.MISSING_AUTH_SECRET);
    return authFailure(AuthErrorCode.MISSING_AUTH_SECRET);
  }

  return { success: true };
}

export function assertAuthEnvironmentOrThrow(): void {
  const check = assertAuthEnvironment();
  if (!check.success) {
    const err = new Error(check.error) as Error & { code?: AuthErrorCode };
    err.code = check.code;
    throw err;
  }
}

export type AuthEnvIssue = AuthFailure;
