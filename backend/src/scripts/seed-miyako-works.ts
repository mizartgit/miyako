import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createProductsWorkflow,
  createRegionsWorkflow,
  createTaxRegionsWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";
import fs from "fs";
import path from "path";

/**
 * Seeds every work from frontend/content/works.json as a Medusa product.
 *
 * Handle = work.medusaHandle ?? work.slug (matches storefront lookups).
 * Product title, description, images, price, and metadata mirror the site.
 * Idempotent: skips handles that already exist.
 *
 * Run:  npx medusa exec ./src/scripts/seed-miyako-works.ts
 */

type ContentWork = {
  slug: string;
  artistSlug: string;
  title: string;
  titleJa?: string;
  material: string;
  dimensions: string;
  story: string;
  storyJa?: string;
  images: string[];
  medusaHandle?: string;
  priceJpy?: number;
  available?: boolean;
  technique?: string;
  region?: string;
  careInstructions?: string;
  featured?: boolean;
};

type ContentArtist = {
  slug: string;
  name: string;
  nameJa?: string;
  region: string;
  craft: string;
};

function loadJson<T>(relativePath: string): T {
  const filePath = path.join(__dirname, relativePath);
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
}

function parseRegion(region?: string): { region: string; country: string } {
  if (!region) return { region: "Asia", country: "Japan" };
  const parts = region.split(",").map((s) => s.trim());
  if (parts.length >= 2) {
    return { region: parts[0], country: parts[parts.length - 1] };
  }
  return { region, country: "Japan" };
}

function toSku(handle: string): string {
  return `MIYAKO-${handle.replace(/-/g, "-").toUpperCase()}`;
}

function buildWorkSeed(
  work: ContentWork,
  artists: Map<string, ContentArtist>,
): {
  handle: string;
  title: string;
  description: string;
  priceJpy: number;
  sku: string;
  images: string[];
  metadata: Record<string, unknown>;
} {
  const artist = artists.get(work.artistSlug);
  const handle = work.medusaHandle ?? work.slug;
  const { region, country } = parseRegion(work.region ?? artist?.region);
  const priceJpy = work.priceJpy ?? 180000;
  const hasExplicitPrice = work.priceJpy != null;

  return {
    handle,
    title: work.title,
    description: work.story,
    priceJpy,
    sku: toSku(handle),
    images: work.images,
    metadata: {
      titleEn: work.title,
      titleJa: work.titleJa ?? work.title,
      artistSlug: work.artistSlug,
      artistName: artist?.name ?? work.artistSlug,
      artistNameJa: artist?.nameJa,
      region,
      country,
      technique: work.technique ?? artist?.craft ?? "",
      materials: work.material,
      dimensions: work.dimensions,
      storyEn: work.story,
      storyJa: work.storyJa,
      oneOfAKind: true,
      madeToOrder: !hasExplicitPrice,
      careInstructions: work.careInstructions,
      metaDescription: work.story.slice(0, 160),
      contentSlug: work.slug,
    },
  };
}

export default async function seedMiyakoWorks({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const works = loadJson<ContentWork[]>("../../../frontend/content/works.json");
  const artistsList = loadJson<ContentArtist[]>(
    "../../../frontend/content/artists.json",
  );
  const artists = new Map(artistsList.map((a) => [a.slug, a]));
  const WORKS = works.map((w) => buildWorkSeed(w, artists));

  logger.info(`[miyako] Loaded ${WORKS.length} works from content catalog.`);

  logger.info("[miyako] Ensuring store supports JPY...");
  const { data: storeRows } = await query.graph({
    entity: "store",
    fields: [
      "id",
      "supported_currencies.currency_code",
      "supported_currencies.is_default",
    ],
  });
  const store = storeRows[0];
  if (!store) {
    throw new Error("No store found. Run the initial seed first.");
  }
  const currencies = (store.supported_currencies ?? []) as {
    currency_code: string;
    is_default?: boolean;
  }[];
  const hasJpy = currencies.some((c) => c.currency_code === "jpy");
  if (!hasJpy) {
    const nextCurrencies = currencies.map((c) => ({
      currency_code: c.currency_code,
      is_default: Boolean(c.is_default),
    }));
    if (!nextCurrencies.some((c) => c.is_default) && nextCurrencies.length) {
      nextCurrencies[0].is_default = true;
    }
    nextCurrencies.push({ currency_code: "jpy", is_default: false });

    await updateStoresWorkflow(container).run({
      input: {
        selector: { id: store.id },
        update: { supported_currencies: nextCurrencies },
      },
    });
    logger.info("[miyako] Added JPY to store currencies.");
  }

  logger.info("[miyako] Resolving sales channel, shipping profile, region...");
  const { data: salesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name"],
  });
  const defaultSalesChannel =
    salesChannels.find((s) => s.name === "Default Sales Channel") ??
    salesChannels[0];
  if (!defaultSalesChannel) {
    throw new Error("No sales channel found. Run the initial seed first.");
  }

  const { data: shippingProfiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  });
  const shippingProfile = shippingProfiles[0];

  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "currency_code", "name"],
  });
  let jpRegion = regions.find((r) => r.currency_code === "jpy");
  if (!jpRegion) {
    const { result } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "Japan",
            currency_code: "jpy",
            countries: ["jp"],
            payment_providers: ["pp_system_default"],
          },
        ],
      },
    });
    jpRegion = result[0];
    await createTaxRegionsWorkflow(container).run({
      input: [{ country_code: "jp", provider_id: "tp_system" }],
    });
    logger.info("[miyako] Created Japan (JPY) region.");
  }

  const { data: existingProducts } = await query.graph({
    entity: "product",
    fields: ["handle"],
  });
  const existingHandles = new Set(existingProducts.map((p) => p.handle));
  const toCreate = WORKS.filter((w) => !existingHandles.has(w.handle));

  if (toCreate.length === 0) {
    logger.info("[miyako] All works already exist in Medusa. Nothing to create.");
    return;
  }

  logger.info(`[miyako] Creating ${toCreate.length} work product(s)...`);
  await createProductsWorkflow(container).run({
    input: {
      products: toCreate.map((w) => ({
        title: w.title,
        handle: w.handle,
        description: w.description,
        status: ProductStatus.PUBLISHED,
        shipping_profile_id: shippingProfile?.id,
        metadata: w.metadata,
        images: w.images.map((url) => ({ url })),
        options: [{ title: "Edition", values: ["Unique"] }],
        variants: [
          {
            title: "Unique",
            sku: w.sku,
            manage_inventory: false,
            options: { Edition: "Unique" },
            prices: [{ amount: w.priceJpy, currency_code: "jpy" }],
          },
        ],
        sales_channels: [{ id: defaultSalesChannel.id }],
      })),
    },
  });

  logger.info("[miyako] Done. All catalog works are now in Medusa Admin.");
}
