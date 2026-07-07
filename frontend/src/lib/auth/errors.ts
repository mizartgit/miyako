/**
 * Auth error codes returned to clients and mapped to user-facing copy.
 * Server logs should include the code plus the underlying error.
 */

export const AuthErrorCode = {
  MISSING_DATABASE_URL: "MISSING_DATABASE_URL",
  MISSING_AUTH_SECRET: "MISSING_AUTH_SECRET",
  DATABASE_UNAVAILABLE: "DATABASE_UNAVAILABLE",
  DATABASE_CONNECTION_FAILED: "DATABASE_CONNECTION_FAILED",
  DATABASE_SCHEMA_MISSING: "DATABASE_SCHEMA_MISSING",
  EMAIL_ALREADY_EXISTS: "EMAIL_ALREADY_EXISTS",
  INVALID_EMAIL: "INVALID_EMAIL",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  FIELDS_REQUIRED: "FIELDS_REQUIRED",
  PASSWORD_TOO_SHORT: "PASSWORD_TOO_SHORT",
  AUTH_CONFIGURATION_ERROR: "AUTH_CONFIGURATION_ERROR",
  INTERNAL_AUTH_ERROR: "INTERNAL_AUTH_ERROR",
} as const;

export type AuthErrorCode = (typeof AuthErrorCode)[keyof typeof AuthErrorCode];

/** Default English messages (also used as server-action fallback). */
export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  [AuthErrorCode.MISSING_DATABASE_URL]:
    "Authentication is unavailable: DATABASE_URL is not configured.",
  [AuthErrorCode.MISSING_AUTH_SECRET]:
    "Authentication is unavailable: AUTH_SECRET is not configured.",
  [AuthErrorCode.DATABASE_UNAVAILABLE]:
    "The database is currently unavailable. Please try again shortly.",
  [AuthErrorCode.DATABASE_CONNECTION_FAILED]:
    "Could not connect to the database. Please try again shortly.",
  [AuthErrorCode.DATABASE_SCHEMA_MISSING]:
    "The account database is not initialized. Please contact support.",
  [AuthErrorCode.EMAIL_ALREADY_EXISTS]:
    "An account with this email already exists.",
  [AuthErrorCode.INVALID_EMAIL]: "Please enter a valid email address.",
  [AuthErrorCode.INVALID_CREDENTIALS]: "Invalid email or password.",
  [AuthErrorCode.FIELDS_REQUIRED]: "All fields are required.",
  [AuthErrorCode.PASSWORD_TOO_SHORT]:
    "Password must be at least 8 characters.",
  [AuthErrorCode.AUTH_CONFIGURATION_ERROR]:
    "Authentication configuration error. Please contact support.",
  [AuthErrorCode.INTERNAL_AUTH_ERROR]:
    "An unexpected authentication error occurred. Please try again.",
};

export type AuthFailure = {
  success: false;
  code: AuthErrorCode;
  error: string;
};

export type AuthSuccess = { success: true };

export type AuthResult = AuthSuccess | AuthFailure;

export function authFailure(code: AuthErrorCode): AuthFailure {
  return { success: false, code, error: AUTH_ERROR_MESSAGES[code] };
}

/** Same as `authFailure` but with a custom user-facing message (code still logged). */
export function authFailureCustom(code: AuthErrorCode, error: string): AuthFailure {
  return { success: false, code, error };
}

export function logAuthError(
  context: string,
  code: AuthErrorCode,
  cause?: unknown,
): void {
  const detail =
    cause instanceof Error
      ? { message: cause.message, stack: cause.stack }
      : cause;
  console.error(`[auth:${context}]`, { code, detail });
}

/** Map Prisma / database errors to safe client-facing codes. */
export function mapDatabaseError(error: unknown): AuthErrorCode {
  if (error && typeof error === "object" && "code" in error) {
    const prismaCode = String((error as { code: string }).code);

    if (prismaCode === "P2002") {
      return AuthErrorCode.EMAIL_ALREADY_EXISTS;
    }
    if (prismaCode === "P2021" || prismaCode === "P2022") {
      return AuthErrorCode.DATABASE_SCHEMA_MISSING;
    }
    if (
      prismaCode === "P1000" ||
      prismaCode === "P1001" ||
      prismaCode === "P1002" ||
      prismaCode === "P1017"
    ) {
      return AuthErrorCode.DATABASE_CONNECTION_FAILED;
    }
  }

  return AuthErrorCode.INTERNAL_AUTH_ERROR;
}

/** Map NextAuth client `signIn()` error strings to auth error codes. */
export function mapSignInError(error: string | undefined): AuthErrorCode {
  switch (error) {
    case "CredentialsSignin":
      return AuthErrorCode.INVALID_CREDENTIALS;
    case "Configuration":
      return AuthErrorCode.AUTH_CONFIGURATION_ERROR;
    default:
      return error
        ? AuthErrorCode.INTERNAL_AUTH_ERROR
        : AuthErrorCode.INTERNAL_AUTH_ERROR;
  }
}
