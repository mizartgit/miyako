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

  const commit = useCallback((next: SelectionItem[]) => {
    itemsRef.current = next;
    setItems(next);
    writeLocal(next);
  }, []);

  const refreshFromMedusa = useCallback(async () => {
    const records = itemsRef.current.map(toRecord);
    if (!records.length) return;
    try {
      const enriched = await enrichSelectionItems(records, locale);
      if (enriched.length) commit(enriched);
    } catch {
      /* keep cached snapshot */
    }
  }, [commit, locale]);

  useEffect(() => {
    const local = readLocal();
    itemsRef.current = local;
    const frame = requestAnimationFrame(() => {
      setItems(local);
      setIsReady(true);
    });
    if (local.length) {
      void enrichSelectionItems(local.map(toRecord), locale).then((enriched) => {
        if (enriched.length) commit(enriched);
      });
    }
    return () => cancelAnimationFrame(frame);
  }, [commit, locale]);

  useEffect(() => {
    authedRef.current = status === "authenticated";

    if (status === "authenticated" && !syncedRef.current) {
      syncedRef.current = true;
      void (async () => {
        try {
          const merged = await mergeServerSelections(
            itemsRef.current.map(toRecord),
          );
          commit(merged);
        } catch {
          /* keep local */
        }
      })();
    }

    if (status === "unauthenticated") {
      syncedRef.current = false;
    }
  }, [status, commit]);

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

      commit(next);
      setAddGeneration((g) => g + 1);
      setLastAddedSlug(item.workSlug);
      if (authedRef.current) void saveServerSelection(toRecord(changed));
    },
    [commit],
  );

  const setQuantity = useCallback(
    (workSlug: string, quantity: number) => {
      const prev = itemsRef.current;
      const idx = prev.findIndex((i) => i.workSlug === workSlug);
      if (idx < 0) return;

      const changed = { ...prev[idx], quantity: clampQuantity(quantity) };
      const next = [...prev];
      next[idx] = changed;

      commit(next);
      setAddGeneration((g) => g + 1);
      setLastAddedSlug(workSlug);
      if (authedRef.current) void saveServerSelection(toRecord(changed));
    },
    [commit],
  );

  const remove = useCallback(
    (workSlug: string) => {
      commit(itemsRef.current.filter((i) => i.workSlug !== workSlug));
      if (authedRef.current) void removeServerSelection(workSlug);
    },
    [commit],
  );

  const clear = useCallback(() => {
    commit([]);
    if (authedRef.current) void clearServerSelections();
  }, [commit]);

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
