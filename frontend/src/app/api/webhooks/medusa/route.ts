import { NextResponse } from "next/server";
import { retrieveOrderSyncSnapshot } from "@/lib/commerce/medusa/order";
import { isDbConfigured, prisma } from "@/lib/db";
import { deriveMirrorSync } from "@/lib/orders/status";
import {
  SIGNATURE_HEADER,
  TIMESTAMP_HEADER,
  verifySignature,
} from "@/lib/orders/webhook-signature";

export const runtime = "nodejs";

const ORDER_ID = /^order_[A-Za-z0-9]+$/;
const MAX_ATTEMPTS = 3;

type SyncResult = "ignored" | "unchanged" | "updated";

/**
 * Medusa order-status webhook, called by the signed subscriber in
 * backend/src/subscribers/order-status-sync.ts.
 *
 * The body is only a hint ({ event, orderId }): state is always re-read from
 * Medusa, so duplicate or out-of-order deliveries converge on the same row.
 * Rows are only ever updated (never created — checkout owns creation and the
 * userId link), and only status/tracking are written.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();

  const authentic = verifySignature({
    secret: process.env.MEDUSA_WEBHOOK_SECRET,
    timestamp: request.headers.get(TIMESTAMP_HEADER),
    signature: request.headers.get(SIGNATURE_HEADER),
    rawBody,
  });
  if (!authentic) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let event = "";
  let orderId = "";
  try {
    const payload = JSON.parse(rawBody) as { event?: unknown; orderId?: unknown };
    event = typeof payload.event === "string" ? payload.event.slice(0, 64) : "";
    orderId = typeof payload.orderId === "string" ? payload.orderId : "";
  } catch {
    // fall through to validation
  }
  if (!ORDER_ID.test(orderId)) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  if (!isDbConfigured()) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }

  try {
    const result = await syncOrderMirror(orderId);
    console.info(`[medusa webhook] ${event || "unknown"} ${orderId}: ${result}`);
    return NextResponse.json({ result });
  } catch (err) {
    console.error(
      `[medusa webhook] sync failed for ${orderId}:`,
      err instanceof Error ? err.message : err,
    );
    return NextResponse.json({ error: "sync failed" }, { status: 502 });
  }
}

async function syncOrderMirror(medusaOrderId: string): Promise<SyncResult> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const current = await prisma.orderMirror.findUnique({
      where: { medusaOrderId },
      select: { status: true, trackingNumber: true, trackingUrl: true },
    });
    if (!current) return "ignored";

    const next = deriveMirrorSync(await retrieveOrderSyncSnapshot(medusaOrderId));
    if (
      next.status === current.status &&
      next.trackingNumber === current.trackingNumber &&
      next.trackingUrl === current.trackingUrl
    ) {
      return "unchanged";
    }

    // Conditional on the values just read: if a concurrent delivery wrote
    // first, re-read and re-fetch instead of overwriting with older state.
    const { count } = await prisma.orderMirror.updateMany({
      where: { medusaOrderId, ...current },
      data: next,
    });
    if (count > 0) return "updated";
  }
  throw new Error("concurrent updates did not settle");
}
