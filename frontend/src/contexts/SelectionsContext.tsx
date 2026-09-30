"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import {
  clearServerSelections,
  enrichSelectionItems,
  mergeServerSelections,
  removeServerSelection,
  saveServerSelection,
} from "@/lib/actions/selections";
import {
  MAX_SELECTION_QUANTITY,
  SELECTIONS_STORAGE_KEY,
  type SelectionItem,
  type SelectionRecord,
} from "@/lib/selections/types";

type SelectionsContextValue = {
  items: SelectionItem[];
  /** Total pieces across all works (sum of quantities) — drives the header badge. */
  count: number;
  subtotalJpy: number;
  isReady: boolean;
  /** Bumps on every add so UI can play entrance animations. */
  addGeneration: number;
  /** Slug of the work most recently added (for row highlight). */
  lastAddedSlug: string | null;
  has: (workSlug: string) => boolean;
  quantityOf: (workSlug: string) => number;
  add: (item: SelectionItem) => void;
  remove: (workSlug: string) => void;
  setQuantity: (workSlug: string, quantity: number) => void;
  clear: () => void;
  refreshFromMedusa: () => Promise<void>;
};

const SelectionsContext = createContext<SelectionsContextValue | null>(null);

function clampQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return 1;
  return Math.min(MAX_SELECTION_QUANTITY, Math.max(1, Math.round(quantity)));
}

function toRecord(item: SelectionItem): SelectionRecord {
  return {
    workSlug: item.workSlug,
    variantId: item.variantId,
    quantity: item.quantity,
  };
}

function readLocal(): SelectionItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SELECTIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SelectionItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((i) => i && typeof i.workSlug === "string")
      .map((i) => ({ ...i, quantity: clampQuantity(i.quantity) }));
  } catch {
    return [];
  }
}

function writeLocal(items: SelectionItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SELECTIONS_STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* storage unavailable */
  }
}

export function SelectionsProvider({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const { status } = useSession();
  const [items, setItems] = useState<SelectionItem[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [addGeneration, setAddGeneration] = useState(0);
  const [lastAddedSlug, setLastAddedSlug] = useState<string | null>(null);

  const itemsRef = useRef<SelectionItem[]>([]);
  const authedRef = useRef(false);
  const syncedRef = useRef(false);
  /** Bumped on every visitor edit so slow server snapshots can't undo it. */
  const editVersionRef = useRef(0);

  const commit = useCallback((next: SelectionItem[]) => {
    itemsRef.current = next;
    setItems(next);
    writeLocal(next);
  }, []);

  const commitEdit = useCallback(
    (next: SelectionItem[]) => {
      editVersionRef.current += 1;
      commit(next);
    },
    [commit],
  );

  /**
   * Applies a server snapshot requested at `version`. If the visitor edited
   * meanwhile, keep their quantities and removals; take only fresh metadata.
   */
  const commitSnapshot = useCallback(
    (fetched: SelectionItem[], sent: SelectionRecord[], version: number) => {
      if (editVersionRef.current === version) {
        commit(fetched);
        return;
      }

      const fetchedBySlug = new Map(fetched.map((i) => [i.workSlug, i]));
      const sentSlugs = new Set(sent.map((r) => r.workSlug));
      const current = itemsRef.current;
      const currentSlugs = new Set(current.map((i) => i.workSlug));

      const next: SelectionItem[] = [];
      for (const item of current) {
        const fresh = fetchedBySlug.get(item.workSlug);
        if (fresh) {
          next.push({ ...fresh, quantity: item.quantity });
        } else if (!sentSlugs.has(item.workSlug)) {
          next.push(item);
        }
      }
      for (const fresh of fetched) {
        if (!currentSlugs.has(fresh.workSlug) && !sentSlugs.has(fresh.workSlug)) {
          next.push(fresh);
        }
      }
      commit(next);
    },
    [commit],
  );

  const refreshFromMedusa = useCallback(async () => {
    const records = itemsRef.current.map(toRecord);
    if (!records.length) return;
    const version = editVersionRef.current;
    try {
      const enriched = await enrichSelectionItems(records, locale);
      if (enriched.length) commitSnapshot(enriched, records, version);
    } catch {
      /* keep cached snapshot */
    }
  }, [commitSnapshot, locale]);

  useEffect(() => {
    const local = readLocal();
    itemsRef.current = local;
    const frame = requestAnimationFrame(() => {
      setItems(local);
      setIsReady(true);
    });
    if (local.length) {
      const records = local.map(toRecord);
      const version = editVersionRef.current;
      void enrichSelectionItems(records, locale)
        .then((enriched) => {
          if (enriched.length) commitSnapshot(enriched, records, version);
        })
        .catch(() => {
          /* keep cached snapshot */
        });
    }
    return () => cancelAnimationFrame(frame);
  }, [commitSnapshot, locale]);

  useEffect(() => {
    authedRef.current = status === "authenticated";

    if (status === "authenticated" && !syncedRef.current) {
      syncedRef.current = true;
      void (async () => {
        const records = itemsRef.current.map(toRecord);
        const version = editVersionRef.current;
        try {
          const merged = await mergeServerSelections(records);
          commitSnapshot(merged, records, version);
        } catch {
          /* keep local */
        }
      })();
    }

    if (status === "unauthenticated") {
      syncedRef.current = false;
    }
  }, [status, commitSnapshot]);

  const add = useCallback(
    (item: SelectionItem) => {
      const prev = itemsRef.current;
      const idx = prev.findIndex((i) => i.workSlug === item.workSlug);

      let next: SelectionItem[];
      let changed: SelectionItem;

      if (idx >= 0) {
        changed = {
          ...prev[idx],
          ...item,
          quantity: clampQuantity(prev[idx].quantity + item.quantity),
          variantId: item.variantId ?? prev[idx].variantId,
        };
        next = [...prev];
        next[idx] = changed;
      } else {
        changed = { ...item, quantity: clampQuantity(item.quantity) };
        next = [changed, ...prev];
      }

      commitEdit(next);
      setAddGeneration((g) => g + 1);
      setLastAddedSlug(item.workSlug);
      if (authedRef.current) void saveServerSelection(toRecord(changed));
    },
    [commitEdit],
  );

  const setQuantity = useCallback(
    (workSlug: string, quantity: number) => {
      const prev = itemsRef.current;
      const idx = prev.findIndex((i) => i.workSlug === workSlug);
      if (idx < 0) return;

      const changed = { ...prev[idx], quantity: clampQuantity(quantity) };
      const next = [...prev];
      next[idx] = changed;

      commitEdit(next);
      setAddGeneration((g) => g + 1);
      setLastAddedSlug(workSlug);
      if (authedRef.current) void saveServerSelection(toRecord(changed));
    },
    [commitEdit],
  );

  const remove = useCallback(
    (workSlug: string) => {
      commitEdit(itemsRef.current.filter((i) => i.workSlug !== workSlug));
      if (authedRef.current) void removeServerSelection(workSlug);
    },
    [commitEdit],
  );

  const clear = useCallback(() => {
    commitEdit([]);
    if (authedRef.current) void clearServerSelections();
  }, [commitEdit]);

  const has = useCallback(
    (workSlug: string) => items.some((i) => i.workSlug === workSlug),
    [items],
  );

  const quantityOf = useCallback(
    (workSlug: string) =>
      items.find((i) => i.workSlug === workSlug)?.quantity ?? 0,
    [items],
  );

  const subtotalJpy = useMemo(
    () =>
      items.reduce(
        (sum, i) => sum + (i.priceJpy > 0 ? i.priceJpy * i.quantity : 0),
        0,
      ),
    [items],
  );

  const totalQuantity = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );

  const value = useMemo<SelectionsContextValue>(
    () => ({
      items,
      count: totalQuantity,
      subtotalJpy,
      isReady,
      addGeneration,
      lastAddedSlug,
      has,
      quantityOf,
      add,
      remove,
      setQuantity,
      clear,
      refreshFromMedusa,
    }),
    [
      items,
      totalQuantity,
      subtotalJpy,
      isReady,
      addGeneration,
      lastAddedSlug,
      has,
      quantityOf,
      add,
      remove,
      setQuantity,
      clear,
      refreshFromMedusa,
    ],
  );

  return (
    <SelectionsContext.Provider value={value}>
      {children}
    </SelectionsContext.Provider>
  );
}

export function useSelections() {
  const ctx = useContext(SelectionsContext);
  if (!ctx) {
    throw new Error("useSelections must be used within SelectionsProvider");
  }
  return ctx;
}
