import { getEmailFrom, isEmailConfigured } from "./config";

export type SendEmailOptions = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

export async function sendEmail(
  options: SendEmailOptions,
): Promise<{ success: true } | { success: false; error: string }> {
  if (!isEmailConfigured()) {
    return { success: false, error: "Email is not configured." };
  }

  const to = Array.isArray(options.to) ? options.to : [options.to];

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: getEmailFrom(),
        to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        reply_to: options.replyTo,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("[email] Resend error:", detail);
      return { success: false, error: "Failed to send email." };
    }

    return { success: true };
  } catch (err) {
    console.error("[email] Send failed:", err);
    return { success: false, error: "Failed to send email." };
  }
}
