"use server";

import { getTranslations } from "next-intl/server";
import { getInquiryEmail } from "@/lib/email/config";
import {
  sendInquiryConfirmationEmail,
  sendInquiryNotificationEmail,
} from "@/lib/email/templates";
import { isEmailConfigured } from "@/lib/email/config";
import type { InquiryFormData } from "@/lib/types";

export type InquiryResult =
  | { success: true; method: "email" | "mailto" }
  | { success: false; error: string };

export async function submitInquiry(
  data: InquiryFormData,
): Promise<InquiryResult> {
  const t = await getTranslations("contact");
  const { name, email, country, inquiryType, message, workSlug, artistSlug } =
    data;

  if (!name.trim() || !email.trim() || !message.trim()) {
    return { success: false, error: t("errorRequired") };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: t("errorEmail") };
  }

  const toEmail = getInquiryEmail();

  if (isEmailConfigured()) {
    const [notifyResult, confirmResult] = await Promise.all([
      sendInquiryNotificationEmail({
        name,
        email,
        country,
        inquiryType,
        message,
        workSlug,
        artistSlug,
        toEmail,
      }),
      sendInquiryConfirmationEmail({ name, email }),
    ]);

    if (!notifyResult.success) {
      return { success: false, error: t("errorSend") };
    }

    if (!confirmResult.success) {
      console.warn("[inquiry] Confirmation email failed:", confirmResult.error);
    }

    return { success: true, method: "email" };
  }

  return { success: true, method: "mailto" };
}
