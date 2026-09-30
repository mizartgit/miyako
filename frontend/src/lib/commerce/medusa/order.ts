import type { OrderSyncSnapshot } from "@/lib/orders/status";
import { moneyAmount } from "./cart";
import { medusaFetch } from "./client";

// Medusa computes totals from full line-item records; selecting individual
// item or shipping-method columns makes it return zeroed totals.
const ORDER_FIELDS = [
  "id",
  "display_id",
  "created_at",
  "status",
  "payment_status",
  "fulfillment_status",
  "currency_code",
  "item_subtotal",
  "shipping_total",
  "total",
  "*items",
  "*shipping_methods",
  "*shipping_address",
].join(",");

type MedusaOrderResponse = {
  order: {
    id: string;
    display_id?: number | null;
    created_at: string;
    status?: string | null;
    payment_status?: string | null;
    fulfillment_status?: string | null;
    currency_code?: string | null;
    item_subtotal?: unknown;
    shipping_total?: unknown;
    total?: unknown;
    items?: {
      id: string;
      title?: string | null;
      product_title?: string | null;
      variant_title?: string | null;
      quantity?: unknown;
      unit_price?: unknown;
      subtotal?: unknown;
      thumbnail?: string | null;
      product_handle?: string | null;
    }[];
    shipping_methods?: { id: string; name?: string | null; amount?: unknown }[];
    shipping_address?: {
      first_name?: string | null;
      last_name?: string | null;
      company?: string | null;
      address_1?: string | null;
      address_2?: string | null;
      city?: string | null;
      province?: string | null;
      postal_code?: string | null;
      country_code?: string | null;
    } | null;
  };
};

export type OrderDetail = {
  id: string;
  displayId: number | null;
  createdAt: string;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  currencyCode: string;
  itemSubtotal: number;
  shippingTotal: number;
  total: number;
  items: {
    id: string;
    title: string;
    variantTitle: string | null;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    thumbnail: string | null;
    productHandle: string | null;
  }[];
  shippingMethods: { id: string; name: string; amount: number }[];
  shippingAddress: {
    firstName: string;
    lastName: string;
    company: string;
    address1: string;
    address2: string;
    city: string;
    province: string;
    postalCode: string;
    countryCode: string;
  } | null;
};

/**
 * Server-only: Medusa's store endpoint returns any order by ID without
 * customer auth, so callers must verify ownership before calling this.
 */
export async function retrieveOrder(id: string): Promise<OrderDetail> {
  const { order } = await medusaFetch<MedusaOrderResponse>(
    `/store/orders/${encodeURIComponent(id)}?fields=${encodeURIComponent(ORDER_FIELDS)}`,
  );
  const address = order.shipping_address;

  return {
    id: order.id,
    displayId: order.display_id ?? null,
    createdAt: order.created_at,
    status: order.status ?? "",
    paymentStatus: order.payment_status ?? "",
    fulfillmentStatus: order.fulfillment_status ?? "",
    currencyCode: (order.currency_code ?? "jpy").toUpperCase(),
    itemSubtotal: moneyAmount(order.item_subtotal),
    shippingTotal: moneyAmount(order.shipping_total),
    total: moneyAmount(order.total),
    items: (order.items ?? []).map((item) => ({
      id: item.id,
      title: item.product_title ?? item.title ?? "",
      variantTitle: item.variant_title ?? null,
      quantity: moneyAmount(item.quantity),
      unitPrice: moneyAmount(item.unit_price),
      subtotal: moneyAmount(item.subtotal),
      thumbnail: item.thumbnail ?? null,
      productHandle: item.product_handle ?? null,
    })),
    shippingMethods: (order.shipping_methods ?? []).map((method) => ({
      id: method.id,
      name: method.name ?? "",
      amount: moneyAmount(method.amount),
    })),
    shippingAddress: address
      ? {
          firstName: address.first_name ?? "",
          lastName: address.last_name ?? "",
          company: address.company ?? "",
          address1: address.address_1 ?? "",
          address2: address.address_2 ?? "",
          city: address.city ?? "",
          province: address.province ?? "",
          postalCode: address.postal_code ?? "",
          countryCode: address.country_code ?? "",
        }
      : null,
  };
}

const SYNC_FIELDS = [
  "id",
  "status",
  "payment_status",
  "fulfillment_status",
  "*items",
  "items.detail.shipped_quantity",
  "items.detail.delivered_quantity",
  "*fulfillments",
  "*fulfillments.labels",
].join(",");

type MedusaOrderSyncResponse = {
  order: {
    id: string;
    status?: string | null;
    payment_status?: string | null;
    fulfillment_status?: string | null;
    items?: {
      quantity?: unknown;
      detail?: { shipped_quantity?: unknown; delivered_quantity?: unknown } | null;
    }[];
    fulfillments?: {
      created_at?: string | null;
      shipped_at?: string | null;
      delivered_at?: string | null;
      canceled_at?: string | null;
      labels?: { tracking_number?: string | null; tracking_url?: string | null }[];
    }[];
  };
};

/**
 * Server-only: current status/fulfillment state for OrderMirror sync.
 * Medusa fulfillments here are the warehouse → customer shipment only.
 */
export async function retrieveOrderSyncSnapshot(
  id: string,
): Promise<OrderSyncSnapshot> {
  const { order } = await medusaFetch<MedusaOrderSyncResponse>(
    `/store/orders/${encodeURIComponent(id)}?fields=${encodeURIComponent(SYNC_FIELDS)}`,
  );

  return {
    status: order.status ?? "",
    paymentStatus: order.payment_status ?? "",
    fulfillmentStatus: order.fulfillment_status ?? "",
    items: (order.items ?? []).map((item) => ({
      quantity: moneyAmount(item.quantity),
      shippedQuantity: moneyAmount(item.detail?.shipped_quantity),
      deliveredQuantity: moneyAmount(item.detail?.delivered_quantity),
    })),
    fulfillments: (order.fulfillments ?? []).map((f) => ({
      createdAt: f.created_at ?? null,
      shippedAt: f.shipped_at ?? null,
      deliveredAt: f.delivered_at ?? null,
      canceledAt: f.canceled_at ?? null,
      labels: (f.labels ?? []).map((label) => ({
        trackingNumber: label.tracking_number ?? null,
        trackingUrl: label.tracking_url ?? null,
      })),
    })),
  };
}
