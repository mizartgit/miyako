// Run from frontend/: node --test "src/lib/orders/*.test.mjs"
import assert from "node:assert/strict";
import { test } from "node:test";
import { deriveMirrorSync } from "./status.ts";

const item = (quantity, shipped = 0, delivered = 0) => ({
  quantity,
  shippedQuantity: shipped,
  deliveredQuantity: delivered,
});

const fulfillment = ({ shippedAt = null, deliveredAt = null, canceledAt = null, labels = [] } = {}) => ({
  createdAt: "2026-10-01T00:00:00Z",
  shippedAt,
  deliveredAt,
  canceledAt,
  labels,
});

const label = (n) => ({ trackingNumber: `EMS${n}`, trackingUrl: `https://track.example/${n}` });

const order = (overrides = {}) => ({
  status: "pending",
  paymentStatus: "authorized",
  fulfillmentStatus: "not_fulfilled",
  items: [item(2)],
  fulfillments: [],
  ...overrides,
});

const noTracking = { trackingNumber: null, trackingUrl: null };

test("authorized, unfulfilled order (like #15) stays PENDING", () => {
  assert.deepEqual(deriveMirrorSync(order()), { status: "PENDING", ...noTracking });
});

test("captured payment becomes PAID", () => {
  assert.equal(deriveMirrorSync(order({ paymentStatus: "captured" })).status, "PAID");
  assert.equal(deriveMirrorSync(order({ paymentStatus: "partially_captured" })).status, "PAID");
});

test("warehouse packing (fulfilled, not shipped) does not change status", () => {
  const packed = order({
    paymentStatus: "captured",
    fulfillmentStatus: "fulfilled",
    fulfillments: [fulfillment({ labels: [label(1)] })],
  });
  assert.deepEqual(deriveMirrorSync(packed), { status: "PAID", ...noTracking });
});

test("partial shipment never becomes SHIPPED, but its tracking is recorded", () => {
  const partial = order({
    paymentStatus: "captured",
    fulfillmentStatus: "partially_shipped",
    items: [item(1, 1), item(1, 0)],
    fulfillments: [fulfillment({ shippedAt: "2026-10-02T00:00:00Z", labels: [label(1)] })],
  });
  assert.deepEqual(deriveMirrorSync(partial), {
    status: "PAID",
    trackingNumber: "EMS1",
    trackingUrl: "https://track.example/1",
  });
  assert.equal(deriveMirrorSync({ ...partial, paymentStatus: "authorized" }).status, "PENDING");
});

test("full warehouse → customer shipment becomes SHIPPED even before capture", () => {
  const shipped = order({
    fulfillmentStatus: "shipped",
    items: [item(2, 2)],
    fulfillments: [fulfillment({ shippedAt: "2026-10-02T00:00:00Z", labels: [label(1)] })],
  });
  assert.deepEqual(deriveMirrorSync(shipped), {
    status: "SHIPPED",
    trackingNumber: "EMS1",
    trackingUrl: "https://track.example/1",
  });
});

test("partially_delivered with every item shipped stays SHIPPED", () => {
  const someArrived = order({
    paymentStatus: "captured",
    fulfillmentStatus: "partially_delivered",
    items: [item(1, 1, 1), item(1, 1, 0)],
  });
  assert.equal(deriveMirrorSync(someArrived).status, "SHIPPED");
});

test("partially_delivered with unshipped items is not SHIPPED", () => {
  const stillInJapan = order({
    paymentStatus: "captured",
    fulfillmentStatus: "partially_delivered",
    items: [item(1, 1, 1), item(1, 0, 0)],
  });
  assert.equal(deriveMirrorSync(stillInJapan).status, "PAID");
});

test("delivery becomes DELIVERED", () => {
  assert.equal(deriveMirrorSync(order({ fulfillmentStatus: "delivered", items: [item(2, 2, 2)] })).status, "DELIVERED");
  assert.equal(deriveMirrorSync(order({ items: [item(1, 0, 1)] })).status, "DELIVERED");
});

test("cancellation overrides everything", () => {
  const cancelled = order({ status: "canceled", paymentStatus: "captured", fulfillmentStatus: "shipped" });
  assert.equal(deriveMirrorSync(cancelled).status, "CANCELLED");
});

test("cancelled fulfillment clears tracking and does not count as shipped", () => {
  const reverted = order({
    paymentStatus: "captured",
    fulfillmentStatus: "canceled",
    fulfillments: [fulfillment({ canceledAt: "2026-10-03T00:00:00Z", shippedAt: null, labels: [label(1)] })],
  });
  assert.deepEqual(deriveMirrorSync(reverted), { status: "PAID", ...noTracking });
});

test("refund without cancellation keeps PAID", () => {
  assert.equal(deriveMirrorSync(order({ paymentStatus: "refunded" })).status, "PAID");
  assert.equal(deriveMirrorSync(order({ paymentStatus: "partially_refunded" })).status, "PAID");
});

test("order with no items is never SHIPPED or DELIVERED", () => {
  assert.equal(deriveMirrorSync(order({ items: [] })).status, "PENDING");
});

test("tracking comes from the most recent shipped fulfillment", () => {
  const twoParcels = order({
    fulfillmentStatus: "shipped",
    items: [item(1, 1), item(1, 1)],
    fulfillments: [
      fulfillment({ shippedAt: "2026-10-02T00:00:00Z", labels: [label(1)] }),
      fulfillment({ shippedAt: "2026-10-04T00:00:00Z", labels: [label(2)] }),
      fulfillment({ labels: [label(3)] }),
    ],
  });
  assert.equal(deriveMirrorSync(twoParcels).trackingNumber, "EMS2");
});

test("same Medusa state always yields the same result (idempotent)", () => {
  const snapshot = order({ paymentStatus: "captured", fulfillmentStatus: "partially_shipped", items: [item(1, 1), item(1)] });
  assert.deepEqual(deriveMirrorSync(snapshot), deriveMirrorSync(structuredClone(snapshot)));
});
