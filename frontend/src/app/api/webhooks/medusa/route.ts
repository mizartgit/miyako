import { NextResponse } from "next/server";

/**
 * Medusa webhook receiver (Phase 2).
 *
 * Register in Medusa Admin for order.placed, order.updated, shipment.created.
 * Syncs to OrderMirror in the frontend database.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();

  // Phase 2: verify signature + sync orders
  console.info("[medusa webhook] received payload", rawBody.slice(0, 200));

  return NextResponse.json({ received: true });
}
