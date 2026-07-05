"use server";

import bcrypt from "bcryptjs";
import crypto from "crypto";
import { isDbConfigured, prisma } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email/templates";
import type { AuthResult } from "@/lib/actions/auth";

const RESET_PREFIX = "password-reset:";
const RESET_TTL_MS = 60 * 60 * 1000;

export async function requestPasswordReset(
  email: string,
  locale = "en",
): Promise<AuthResult> {
  if (!isDbConfigured()) {
    return { success: false, error: "Database not configured." };
  }

  const normalized = email.trim().toLowerCase();
  if (!normalized) {
    return { success: false, error: "Email is required." };
  }

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
}

export async function resetPassword(data: {
  email: string;
  token: string;
  password: string;
}): Promise<AuthResult> {
  if (!isDbConfigured()) {
    return { success: false, error: "Database not configured." };
  }

  const normalized = data.email.trim().toLowerCase();
  const identifier = `${RESET_PREFIX}${normalized}`;

  if (data.password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters." };
  }

  const record = await prisma.verificationToken.findFirst({
    where: { identifier, token: data.token },
  });

  if (!record || record.expires < new Date()) {
    return { success: false, error: "This reset link is invalid or has expired." };
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  await prisma.user.update({
    where: { email: normalized },
    data: { passwordHash },
  });

  await prisma.verificationToken.deleteMany({ where: { identifier } });

  return { success: true };
}
