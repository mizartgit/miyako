import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * HMAC-SHA256 over `${timestamp}.${rawBody}`, hex encoded. Must stay in sync
 * with backend/src/subscribers/order-status-sync.ts.
 */
export const SIGNATURE_HEADER = "x-miyako-signature";
export const TIMESTAMP_HEADER = "x-miyako-timestamp";
export const MAX_CLOCK_SKEW_SECONDS = 300;

export function signPayload(
  secret: string,
  timestamp: string,
  rawBody: string,
): string {
  return createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");
}

export function verifySignature({
  secret,
  timestamp,
  signature,
  rawBody,
  nowSeconds = Math.floor(Date.now() / 1000),
}: {
  secret: string | undefined;
  timestamp: string | null;
  signature: string | null;
  rawBody: string;
  nowSeconds?: number;
}): boolean {
  if (!secret || !timestamp || !signature) return false;
  if (!/^\d+$/.test(timestamp) || !/^[0-9a-f]{64}$/.test(signature)) {
    return false;
  }
  if (Math.abs(nowSeconds - Number(timestamp)) > MAX_CLOCK_SKEW_SECONDS) {
    return false;
  }

  const expected = Buffer.from(signPayload(secret, timestamp, rawBody), "hex");
  const received = Buffer.from(signature, "hex");
  return (
    expected.length === received.length && timingSafeEqual(expected, received)
  );
}
