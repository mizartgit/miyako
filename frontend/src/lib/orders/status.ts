/**
 * Maps Medusa's current order state to the customer-facing OrderMirror
 * status and tracking.
 *
 * Fulfillment model: Customer → Miyako → artist → Miyako's Japan warehouse →
 * customer. In Medusa, fulfillments, shipments, delivery and tracking labels
 * represent ONLY the final warehouse → customer shipment. The artist's
 * domestic shipment to the warehouse is never recorded as a Medusa fulfillment,
 * so nothing here describes that leg. Miyako-specific stages (artist
 * preparing, warehouse received/inspected, …) belong in separate fields later
 * and must not be written by this mapper.
 *
 * Pure and dependency-free so it can be unit tested with `node --test`.
 */

export type MirrorStatus =
  | "PENDING"
  | "PAID"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type OrderSyncSnapshot = {
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  items: {
    quantity: number;
    shippedQuantity: number;
    deliveredQuantity: number;
  }[];
  fulfillments: {
    createdAt: string | null;
    shippedAt: string | null;
    deliveredAt: string | null;
    canceledAt: string | null;
    labels: { trackingNumber: string | null; trackingUrl: string | null }[];
  }[];
};

export type MirrorSync = {
  status: MirrorStatus;
  trackingNumber: string | null;
  trackingUrl: string | null;
};

// Refunds keep the order "paid" unless it is also cancelled; a refunded
// customer-facing state is a later phase.
const PAID_PAYMENT_STATUSES = new Set([
  "captured",
  "partially_captured",
  "partially_refunded",
  "refunded",
]);

function everyItem(
  items: OrderSyncSnapshot["items"],
  done: (item: OrderSyncSnapshot["items"][number]) => number,
): boolean {
  return items.length > 0 && items.every((item) => done(item) >= item.quantity);
}

export function deriveMirrorStatus(order: OrderSyncSnapshot): MirrorStatus {
  if (order.status === "canceled") return "CANCELLED";

  // Only a complete warehouse → customer shipment counts. Medusa reports
  // "partially_delivered" both when items are still unshipped and when every
  // item shipped but only some parcels arrived, so check item quantities.
  const allDelivered =
    order.fulfillmentStatus === "delivered" ||
    everyItem(order.items, (item) => item.deliveredQuantity);
  if (allDelivered) return "DELIVERED";

  const allShipped =
    order.fulfillmentStatus === "shipped" ||
    everyItem(order.items, (item) =>
      Math.max(item.shippedQuantity, item.deliveredQuantity),
    );
  if (allShipped) return "SHIPPED";

  if (PAID_PAYMENT_STATUSES.has(order.paymentStatus)) return "PAID";
  return "PENDING";
}

/** Tracking from the most recently shipped, non-cancelled fulfillment. */
export function deriveTracking(
  order: OrderSyncSnapshot,
): Pick<MirrorSync, "trackingNumber" | "trackingUrl"> {
  const shipped = order.fulfillments
    .filter((f) => !f.canceledAt && (f.shippedAt || f.deliveredAt))
    .sort((a, b) =>
      (b.shippedAt ?? b.deliveredAt ?? "").localeCompare(
        a.shippedAt ?? a.deliveredAt ?? "",
      ),
    );

  for (const fulfillment of shipped) {
    const label = fulfillment.labels.find(
      (l) => l.trackingNumber || l.trackingUrl,
    );
    if (label) {
      return {
        trackingNumber: label.trackingNumber || null,
        trackingUrl: label.trackingUrl || null,
      };
    }
  }
  return { trackingNumber: null, trackingUrl: null };
}

export function deriveMirrorSync(order: OrderSyncSnapshot): MirrorSync {
  return { status: deriveMirrorStatus(order), ...deriveTracking(order) };
}
