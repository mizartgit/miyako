"use server";

import { auth } from "@/auth";
import bcrypt from "bcryptjs";
import { isDbConfigured, prisma } from "@/lib/db";
import type { AuthResult } from "@/lib/actions/auth";

async function requireAuthenticatedUserId(): Promise<
  { userId: string } | { error: string }
> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be signed in." };
  }
  return { userId: session.user.id };
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<AuthResult> {
  if (!isDbConfigured()) {
    return { success: false, error: "Database not configured." };
  }

  const authResult = await requireAuthenticatedUserId();
  if ("error" in authResult) {
    return { success: false, error: authResult.error };
  }

  const user = await prisma.user.findUnique({
    where: { id: authResult.userId },
  });

  if (!user?.passwordHash) {
    return {
      success: false,
      error: "Password change is not available for this sign-in method.",
    };
  }

  if (!data.currentPassword || !data.newPassword) {
    return { success: false, error: "All fields are required." };
  }

  if (data.newPassword.length < 8) {
    return { success: false, error: "New password must be at least 8 characters." };
  }

  const valid = await bcrypt.compare(data.currentPassword, user.passwordHash);
  if (!valid) {
    return { success: false, error: "Current password is incorrect." };
  }

  if (data.currentPassword === data.newPassword) {
    return { success: false, error: "New password must be different." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(data.newPassword, 12) },
  });

  return { success: true };
}

export async function changeEmail(data: {
  currentPassword: string;
  newEmail: string;
}): Promise<AuthResult> {
  if (!isDbConfigured()) {
    return { success: false, error: "Database not configured." };
  }

  const authResult = await requireAuthenticatedUserId();
  if ("error" in authResult) {
    return { success: false, error: authResult.error };
  }

  const user = await prisma.user.findUnique({
    where: { id: authResult.userId },
  });

  if (!user?.passwordHash) {
    return {
      success: false,
      error: "Email change is not available for this sign-in method.",
    };
  }

  const newEmail = data.newEmail.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!data.currentPassword || !newEmail) {
    return { success: false, error: "All fields are required." };
  }

  if (!emailRegex.test(newEmail)) {
    return { success: false, error: "Please enter a valid email address." };
  }

  if (newEmail === user.email) {
    return { success: false, error: "That is already your email address." };
  }

  const valid = await bcrypt.compare(data.currentPassword, user.passwordHash);
  if (!valid) {
    return { success: false, error: "Current password is incorrect." };
  }

  const existing = await prisma.user.findUnique({ where: { email: newEmail } });
  if (existing) {
    return { success: false, error: "An account with this email already exists." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { email: newEmail, emailVerified: null },
  });

  return { success: true };
}
