"use server";

import { auth } from "@/auth";
import bcrypt from "bcryptjs";
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

async function requireAuthenticatedUserId(): Promise<
  { userId: string } | AuthResult
> {
  const session = await auth();
  if (!session?.user?.id) {
    return authFailureCustom(
      AuthErrorCode.INTERNAL_AUTH_ERROR,
      "You must be signed in.",
    );
  }
  return { userId: session.user.id };
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<AuthResult> {
  const envCheck = assertAuthEnvironment();
  if (!envCheck.success) return envCheck;

  const authResult = await requireAuthenticatedUserId();
  if ("success" in authResult) return authResult;

  try {
    const user = await prisma.user.findUnique({
      where: { id: authResult.userId },
    });

    if (!user?.passwordHash) {
      return authFailureCustom(
        AuthErrorCode.INTERNAL_AUTH_ERROR,
        "Password change is not available for this sign-in method.",
      );
    }

    if (!data.currentPassword || !data.newPassword) {
      return authFailure(AuthErrorCode.FIELDS_REQUIRED);
    }

    if (data.newPassword.length < 8) {
      return authFailure(AuthErrorCode.PASSWORD_TOO_SHORT);
    }

    const valid = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!valid) {
      return authFailureCustom(
        AuthErrorCode.INVALID_CREDENTIALS,
        "Current password is incorrect.",
      );
    }

    if (data.currentPassword === data.newPassword) {
      return authFailureCustom(
        AuthErrorCode.INTERNAL_AUTH_ERROR,
        "New password must be different.",
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await bcrypt.hash(data.newPassword, 12) },
    });

    return { success: true };
  } catch (error) {
    const code = mapDatabaseError(error);
    logAuthError("changePassword", code, error);
    return authFailure(code);
  }
}

export async function changeEmail(data: {
  currentPassword: string;
  newEmail: string;
}): Promise<AuthResult> {
  const envCheck = assertAuthEnvironment();
  if (!envCheck.success) return envCheck;

  const authResult = await requireAuthenticatedUserId();
  if ("success" in authResult) return authResult;

  try {
    const user = await prisma.user.findUnique({
      where: { id: authResult.userId },
    });

    if (!user?.passwordHash) {
      return authFailureCustom(
        AuthErrorCode.INTERNAL_AUTH_ERROR,
        "Email change is not available for this sign-in method.",
      );
    }

    const newEmail = data.newEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!data.currentPassword || !newEmail) {
      return authFailure(AuthErrorCode.FIELDS_REQUIRED);
    }

    if (!emailRegex.test(newEmail)) {
      return authFailure(AuthErrorCode.INVALID_EMAIL);
    }

    if (newEmail === user.email) {
      return authFailureCustom(
        AuthErrorCode.INTERNAL_AUTH_ERROR,
        "That is already your email address.",
      );
    }

    const valid = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!valid) {
      return authFailureCustom(
        AuthErrorCode.INVALID_CREDENTIALS,
        "Current password is incorrect.",
      );
    }

    const existing = await prisma.user.findUnique({ where: { email: newEmail } });
    if (existing) {
      return authFailure(AuthErrorCode.EMAIL_ALREADY_EXISTS);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { email: newEmail, emailVerified: null },
    });

    return { success: true };
  } catch (error) {
    const code = mapDatabaseError(error);
    logAuthError("changeEmail", code, error);
    return authFailure(code);
  }
}
