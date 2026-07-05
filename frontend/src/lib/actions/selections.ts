"use server";

import { auth } from "@/auth";
import { getWorkBySlug } from "@/lib/content";
import { getResolvedWorkDisplay } from "@/lib/commerce/medusa/product";
import { isDbConfigured, prisma } from "@/lib/db";
import { buildSelectionItem } from "@/lib/selections/build-item";
import {
  MAX_SELECTION_QUANTITY,
  type SelectionItem,
  type SelectionRecord,
} from "@/lib/selections/types";

/**
 * Server-side persistence for a signed-in visitor's Selections.
 *
 * These actions are intentionally forgiving: when there is no database or no
 * authenticated user, they no-op (guests rely on localStorage instead). This
 * keeps the Selections experience seamless whether or not the visitor is
 * signed in.
 */

async function requireUserId(): Promise<string | null> {
  if (!isDbConfigured()) return null;
  const session = await auth();
  return session?.user?.id ?? null;
}

function clampQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return 1;
  return Math.min(MAX_SELECTION_QUANTITY, Math.max(1, Math.round(quantity)));
}

/** Resolves display + commerce fields from Medusa (source of truth when linked). */
async function enrich(
  record: SelectionRecord,
  locale = "en",
): Promise<SelectionItem | null> {
  const work = getWorkBySlug(record.workSlug);
  if (!work) return null;

  const { display, commerce } = await getResolvedWorkDisplay(work, locale);
  return buildSelectionItem(
    work,
    display,
    commerce,
    record.quantity,
    record.variantId,
  );
}

/** Re-syncs selection line items with the latest Medusa product data. */
export async function enrichSelectionItems(
  records: SelectionRecord[],
  locale = "en",
): Promise<SelectionItem[]> {
  const items = await Promise.all(records.map((r) => enrich(r, locale)));
  return items.filter((i): i is SelectionItem => i !== null);
}

export async function getServerSelections(): Promise<SelectionItem[]> {
  const userId = await requireUserId();
  if (!userId) return [];

  const rows = await prisma.selection.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { workSlug: true, variantId: true, quantity: true },
  });

  return enrichSelectionItems(
    rows.map((r) => ({
      workSlug: r.workSlug,
      variantId: r.variantId,
      quantity: r.quantity,
    })),
  );
}

export async function saveServerSelection(
  record: SelectionRecord,
): Promise<void> {
  const userId = await requireUserId();
  if (!userId) return;
  if (!getWorkBySlug(record.workSlug)) return;

  await prisma.selection.upsert({
    where: { userId_workSlug: { userId, workSlug: record.workSlug } },
    create: {
      userId,
      workSlug: record.workSlug,
      variantId: record.variantId,
      quantity: clampQuantity(record.quantity),
    },
    update: {
      variantId: record.variantId,
      quantity: clampQuantity(record.quantity),
    },
  });
}

export async function removeServerSelection(workSlug: string): Promise<void> {
  const userId = await requireUserId();
  if (!userId) return;

  await prisma.selection.deleteMany({ where: { userId, workSlug } });
}

export async function clearServerSelections(): Promise<void> {
  const userId = await requireUserId();
  if (!userId) return;

  await prisma.selection.deleteMany({ where: { userId } });
}

/**
 * Merges a guest's local Selections into the signed-in account after login and
 * returns the unified list. Existing server records win on conflict (their
 * quantity is preserved); local-only works are added. Nothing is ever lost.
 */
export async function mergeServerSelections(
  local: SelectionRecord[],
): Promise<SelectionItem[]> {
  const userId = await requireUserId();
  if (!userId) {
    return enrichSelectionItems(local);
  }

  const existing = await prisma.selection.findMany({
    where: { userId },
    select: { workSlug: true, quantity: true, variantId: true },
  });
  const existingMap = new Map(existing.map((e) => [e.workSlug, e]));

  for (const localItem of local) {
    if (!getWorkBySlug(localItem.workSlug)) continue;

    const ex = existingMap.get(localItem.workSlug);
    if (ex) {
      await prisma.selection.update({
        where: { userId_workSlug: { userId, workSlug: localItem.workSlug } },
        data: {
          quantity: clampQuantity(Math.max(ex.quantity, localItem.quantity)),
          variantId: localItem.variantId ?? ex.variantId,
        },
      });
    } else {
      await prisma.selection.create({
        data: {
          userId,
          workSlug: localItem.workSlug,
          variantId: localItem.variantId,
          quantity: clampQuantity(localItem.quantity),
        },
      });
    }
  }

  return getServerSelections();
}
