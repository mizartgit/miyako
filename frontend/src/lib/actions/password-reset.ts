"use server";

import bcrypt from "bcryptjs";
import crypto from "crypto";
import type { AuthResult } from "@/lib/actions/auth";
import {
  AuthErrorCode,
  authFailure,
  authFailureCustom,
  logAuthError,
  mapDatabaseError,
} from "@/lib/auth/errors";
import { assertAuthEnvironment } from "@/lib/auth/env";
import { prisma } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email/templates";

const RESET_PREFIX = "password-reset:";
const RESET_TTL_MS = 60 * 60 * 1000;

export async function requestPasswordReset(
  email: string,
  locale = "en",
): Promise<AuthResult> {
  const envCheck = assertAuthEnvironment();
  if (!envCheck.success) return envCheck;

  const normalized = email.trim().toLowerCase();
  if (!normalized) {
    return authFailureCustom(
      AuthErrorCode.FIELDS_REQUIRED,
      "Email is required.",
    );
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: normalized } });

    // Always succeed to avoid email enumeration
    if (!user?.passwordHash) {
      return { success: true };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const identifier = `${RESET_PREFIX}${normalized}`;

    await prisma.verificationToken.deleteMany({ where: { identifier } });
    await prisma.verificationToken.create({
      data: {
        identifier,
        token,
        expires: new Date(Date.now() + RESET_TTL_MS),
      },
    });

    await sendPasswordResetEmail({ email: normalized, token, locale });
    return { success: true };
  } catch (error) {
    const code = mapDatabaseError(error);
    logAuthError("requestPasswordReset", code, error);
    return authFailure(code);
  }
}

export async function resetPassword(data: {
  email: string;
  token: string;
  password: string;
}): Promise<AuthResult> {
  const envCheck = assertAuthEnvironment();
  if (!envCheck.success) return envCheck;

  const normalized = data.email.trim().toLowerCase();
  const identifier = `${RESET_PREFIX}${normalized}`;

  if (data.password.length < 8) {
    return authFailure(AuthErrorCode.PASSWORD_TOO_SHORT);
  }

  try {
    const record = await prisma.verificationToken.findFirst({
      where: { identifier, token: data.token },
    });

    if (!record || record.expires < new Date()) {
      return authFailureCustom(
        AuthErrorCode.INTERNAL_AUTH_ERROR,
        "This reset link is invalid or has expired.",
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    await prisma.user.update({
      where: { email: normalized },
      data: { passwordHash },
    });

    await prisma.verificationToken.deleteMany({ where: { identifier } });

    return { success: true };
  } catch (error) {
    const code = mapDatabaseError(error);
    logAuthError("resetPassword", code, error);
    return authFailure(code);
  }
}
