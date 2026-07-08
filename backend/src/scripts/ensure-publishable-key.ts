import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
} from "@medusajs/framework/utils";
import {
  createApiKeysWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
} from "@medusajs/medusa/core-flows";

/**
 * Ensures a publishable Store API key exists and prints its token.
 * Safe to re-run — skips creation when a key titled "MIYAKO Storefront" exists.
 *
 * Run: npx medusa exec ./src/scripts/ensure-publishable-key.ts
 */
export default async function ensurePublishableKey({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const { data: existingKeys } = await query.graph({
    entity: "api_key",
    fields: ["id", "title", "type", "token"],
    filters: { type: "publishable" },
  });

  const titled = existingKeys.find((k) => k.title === "MIYAKO Storefront");
  if (titled?.token) {
    logger.info(`PUBLISHABLE_API_KEY=${titled.token}`);
    return;
  }

  const { data: salesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name"],
  });
  const salesChannel =
    salesChannels.find((s) => s.name === "Default Sales Channel") ??
    salesChannels[0];

  if (!salesChannel) {
    throw new Error("No sales channel found. Run migrations first.");
  }

  const {
    result: [publishableApiKey],
  } = await createApiKeysWorkflow(container).run({
    input: {
      api_keys: [
        {
          title: "MIYAKO Storefront",
          type: "publishable",
          created_by: "",
        },
      ],
    },
  });

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [salesChannel.id],
    },
  });

  const token = (publishableApiKey as { token?: string }).token;
  if (!token) {
    throw new Error("Publishable key created but token was not returned.");
  }

  logger.info(`PUBLISHABLE_API_KEY=${token}`);
}
