import type { CheckoutResult } from "@miyako/shared";
import { getMedusaBackendUrl, isMedusaConfigured, medusaFetch } from "./client";

type CartResponse = {
  cart: { id: string };
};

type RegionsResponse = {
  regions: { id: string; currency_code: string }[];
};

/**
 * Resolves the region whose currency matches the store display currency (JPY),
 * falling back to the first available region. A cart must carry a region so its
 * line items can be priced in a currency the variant has a price for.
 */
async function resolveRegionId(
  currency: string = "jpy",
): Promise<string | null> {
  try {
    const { regions } = await medusaFetch<RegionsResponse>("/store/regions");
    const match = regions.find(
      (r) => r.currency_code.toLowerCase() === currency.toLowerCase(),
    );
    return (match ?? regions[0])?.id ?? null;
  } catch {
    return null;
  }
}

export type SelectionCartLine = {
  variantId: string;
  quantity: number;
};

/**
 * Converts the visitor's Selections into a Medusa cart. This reuses the exact
 * cart-creation flow the direct Buy button used previously — only now it can
 * carry multiple line items, one per selected work.
 */
export async function createSelectionsCart(
  lines: SelectionCartLine[],
): Promise<CheckoutResult> {
  if (!isMedusaConfigured()) {
    return { error: "Commerce backend is not configured." };
  }

  const items = lines
    .filter((l) => l.variantId)
    .map((l) => ({ variant_id: l.variantId, quantity: l.quantity }));

  if (items.length === 0) {
    return { error: "No purchasable works in your selections." };
  }

  try {
    const regionId = await resolveRegionId("jpy");

    const { cart } = await medusaFetch<CartResponse>("/store/carts", {
      method: "POST",
      body: {
        ...(regionId ? { region_id: regionId } : {}),
        items,
      },
    });

    const checkoutPath = `/checkout?cart_id=${cart.id}`;
    return { checkoutPath, cartId: cart.id };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not start checkout.";
    return { error: message };
  }
}

export function getMedusaCheckoutUrl(cartId: string): string {
  return `${getMedusaBackendUrl()}/checkout?cart_id=${cartId}`;
}
