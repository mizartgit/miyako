"use server";

import {
  createSelectionsCart,
  type SelectionCartLine,
} from "@/lib/commerce/medusa/checkout";
import {
  addShippingMethod,
  completeCart,
  initiateStripePaymentSession,
  listShippingOptions,
  retrieveCart,
  updateCart,
  type MedusaAddress,
} from "@/lib/commerce/medusa/cart";
import { isMedusaConfigured } from "@/lib/commerce/medusa/client";
import { isStripeConfigured } from "@/lib/commerce/stripe";

export type PrepareCheckoutInput = {
  cartId: string;
  email: string;
  shippingAddress: MedusaAddress;
  shippingOptionId?: string;
};

export type PrepareCheckoutResult =
  | {
      ok: true;
      cartTotal: number;
      currencyCode: string;
      shippingOptions: { id: string; name: string; amount: number }[];
      clientSecret: string;
    }
  | { ok: false; error: string };

/**
 * Begins checkout from the visitor's Selections.
 */
export async function startSelectionsCheckout(lines: SelectionCartLine[]) {
  return createSelectionsCart(lines);
}

/**
 * Updates cart contact/shipping, applies shipping method, and starts Stripe.
 */
export async function prepareStripeCheckout(
  input: PrepareCheckoutInput,
): Promise<PrepareCheckoutResult> {
  if (!isMedusaConfigured()) {
    return { ok: false, error: "Commerce backend is not configured." };
  }
  if (!isStripeConfigured()) {
    return {
      ok: false,
      error: "Stripe is not configured. Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.",
    };
  }

  try {
    await updateCart(input.cartId, {
      email: input.email,
      shipping_address: input.shippingAddress,
      billing_address: input.shippingAddress,
    });

    const shippingOptions = await listShippingOptions(input.cartId);
    if (shippingOptions.length === 0) {
      return {
        ok: false,
        error:
          "No shipping options are configured for your address. Add shipping in Medusa Admin → Settings → Locations.",
      };
    }

    const optionId =
      input.shippingOptionId &&
      shippingOptions.some((o) => o.id === input.shippingOptionId)
        ? input.shippingOptionId
        : shippingOptions[0].id;

    let cart = await addShippingMethod(input.cartId, optionId);

    if (!cart.total || cart.total <= 0) {
      return { ok: false, error: "Cart total must be greater than zero." };
    }

    cart = await initiateStripePaymentSession(cart);

    const clientSecret =
      cart.payment_collection?.payment_sessions?.find((s) =>
        s.provider_id.startsWith("pp_stripe"),
      )?.data?.client_secret;

    if (typeof clientSecret !== "string") {
      return {
        ok: false,
        error:
          "Could not start Stripe payment. Check STRIPE_API_KEY on the backend and enable Stripe in your Medusa region.",
      };
    }

    return {
      ok: true,
      cartTotal: cart.total ?? 0,
      currencyCode: cart.currency_code ?? "jpy",
      shippingOptions: shippingOptions.map((o) => ({
        id: o.id,
        name: o.name,
        amount: o.amount,
      })),
      clientSecret,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not prepare checkout.";
    return { ok: false, error: message };
  }
}

export type CompleteCheckoutResult =
  | { ok: true; orderId: string; displayId?: number }
  | { ok: false; error: string };

/** Completes the Medusa cart after Stripe confirms payment. */
export async function completeStripeCheckout(
  cartId: string,
): Promise<CompleteCheckoutResult> {
  if (!isMedusaConfigured()) {
    return { ok: false, error: "Commerce backend is not configured." };
  }

  try {
    const result = await completeCart(cartId);

    if (result.type === "order" && result.order?.id) {
      return {
        ok: true,
        orderId: result.order.id,
        displayId: result.order.display_id,
      };
    }

    const cartError = result.type === "cart" ? result.error?.message : undefined;
    return {
      ok: false,
      error: cartError ?? "Order could not be completed.",
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not complete order.";
    return { ok: false, error: message };
  }
}

/** Loads a cart for the checkout summary (server-side). */
export async function getCheckoutCart(cartId: string) {
  if (!isMedusaConfigured()) return null;
  try {
    return await retrieveCart(cartId);
  } catch {
    return null;
  }
}
