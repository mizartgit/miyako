export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export function getEmailFrom(): string {
  return process.env.RESEND_FROM_EMAIL ?? "MIYAKO <onboarding@resend.dev>";
}

export function getSiteUrl(): string {
  return process.env.AUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3003";
}

export function getInquiryEmail(): string {
  return process.env.INQUIRY_EMAIL ?? "hello@miyako.art";
}
