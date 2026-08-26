import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { updateRegionsWorkflow } from "@medusajs/medusa/core-flows";

/** Medusa Stripe module id `stripe` → provider `pp_stripe_stripe`. */
const STRIPE_PROVIDER = "pp_stripe_stripe";

/**
 * Enables Stripe on every JPY region when STRIPE_API_KEY is configured.
 * Safe to re-run — replaces the region's payment provider list.
 *
 * Run: npx medusa exec ./src/scripts/ensure-stripe-region.ts
 */
export default async function ensureStripeRegion({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

  if (!process.env.STRIPE_API_KEY) {
    logger.info(
      "[miyako] STRIPE_API_KEY not set — skipping Stripe region setup.",
    );
    return;
  }

  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "currency_code", "name"],
  });

  const jpyRegions = regions.filter((r) => r.currency_code === "jpy");
  if (jpyRegions.length === 0) {
    throw new Error("No JPY region found. Run seed-miyako-works first.");
  }

  for (const region of jpyRegions) {
    await updateRegionsWorkflow(container).run({
      input: {
        selector: { id: region.id },
        update: {
          payment_providers: ["pp_system_default", STRIPE_PROVIDER],
        },
      },
    });
    logger.info(
      `[miyako] Stripe enabled on region: ${region.name ?? region.id}`,
    );
  }
}
