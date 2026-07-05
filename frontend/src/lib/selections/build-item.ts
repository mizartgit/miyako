import type { Work } from "@/lib/types";
import type { ProductCommerceState } from "@miyako/shared";
import type { ResolvedWorkDisplay } from "@/lib/commerce/medusa/merge-work";
import {
  MAX_SELECTION_QUANTITY,
  type SelectionItem,
} from "@/lib/selections/types";

function clampQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return 1;
  return Math.min(MAX_SELECTION_QUANTITY, Math.max(1, Math.round(quantity)));
}

export function buildSelectionItem(
  work: Work,
  display: ResolvedWorkDisplay,
  commerce: ProductCommerceState,
  quantity: number,
  variantIdOverride?: string | null,
): SelectionItem {
  const variantId =
    variantIdOverride ?? commerce.variantId ?? null;

  return {
    workSlug: work.slug,
    variantId,
    quantity: clampQuantity(quantity),
    title: display.title,
    titleJa: display.titleJa,
    priceJpy: commerce.priceJpy,
    image: display.images[0] ?? "",
    available: commerce.available,
    material: display.material,
    dimensions: display.dimensions,
  };
}
