export function getStripePublishableKey(): string {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
}

export function isStripeConfigured(): boolean {
  return Boolean(getStripePublishableKey());
}
