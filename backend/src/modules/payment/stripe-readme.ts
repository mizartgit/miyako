/**
 * Stripe payment integration — prepared for Phase 2.
 *
 * When STRIPE_API_KEY is set in backend/.env, medusa-config.ts
 * automatically registers @medusajs/medusa/payment-stripe.
 *
 * Next steps (Phase 2):
 * 1. Create Stripe account + enable Payment Intents
 * 2. Set STRIPE_API_KEY and STRIPE_WEBHOOK_SECRET in backend/.env
 * 3. Register webhook: POST /hooks/payment/stripe_stripe
 * 4. Frontend checkout page completes payment session via Medusa Store API
 *
 * @see https://docs.medusajs.com/resources/commerce-modules/payment/payment-provider/stripe
 */

export const STRIPE_PHASE = 2;
