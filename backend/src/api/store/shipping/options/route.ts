import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { FULFILLMENT_PROVIDER_STUBS } from "../../../../modules/fulfillment/providers";

/**
 * GET /store/shipping/options
 *
 * Returns available international shipping carriers and estimated delivery windows.
 * Live rate quotes will be added when carrier APIs are integrated (Phase 2).
 */
export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  return res.json({
    carriers: FULFILLMENT_PROVIDER_STUBS.filter((c) => c.enabled),
    note: "Rate quotes require carrier API integration (Phase 2).",
  });
}
