import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { parseWorkMetadata } from "@miyako/shared";

/**
 * GET /store/works/:handle
 *
 * Returns a Medusa product enriched with validated Work metadata.
 * The Next.js frontend uses this for commerce data while keeping
 * gallery storytelling in content/works.json.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const handle = req.params.handle as string;
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "title",
      "handle",
      "description",
      "thumbnail",
      "metadata",
      "status",
      "variants.*",
      "variants.prices.*",
      "images.*",
      "categories.*",
      "collection.*",
    ],
    filters: { handle },
  });

  const product = products?.[0];
  if (!product) {
    return res.status(404).json({ message: "Work not found" });
  }

  const workMetadata = parseWorkMetadata(
    product.metadata as Record<string, unknown>,
  );

  return res.json({
    product,
    work: workMetadata,
  });
}
