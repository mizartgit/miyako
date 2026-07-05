import type { Work } from "@/lib/types";
import type { WorkMetadata } from "@miyako/shared";

export type MedusaWorkPayload = {
  product: {
    id: string;
    handle: string;
    title: string;
    description?: string | null;
    thumbnail?: string | null;
    status: string;
    images?: { url: string }[];
  };
  work: WorkMetadata | null;
};

/** Gallery fields merged from Medusa (when present) over static content. */
export type ResolvedWorkDisplay = {
  title: string;
  titleJa: string | null;
  material: string;
  dimensions: string;
  technique: string | null;
  region: string | null;
  careInstructions: string | null;
  story: string;
  images: string[];
  metaDescription: string | null;
};

function imageUrls(
  product: MedusaWorkPayload["product"],
): string[] {
  const fromProduct = (product.images ?? [])
    .map((i) => i.url)
    .filter(Boolean);
  if (fromProduct.length) return fromProduct;
  if (product.thumbnail) return [product.thumbnail];
  return [];
}

export function mergeWorkDisplay(
  work: Work,
  payload: MedusaWorkPayload | null,
  locale: string,
): ResolvedWorkDisplay {
  const meta = payload?.work ?? null;
  const product = payload?.product;
  const medusaImages = product ? imageUrls(product) : [];

  const storyEn =
    meta?.storyEn ?? product?.description ?? work.story;
  const storyJa = meta?.storyJa ?? work.storyJa;

  return {
    title: meta?.titleEn ?? product?.title ?? work.title,
    titleJa: meta?.titleJa ?? work.titleJa ?? null,
    material: meta?.materials ?? work.material,
    dimensions: meta?.dimensions ?? work.dimensions,
    technique: meta?.technique ?? work.technique ?? null,
    region: meta?.region ?? work.region ?? null,
    careInstructions:
      meta?.careInstructions ?? work.careInstructions ?? null,
    story: locale === "ja" && storyJa ? storyJa : storyEn,
    images: medusaImages.length ? medusaImages : work.images,
    metaDescription: meta?.metaDescription ?? null,
  };
}

export function medusaHandleForWork(work: Work): string {
  return work.medusaHandle ?? work.slug;
}
