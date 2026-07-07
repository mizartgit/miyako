"use server";

import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "@/lib/email/templates";
import {
  AuthErrorCode,
  authFailure,
  logAuthError,
  mapDatabaseError,
  type AuthResult,
} from "@/lib/auth/errors";
import { assertAuthEnvironment } from "@/lib/auth/env";
import { prisma } from "@/lib/db";

export type { AuthResult } from "@/lib/auth/errors";

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResult> {
  const envCheck = assertAuthEnvironment();
  if (!envCheck.success) return envCheck;

  const { name, email, password } = data;

  if (!name.trim() || !email.trim() || !password) {
    return authFailure(AuthErrorCode.FIELDS_REQUIRED);
  }

  if (password.length < 8) {
    return authFailure(AuthErrorCode.PASSWORD_TOO_SHORT);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return authFailure(AuthErrorCode.INVALID_EMAIL);
  }

  const normalizedEmail = email.toLowerCase();

  try {
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return authFailure(AuthErrorCode.EMAIL_ALREADY_EXISTS);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        notificationPrefs: { create: {} },
      },
    });

    void sendWelcomeEmail({ name: name.trim(), email: normalizedEmail });

    return { success: true };
  } catch (error) {
    const code = mapDatabaseError(error);
    logAuthError("registerUser", code, error);
    return authFailure(code);
  }
}

export async function updateProfile(data: {
  userId: string;
  name: string;
  locale: string;
  currency: string;
}): Promise<AuthResult> {
  const envCheck = assertAuthEnvironment();
  if (!envCheck.success) return envCheck;

  try {
    await prisma.user.update({
      where: { id: data.userId },
      data: {
        name: data.name.trim(),
        locale: data.locale,
        currency: data.currency,
      },
    });

    return { success: true };
  } catch (error) {
    const code = mapDatabaseError(error);
    logAuthError("updateProfile", code, error);
    return authFailure(code);
  }
}

export async function updateNotificationPrefs(data: {
  userId: string;
  orderUpdates: boolean;
  shippingUpdates: boolean;
  selectionReminders: boolean;
  marketing: boolean;
}): Promise<AuthResult> {
  const envCheck = assertAuthEnvironment();
  if (!envCheck.success) return envCheck;

  try {
    await prisma.notificationPreferences.upsert({
      where: { userId: data.userId },
      create: {
        userId: data.userId,
        orderUpdates: data.orderUpdates,
        shippingUpdates: data.shippingUpdates,
        selectionReminders: data.selectionReminders,
        marketing: data.marketing,
      },
      update: {
        orderUpdates: data.orderUpdates,
        shippingUpdates: data.shippingUpdates,
        selectionReminders: data.selectionReminders,
        marketing: data.marketing,
      },
    });

    return { success: true };
  } catch (error) {
    const code = mapDatabaseError(error);
    logAuthError("updateNotificationPrefs", code, error);
    return authFailure(code);
  }
}

export async function deleteAccount(userId: string): Promise<AuthResult> {
  const envCheck = assertAuthEnvironment();
  if (!envCheck.success) return envCheck;

  try {
    await prisma.user.delete({ where: { id: userId } });
    return { success: true };
  } catch (error) {
    const code = mapDatabaseError(error);
    logAuthError("deleteAccount", code, error);
    return authFailure(code);
  }
}
