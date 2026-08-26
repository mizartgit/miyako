/**
 * Stripe payment integration for MIYAKO checkout.
 *
 * Backend (Medusa):
 * 1. Set STRIPE_API_KEY and STRIPE_WEBHOOK_SECRET in backend/.env
 * 2. Restart Medusa — medusa-config.ts registers @medusajs/medusa/payment-stripe
 * 3. Run: npx medusa exec ./src/scripts/ensure-stripe-region.ts
 * 4. Register Stripe webhook → POST {MEDUSA_URL}/hooks/payment/stripe_stripe
 *    Events: payment_intent.succeeded, payment_intent.amount_capturable_updated,
 *            payment_intent.payment_failed
 *
 * Frontend (Next.js):
 * 1. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in frontend/.env.local and Vercel
 * 2. Checkout flow: shipping form → Stripe Payment Element → order complete
 *
 * @see https://docs.medusajs.com/resources/commerce-modules/payment/payment-provider/stripe
 */

export const STRIPE_SETUP = "active";
