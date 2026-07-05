"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  CURRENCY_COOKIE,
  formatPriceFromJpy,
  isCurrency,
} from "@/lib/commerce/currency";
import type { Currency } from "@/lib/commerce/types";
import { SUPPORTED_CURRENCIES } from "@/lib/commerce/types";

type CurrencyContextValue = {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatJpy: (amountJpy: number) => string;
  supportedCurrencies: readonly Currency[];
  isReady: boolean;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function readCookie(): Currency | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${CURRENCY_COOKIE}=([^;]*)`),
  );
  const value = match?.[1];
  return value && isCurrency(value) ? value : null;
}

function writeCookie(currency: Currency) {
  document.cookie = `${CURRENCY_COOKIE}=${currency};path=/;max-age=31536000;SameSite=Lax`;
}

export function CurrencyProvider({
  children,
  initialCurrency = "JPY",
}: {
  children: ReactNode;
  initialCurrency?: Currency;
}) {
  const [currency, setCurrencyState] = useState<Currency>(initialCurrency);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const saved = readCookie();
      if (saved) {
        if (!cancelled) {
          setCurrencyState(saved);
          setIsReady(true);
        }
        return;
      }

      try {
        const res = await fetch("/api/currency/detect");
        const data = (await res.json()) as { currency?: string };
        if (
          !cancelled &&
          data.currency &&
          isCurrency(data.currency)
        ) {
          setCurrencyState(data.currency);
          writeCookie(data.currency);
        }
      } catch {
        /* keep default */
      }

      if (!cancelled) setIsReady(true);
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, []);

  const setCurrency = useCallback((next: Currency) => {
    setCurrencyState(next);
    writeCookie(next);
  }, []);

  const formatJpy = useCallback(
    (amountJpy: number) => formatPriceFromJpy(amountJpy, currency),
    [currency],
  );

  const value = useMemo(
    () => ({
      currency,
      setCurrency,
      formatJpy,
      supportedCurrencies: SUPPORTED_CURRENCIES,
      isReady,
    }),
    [currency, setCurrency, formatJpy, isReady],
  );

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return ctx;
}
