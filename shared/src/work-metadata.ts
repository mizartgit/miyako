import { z } from "zod";

/**
 * MIYAKO "Work" metadata stored on Medusa Product.metadata.
 * Admin enters these fields when creating a product in Medusa Admin.
 * The frontend gallery still uses content/works.json for storytelling;
 * commerce fields (price, inventory) come from Medusa.
 */
export const workMetadataSchema = z.object({
  /** English title (mirrors product.title; kept for bilingual display) */
  titleEn: z.string(),
  /** Japanese title — always shown alongside English on the site */
  titleJa: z.string(),
  /** Slug reference to content/artists.json */
  artistSlug: z.string(),
  artistName: z.string(),
  artistNameJa: z.string().optional(),
  region: z.string(),
  country: z.string(),
  technique: z.string(),
  materials: z.string(),
  dimensions: z.string(),
  weight: z.string().optional(),
  storyEn: z.string(),
  storyJa: z.string().optional(),
  oneOfAKind: z.boolean().default(false),
  madeToOrder: z.boolean().default(false),
  estimatedProductionDays: z.number().int().positive().optional(),
  collectionHandle: z.string().optional(),
  categoryHandle: z.string().optional(),
  metaDescription: z.string().optional(),
  careInstructions: z.string().optional(),
  /** Future fields — optional until needed */
  exhibitionHistory: z.string().optional(),
  provenance: z.string().optional(),
  authenticityCertificate: z.string().optional(),
  videoUrl: z.string().url().optional(),
});

export type WorkMetadata = z.infer<typeof workMetadataSchema>;

/** Keys used in Medusa product.metadata (flat JSON). */
export const WORK_METADATA_KEYS = [
  "titleEn",
  "titleJa",
  "artistSlug",
  "artistName",
  "artistNameJa",
  "region",
  "country",
  "technique",
  "materials",
  "dimensions",
  "weight",
  "storyEn",
  "storyJa",
  "oneOfAKind",
  "madeToOrder",
  "estimatedProductionDays",
  "collectionHandle",
  "categoryHandle",
  "metaDescription",
  "careInstructions",
] as const;

export function parseWorkMetadata(
  metadata: Record<string, unknown> | null | undefined,
): WorkMetadata | null {
  if (!metadata) return null;
  const parsed = workMetadataSchema.safeParse(metadata);
  return parsed.success ? parsed.data : null;
}
