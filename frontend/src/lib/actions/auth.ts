"use server";

import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "@/lib/email/templates";
import { isDbConfigured, prisma } from "@/lib/db";

export type AuthResult =
  | { success: true }
  | { success: false; error: string };

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResult> {
  if (!isDbConfigured()) {
    return {
      success: false,
      error: "Account registration requires a database connection.",
    };
  }

  const { name, email, password } = data;

  if (!name.trim() || !email.trim() || !password) {
    return { success: false, error: "All fields are required." };
  }

  if (password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: "Please enter a valid email address." };
  }

  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existing) {
    return { success: false, error: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name: name.trim(),
      email: email.toLowerCase(),
      passwordHash,
      notificationPrefs: { create: {} },
    },
  });

  void sendWelcomeEmail({ name: name.trim(), email: email.toLowerCase() });

  return { success: true };
}

export async function updateProfile(data: {
  userId: string;
  name: string;
  locale: string;
  currency: string;
}): Promise<AuthResult> {
  if (!isDbConfigured()) {
    return { success: false, error: "Database not configured." };
  }

  await prisma.user.update({
    where: { id: data.userId },
    data: {
      name: data.name.trim(),
      locale: data.locale,
      currency: data.currency,
    },
  });

  return { success: true };
}

export async function updateNotificationPrefs(data: {
  userId: string;
  orderUpdates: boolean;
  shippingUpdates: boolean;
  selectionReminders: boolean;
  marketing: boolean;
}): Promise<AuthResult> {
  if (!isDbConfigured()) {
    return { success: false, error: "Database not configured." };
  }

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
}

export async function deleteAccount(userId: string): Promise<AuthResult> {
  if (!isDbConfigured()) {
    return { success: false, error: "Database not configured." };
  }

  await prisma.user.delete({ where: { id: userId } });
  return { success: true };
}
