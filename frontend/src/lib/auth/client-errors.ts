import {
  AuthErrorCode,
  mapSignInError,
  type AuthErrorCode as AuthErrorCodeType,
} from "@/lib/auth/errors";

/** Maps server/auth error codes to next-intl keys under the `auth` namespace. */
const AUTH_ERROR_I18N_KEYS: Record<AuthErrorCodeType, string> = {
  [AuthErrorCode.MISSING_DATABASE_URL]: "errors.missingDatabaseUrl",
  [AuthErrorCode.MISSING_AUTH_SECRET]: "errors.missingAuthSecret",
  [AuthErrorCode.DATABASE_UNAVAILABLE]: "errors.databaseUnavailable",
  [AuthErrorCode.DATABASE_CONNECTION_FAILED]: "errors.databaseConnectionFailed",
  [AuthErrorCode.DATABASE_SCHEMA_MISSING]: "errors.databaseSchemaMissing",
  [AuthErrorCode.EMAIL_ALREADY_EXISTS]: "errors.emailAlreadyExists",
  [AuthErrorCode.INVALID_EMAIL]: "errors.invalidEmail",
  [AuthErrorCode.INVALID_CREDENTIALS]: "errors.invalidCredentials",
  [AuthErrorCode.FIELDS_REQUIRED]: "errors.fieldsRequired",
  [AuthErrorCode.PASSWORD_TOO_SHORT]: "errors.passwordTooShort",
  [AuthErrorCode.AUTH_CONFIGURATION_ERROR]: "errors.authConfigurationError",
  [AuthErrorCode.INTERNAL_AUTH_ERROR]: "errors.internalAuthError",
};

type TranslateFn = (key: string) => string;

export function resolveAuthErrorMessage(
  t: TranslateFn,
  options: { code?: AuthErrorCodeType; fallback?: string },
): string {
  const { code, fallback } = options;
  if (code && AUTH_ERROR_I18N_KEYS[code]) {
    return t(AUTH_ERROR_I18N_KEYS[code]);
  }
  return fallback ?? t("errors.internalAuthError");
}

export function resolveSignInErrorMessage(
  t: TranslateFn,
  signInError: string | undefined,
): string {
  const code = mapSignInError(signInError);
  return resolveAuthErrorMessage(t, { code });
}
