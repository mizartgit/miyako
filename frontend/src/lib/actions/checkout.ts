"use server";

import {
  createSelectionsCart,
  type SelectionCartLine,
} from "@/lib/commerce/medusa/checkout";
import { getTranslations } from "next-intl/server";
import {
  addShippingMethod,
  completeCart,
  initiateStripePaymentSession,
  listShippingOptions,
  moneyAmount,
  retrieveCart,
  updateCart,
  type MedusaAddress,
  type MedusaCart,
} from "@/lib/commerce/medusa/cart";
import { isMedusaConfigured } from "@/lib/commerce/medusa/client";
import { isStripeConfigured } from "@/lib/commerce/stripe";
import { auth } from "@/auth";
import { isDbConfigured, prisma } from "@/lib/db";

export type PrepareCheckoutInput = {
  cartId: string;
  email: string;
  shippingAddress: MedusaAddress;
  shippingOptionId?: string;
};

export type CheckoutQuote = {
  currencyCode: string;
  subtotal: number;
  shippingAmount: number;
  shippingName: string;
  total: number;
};

export type PrepareCheckoutResult =
  | ({
      ok: true;
      cartTotal: number;
      currencyCode: string;
      shippingOptions: { id: string; name: string; amount: number }[];
      clientSecret: string;
    } & CheckoutQuote)
  | { ok: false; error: string };

function quoteFromCart(
  cart: MedusaCart,
  selectedName: string,
  selectedAmount: number,
): CheckoutQuote {
  const currencyCode = (cart.currency_code ?? "jpy").toUpperCase();
  const shippingAmount =
    cart.shipping_total == null
      ? moneyAmount(selectedAmount)
      : moneyAmount(cart.shipping_total);
  const total = moneyAmount(cart.total);
  const subtotalFromCart = moneyAmount(cart.item_subtotal);
  const subtotal =
    subtotalFromCart > 0 ? subtotalFromCart : Math.max(0, total - shippingAmount);
  const method = cart.shipping_methods?.[0];
  const shippingName =
    method?.name ||
    method?.shipping_option?.name ||
    selectedName;

  return {
    currencyCode,
    subtotal,
    shippingAmount,
    shippingName,
    total,
  };
}

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
  const t = await getTranslations("checkout");

  if (!isMedusaConfigured()) {
    return { ok: false, error: t("commerceNotConfigured") };
  }
  if (!isStripeConfigured()) {
    return { ok: false, error: t("stripeNotConfigured") };
  }

  try {
    await updateCart(input.cartId, {
      email: input.email,
      shipping_address: input.shippingAddress,
      billing_address: input.shippingAddress,
    });

    const shippingOptions = await listShippingOptions(input.cartId);
    if (shippingOptions.length === 0) {
      return { ok: false, error: t("shippingUnavailable") };
    }

    const selected =
      (input.shippingOptionId
        ? shippingOptions.find((o) => o.id === input.shippingOptionId)
        : undefined) ?? shippingOptions[0];

    if (!selected) {
      return { ok: false, error: t("shippingUnavailable") };
    }

    let cart = await addShippingMethod(input.cartId, selected.id);

    if (moneyAmount(cart.total) <= 0) {
      return { ok: false, error: t("totalRequired") };
    }

    cart = await initiateStripePaymentSession(cart);

    const clientSecret =
      cart.payment_collection?.payment_sessions?.find((s) =>
        s.provider_id.startsWith("pp_stripe"),
      )?.data?.client_secret;

    if (typeof clientSecret !== "string") {
      return { ok: false, error: t("paymentFailed") };
    }

    const quote = quoteFromCart(cart, selected.name, moneyAmount(selected.amount));

    return {
      ok: true,
      ...quote,
      cartTotal: quote.total,
      shippingOptions: shippingOptions.map((o) => ({
        id: o.id,
        name: o.name,
        amount: moneyAmount(o.amount),
      })),
      clientSecret,
    };
  } catch {
    return { ok: false, error: t("prepareFailed") };
  }
}

export type CompleteCheckoutResult =
  | { ok: true; orderId: string; displayId?: number }
  | { ok: false; error: string };

type CompletedOrder = Extract<
  Awaited<ReturnType<typeof completeCart>>,
  { type: "order" }
>["order"];

/**
 * Records the order in OrderMirror for Order History. Signed-in orders carry
 * the user's id; guest orders keep userId null. Never throws — the payment has
 * already succeeded, so a mirror failure must not surface as a checkout error.
 */
async function mirrorOrder(order: CompletedOrder): Promise<void> {
  if (!isDbConfigured()) return;

  try {
    const session = await auth();
    const currency = (order.currency_code ?? "jpy").toUpperCase();

    await prisma.orderMirror.upsert({
      where: { medusaOrderId: order.id },
      create: {
        medusaOrderId: order.id,
        medusaDisplayId:
          order.display_id != null ? String(order.display_id) : null,
        userId: session?.user?.id ?? null,
        customerEmail: order.email ?? null,
        status: "PENDING",
        totalJpy: currency === "JPY" ? Math.round(moneyAmount(order.total)) : null,
        currency,
      },
      update: {},
    });
  } catch (err) {
    console.error(
      `[checkout] OrderMirror sync failed for ${order.id}:`,
      err instanceof Error ? err.message : err,
    );
  }
}

/** Completes the Medusa cart after Stripe confirms payment. */
export async function completeStripeCheckout(
  cartId: string,
): Promise<CompleteCheckoutResult> {
  const t = await getTranslations("checkout");

  if (!isMedusaConfigured()) {
    return { ok: false, error: t("commerceNotConfigured") };
  }

  try {
    const result = await completeCart(cartId);

    if (result.type === "order" && result.order?.id) {
      await mirrorOrder(result.order);
      return {
        ok: true,
        orderId: result.order.id,
        displayId: result.order.display_id,
      };
    }

    const cartError = result.type === "cart" ? result.error?.message : undefined;
    return {
      ok: false,
      error: cartError ?? t("completeFailed"),
    };
  } catch {
    return { ok: false, error: t("completeFailed") };
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
