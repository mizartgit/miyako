// Run from frontend/: node --test "src/lib/orders/*.test.mjs"
import assert from "node:assert/strict";
import { test } from "node:test";
import { signPayload, verifySignature } from "./webhook-signature.ts";

const secret = "test-secret";
const now = 1_790_000_000;
const timestamp = String(now);
const rawBody = JSON.stringify({ event: "shipment.created", orderId: "order_01TEST" });
const signature = signPayload(secret, timestamp, rawBody);
const base = { secret, timestamp, signature, rawBody, nowSeconds: now };

test("accepts a valid signature", () => {
  assert.equal(verifySignature(base), true);
});

test("rejects a missing secret, signature or timestamp", () => {
  assert.equal(verifySignature({ ...base, secret: undefined }), false);
  assert.equal(verifySignature({ ...base, secret: "" }), false);
  assert.equal(verifySignature({ ...base, signature: null }), false);
  assert.equal(verifySignature({ ...base, timestamp: null }), false);
});

test("rejects the wrong secret", () => {
  assert.equal(verifySignature({ ...base, secret: "other-secret" }), false);
});

test("rejects a tampered body", () => {
  assert.equal(verifySignature({ ...base, rawBody: rawBody.replace("01TEST", "01OTHER") }), false);
});

test("rejects a signature moved to a different timestamp", () => {
  assert.equal(verifySignature({ ...base, timestamp: String(now + 1), nowSeconds: now + 1 }), false);
});

test("rejects stale and far-future timestamps", () => {
  assert.equal(verifySignature({ ...base, nowSeconds: now + 301 }), false);
  assert.equal(verifySignature({ ...base, nowSeconds: now - 301 }), false);
  assert.equal(verifySignature({ ...base, nowSeconds: now + 300 }), true);
});

test("rejects malformed signatures and timestamps", () => {
  assert.equal(verifySignature({ ...base, signature: signature.slice(0, 62) }), false);
  assert.equal(verifySignature({ ...base, signature: signature.toUpperCase() }), false);
  assert.equal(verifySignature({ ...base, signature: `${signature}00` }), false);
  assert.equal(verifySignature({ ...base, timestamp: "12.5" }), false);
});
