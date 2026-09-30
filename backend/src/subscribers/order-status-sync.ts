import { createHmac } from "node:crypto";
import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

/**
 * Notifies the storefront that an order's status may have changed.
 *
 * Fulfillment model: Customer → Miyako → artist → Miyako's Japan warehouse →
 * customer. Medusa fulfillments, shipments, deliveries and tracking labels
 * represent ONLY the final warehouse → customer shipment. Never record the
 * artist's domestic shipment to the warehouse as a Medusa fulfillment — the
 * customer would be shown it as their shipment and tracking.
 *
 * Sends only a signed hint ({ event, orderId }); the storefront re-reads the
 * order from Medusa, so nothing in this payload is trusted. `order.placed` is
 * deliberately not handled: checkout records the order, and artist
 * notification will be its own subscriber.
 *
 * Signature format must match frontend/src/lib/orders/webhook-signature.ts.
 */

const EVENTS = [
  "order.canceled",
  "order.fulfillment_created",
  "order.fulfillment_canceled",
  "shipment.created",
  "delivery.created",
  "payment.captured",
  "payment.refunded",
] as const;

type EventData = { id?: string; order_id?: string };

const RETRY_DELAYS_MS = [0, 2_000, 8_000];

export default async function orderStatusSync({
  event,
  container,
}: SubscriberArgs<EventData>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const secret = process.env.MEDUSA_WEBHOOK_SECRET;
  if (!secret) {
    logger.warn(`[order-status-sync] MEDUSA_WEBHOOK_SECRET unset; skipped ${event.name}`);
    return;
  }

  let orderId: string | null;
  try {
    orderId = await resolveOrderId(container, event.name, event.data);
  } catch (err) {
    logger.error(
      `[order-status-sync] could not resolve order for ${event.name}: ${
        err instanceof Error ? err.message : String(err)
      }`,
    );
    return;
  }
  if (!orderId) return;

  const storefrontUrl = (
    process.env.STOREFRONT_URL ?? "https://miyako-psi.vercel.app"
  ).replace(/\/$/, "");
  const body = JSON.stringify({
    event: event.name,
    orderId,
    emittedAt: new Date().toISOString(),
  });

  let lastError = "";
  for (const delay of RETRY_DELAYS_MS) {
    if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
    // Re-signed per attempt so retries stay inside the receiver's time window.
    const timestamp = String(Math.floor(Date.now() / 1000));
    const signature = createHmac("sha256", secret)
      .update(`${timestamp}.${body}`)
      .digest("hex");
    try {
      const res = await fetch(`${storefrontUrl}/api/webhooks/medusa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-miyako-timestamp": timestamp,
          "x-miyako-signature": signature,
        },
        body,
        signal: AbortSignal.timeout(15_000),
      });
      if (res.ok) {
        logger.info(`[order-status-sync] ${event.name} ${orderId}: delivered`);
        return;
      }
      lastError = `HTTP ${res.status}`;
      // 4xx other than 429 will not succeed on retry.
      if (res.status < 500 && res.status !== 429) break;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }
  logger.error(`[order-status-sync] ${event.name} ${orderId}: failed (${lastError})`);
}

async function resolveOrderId(
  container: SubscriberArgs<EventData>["container"],
  eventName: string,
  data: EventData,
): Promise<string | null> {
  switch (eventName) {
    case "order.canceled":
      return data.id ?? null;
    case "order.fulfillment_created":
    case "order.fulfillment_canceled":
      return data.order_id ?? null;
  }

  if (!data.id) return null;
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  if (eventName === "shipment.created" || eventName === "delivery.created") {
    const { data: fulfillments } = await query.graph({
      entity: "fulfillment",
      fields: ["id", "order.id"],
      filters: { id: data.id },
    });
    const fulfillment = fulfillments[0] as { order?: { id?: string } | null } | undefined;
    return fulfillment?.order?.id ?? null;
  }

  if (eventName === "payment.captured" || eventName === "payment.refunded") {
    const { data: payments } = await query.graph({
      entity: "payment",
      fields: ["id", "payment_collection.order.id"],
      filters: { id: data.id },
    });
    const payment = payments[0] as
      | { payment_collection?: { order?: { id?: string } | null } | null }
      | undefined;
    return payment?.payment_collection?.order?.id ?? null;
  }

  return null;
}

export const config: SubscriberConfig = {
  event: [...EVENTS],
};
