"use server";

import { getTranslations } from "next-intl/server";
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

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.INQUIRY_EMAIL ?? "hello@miyako.art";

  const subject = `[MIYAKO Inquiry] ${inquiryType}${workSlug ? ` — ${workSlug}` : ""}${artistSlug ? ` — ${artistSlug}` : ""}`;

  const body = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Country: ${country || "Not provided"}`,
    `Type: ${inquiryType}`,
    workSlug ? `Work: ${workSlug}` : null,
    artistSlug ? `Artist: ${artistSlug}` : null,
    "",
    "Message:",
    message,
  ]
    .filter(Boolean)
    .join("\n");

  if (apiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "MIYAKO <onboarding@resend.dev>",
          to: [toEmail],
          reply_to: email,
          subject,
          text: body,
        }),
      });

      if (!res.ok) {
        return { success: false, error: t("errorSend") };
      }

      return { success: true, method: "email" };
    } catch {
      return { success: false, error: t("errorSend") };
    }
  }

  return { success: true, method: "mailto" };
}
