/**
 * A single work a visitor has added to their Selections — MIYAKO's curated,
 * gallery-style pre-checkout collection (the single pre-purchase experience).
 *
 * Guests persist these in localStorage; signed-in visitors sync them to the
 * database. Only the `workSlug`, `variantId`, and `quantity` are authoritative;
 * the remaining display fields are a convenience snapshot resolved from content.
 */
export type SelectionItem = {
  workSlug: string;
  /** Medusa variant id — required to convert into a cart at checkout. */
  variantId: string | null;
  quantity: number;
  title: string;
  titleJa: string | null;
  /** Price in JPY. 0 means "price on request" (no commerce variant). */
  priceJpy: number;
  image: string;
  available: boolean;
  material?: string;
  dimensions?: string;
};

/** Minimal payload persisted server-side; display fields are re-derived. */
export type SelectionRecord = {
  workSlug: string;
  variantId: string | null;
  quantity: number;
};

export const MAX_SELECTION_QUANTITY = 10;
export const SELECTIONS_STORAGE_KEY = "miyako.selections.v1";
