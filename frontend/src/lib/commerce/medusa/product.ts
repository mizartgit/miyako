import type { Work } from "@/lib/types";
import type {
  CommerceProduct,
  Currency,
  ProductCommerceState,
  ProductVariant,
  WorkMetadata,
} from "@miyako/shared";
import {
  medusaHandleForWork,
  mergeWorkDisplay,
  type MedusaWorkPayload,
  type ResolvedWorkDisplay,
} from "./merge-work";
import { isMedusaConfigured, medusaFetch } from "./client";

type MedusaPrice = {
  amount: number;
  currency_code: string;
};

type MedusaVariant = {
  id: string;
  title: string;
  manage_inventory?: boolean;
  inventory_quantity?: number;
  allow_backorder?: boolean;
  prices?: MedusaPrice[];
};

type MedusaProduct = MedusaWorkPayload["product"] & {
  variants?: MedusaVariant[];
};

type WorkApiResponse = {
  product: MedusaProduct;
  work: WorkMetadata | null;
};

function normalizeCurrency(code: string): Currency {
  const upper = code.toUpperCase();
  if (upper === "JPY" || upper === "USD" || upper === "EUR" || upper === "GBP") {
    return upper as Currency;
  }
  return "JPY";
}

function mapVariant(variant: MedusaVariant, currency: Currency): ProductVariant {
  const target = currency.toLowerCase();
  const price =
    variant.prices?.find((p) => p.currency_code.toLowerCase() === target) ??
    variant.prices?.find((p) => p.currency_code.toLowerCase() === "jpy") ??
    variant.prices?.[0];

  const qty = variant.inventory_quantity ?? null;
  const availableForSale =
    variant.allow_backorder ||
    !variant.manage_inventory ||
    (qty !== null && qty > 0);

  return {
    id: variant.id,
    title: variant.title,
    availableForSale,
    quantityAvailable: qty,
    priceAmount: price ? String(price.amount) : "0",
    priceCurrency: price ? normalizeCurrency(price.currency_code) : currency,
    selectedOptions: [],
  };
}

function mapCommerceProduct(
  product: MedusaProduct,
  currency: Currency,
): CommerceProduct | null {
  if (!product || product.status !== "published") return null;

  const variants = (product.variants ?? []).map((v) =>
    mapVariant(v, currency),
  );

  const firstVariant = variants[0];
  const availableForSale = variants.some((v) => v.availableForSale);

  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    availableForSale,
    priceAmount: firstVariant?.priceAmount ?? "0",
    priceCurrency: firstVariant?.priceCurrency ?? currency,
    variants,
  };
}

export async function fetchMedusaWorkPayload(
  handle: string,
): Promise<MedusaWorkPayload | null> {
  if (!isMedusaConfigured()) return null;

  try {
    const data = await medusaFetch<WorkApiResponse>(
      `/store/works/${encodeURIComponent(handle)}`,
    );
    if (!data.product) return null;
    return { product: data.product, work: data.work };
  } catch {
    return null;
  }
}

export async function fetchMedusaProduct(
  handle: string,
  currency: Currency = "JPY",
): Promise<CommerceProduct | null> {
  const payload = await fetchMedusaWorkPayload(handle);
  if (!payload) return null;
  return mapCommerceProduct(
    payload.product as MedusaProduct,
    currency,
  );
}

export function resolveProductCommerce(
  work: Work,
  medusaProduct: CommerceProduct | null,
): ProductCommerceState {
  if (medusaProduct) {
    const firstAvailable =
      medusaProduct.variants.find((v) => v.availableForSale) ??
      medusaProduct.variants[0];

    const priceJpy =
      medusaProduct.priceCurrency === "JPY"
        ? parseFloat(medusaProduct.priceAmount)
        : (work.priceJpy ?? 0);

    return {
      priceJpy,
      available: medusaProduct.availableForSale,
      quantityAvailable: firstAvailable?.quantityAvailable ?? null,
      variants: medusaProduct.variants,
      variantId: firstAvailable?.id ?? null,
      source: "medusa",
    };
  }

  return {
    priceJpy: work.priceJpy ?? 0,
    available: work.available ?? false,
    quantityAvailable: work.available ? 1 : 0,
    variants: [],
    variantId: null,
    source: "content",
  };
}

export async function getWorkCommerce(
  work: Work,
  currency: Currency = "JPY",
): Promise<ProductCommerceState> {
  const handle = medusaHandleForWork(work);
  const medusaProduct = await fetchMedusaProduct(handle, currency);
  return resolveProductCommerce(work, medusaProduct);
}

export async function getResolvedWorkDisplay(
  work: Work,
  locale: string,
): Promise<{
  display: ResolvedWorkDisplay;
  commerce: ProductCommerceState;
  payload: MedusaWorkPayload | null;
}> {
  const handle = medusaHandleForWork(work);
  const payload = await fetchMedusaWorkPayload(handle);
  const display = mergeWorkDisplay(work, payload, locale);
  const commerce = resolveProductCommerce(
    work,
    payload
      ? mapCommerceProduct(payload.product as MedusaProduct, "JPY")
      : null,
  );
  return { display, commerce, payload };
}

export type { MedusaWorkPayload, ResolvedWorkDisplay };
