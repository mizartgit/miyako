"use server";

import {
  createSelectionsCart,
  type SelectionCartLine,
} from "@/lib/commerce/medusa/checkout";

/**
 * Begins checkout from the visitor's Selections. Purchasing only starts here —
 * there is no direct purchase from an individual work page. This reuses the
 * existing Medusa cart integration unchanged.
 */
export async function startSelectionsCheckout(lines: SelectionCartLine[]) {
  return createSelectionsCart(lines);
}
