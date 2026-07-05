import { getSiteUrl } from "./config";
import {
  emailButton,
  emailDivider,
  emailHeading,
  emailLayout,
} from "./layout";
import { sendEmail } from "./send";

export async function sendWelcomeEmail(data: {
  name: string;
  email: string;
}) {
  const siteUrl = getSiteUrl();

  const body = `
    ${emailHeading(`Welcome, ${data.name}`)}
    <p style="margin:0 0 16px;">Your MIYAKO account is ready. Curate works into your selections, track orders, and explore exceptional craftsmanship from independent artisans across Asia.</p>
    ${emailButton(`${siteUrl}/en/account`, "View your account")}
    ${emailDivider()}
    <p style="margin:0;font-size:13px;color:rgba(42,40,38,0.65);">If you did not create this account, you can safely ignore this email.</p>
  `;

  return sendEmail({
    to: data.email,
    subject: "Welcome to MIYAKO",
    html: emailLayout({ preheader: "Your MIYAKO account is ready.", body }),
    text: `Welcome to MIYAKO, ${data.name}. Visit ${siteUrl}/en/account to get started.`,
  });
}

export async function sendInquiryConfirmationEmail(data: {
  name: string;
  email: string;
}) {
  const body = `
    ${emailHeading("We received your inquiry")}
    <p style="margin:0 0 16px;">Thank you, ${data.name}. We have received your message and will respond within 48 hours with next steps.</p>
    <p style="margin:0;font-size:13px;color:rgba(42,40,38,0.65);">Each piece on MIYAKO is made to order or uniquely one-of-a-kind. We appreciate your patience.</p>
  `;

  return sendEmail({
    to: data.email,
    subject: "Your inquiry — MIYAKO",
    html: emailLayout({
      preheader: "We received your inquiry and will respond soon.",
      body,
    }),
    text: `Thank you, ${data.name}. We received your inquiry and will respond within 48 hours.`,
  });
}

export async function sendInquiryNotificationEmail(data: {
  name: string;
  email: string;
  country?: string;
  inquiryType: string;
  message: string;
  workSlug?: string;
  artistSlug?: string;
  toEmail: string;
}) {
  const details = [
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Country: ${data.country || "Not provided"}`,
    `Type: ${data.inquiryType}`,
    data.workSlug ? `Work: ${data.workSlug}` : null,
    data.artistSlug ? `Artist: ${data.artistSlug}` : null,
    "",
    "Message:",
    data.message,
  ]
    .filter(Boolean)
    .join("\n");

  const body = `
    ${emailHeading("New inquiry")}
    <p style="margin:0 0 16px;white-space:pre-wrap;font-size:14px;line-height:1.8;">${details.replace(/\n/g, "<br />")}</p>
  `;

  return sendEmail({
    to: data.toEmail,
    subject: `[MIYAKO Inquiry] ${data.inquiryType}${data.workSlug ? ` — ${data.workSlug}` : ""}`,
    html: emailLayout({ preheader: "New inquiry from MIYAKO.", body }),
    text: details,
    replyTo: data.email,
  });
}

export async function sendPasswordResetEmail(data: {
  email: string;
  token: string;
  locale?: string;
}) {
  const siteUrl = getSiteUrl();
  const locale = data.locale ?? "en";
  const resetUrl = `${siteUrl}/${locale}/reset-password?token=${encodeURIComponent(data.token)}&email=${encodeURIComponent(data.email)}`;

  const body = `
    ${emailHeading("Reset your password")}
    <p style="margin:0 0 16px;">We received a request to reset the password for your MIYAKO account. This link expires in one hour.</p>
    ${emailButton(resetUrl, "Reset password")}
    ${emailDivider()}
    <p style="margin:0;font-size:13px;color:rgba(42,40,38,0.65);">If you did not request this, you can safely ignore this email.</p>
  `;

  return sendEmail({
    to: data.email,
    subject: "Reset your password — MIYAKO",
    html: emailLayout({ preheader: "Reset your MIYAKO password.", body }),
    text: `Reset your password: ${resetUrl}`,
  });
}

export async function sendOrderConfirmationEmail(data: {
  email: string;
  name?: string;
  orderName: string;
  total: string;
  currency: string;
  locale?: string;
}) {
  const siteUrl = getSiteUrl();
  const locale = data.locale ?? "en";
  const greeting = data.name ? `Thank you, ${data.name}.` : "Thank you.";

  const body = `
    ${emailHeading("Order confirmed")}
    <p style="margin:0 0 16px;">${greeting} Your order <strong>${data.orderName}</strong> has been confirmed.</p>
    <p style="margin:0 0 8px;font-size:14px;"><span style="color:#8a7344;text-transform:uppercase;letter-spacing:0.15em;font-size:10px;">Total</span><br />${data.total} ${data.currency}</p>
    ${emailButton(`${siteUrl}/${locale}/account/orders`, "View your orders")}
    ${emailDivider()}
    <p style="margin:0;font-size:13px;color:rgba(42,40,38,0.65);">Shipping and duties, if applicable, are calculated at checkout. You will receive a separate email when your piece ships.</p>
  `;

  return sendEmail({
    to: data.email,
    subject: `Order confirmed — ${data.orderName}`,
    html: emailLayout({
      preheader: `Your order ${data.orderName} is confirmed.`,
      body,
    }),
    text: `${greeting} Order ${data.orderName} confirmed. Total: ${data.total} ${data.currency}.`,
  });
}

export async function sendShippingConfirmationEmail(data: {
  email: string;
  name?: string;
  orderName: string;
  trackingUrl?: string;
  trackingNumber?: string;
  locale?: string;
}) {
  const siteUrl = getSiteUrl();
  const locale = data.locale ?? "en";
  const greeting = data.name ? `${data.name}, your` : "Your";

  const trackingBlock = data.trackingUrl
    ? emailButton(data.trackingUrl, "Track shipment")
    : data.trackingNumber
      ? `<p style="margin:16px 0 0;font-size:14px;"><span style="color:#8a7344;text-transform:uppercase;letter-spacing:0.15em;font-size:10px;">Tracking</span><br />${data.trackingNumber}</p>`
      : "";

  const body = `
    ${emailHeading("Your piece is on its way")}
    <p style="margin:0 0 16px;">${greeting} order <strong>${data.orderName}</strong> has shipped. Each work arrives with its story and provenance.</p>
    ${trackingBlock}
    ${emailButton(`${siteUrl}/${locale}/account/orders`, "View order status")}
  `;

  return sendEmail({
    to: data.email,
    subject: `Shipped — ${data.orderName}`,
    html: emailLayout({
      preheader: `Your order ${data.orderName} has shipped.`,
      body,
    }),
    text: `${greeting} order ${data.orderName} has shipped.${data.trackingUrl ? ` Track: ${data.trackingUrl}` : ""}`,
  });
}
