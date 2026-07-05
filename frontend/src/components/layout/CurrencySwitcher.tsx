"use client";

import { useLocale } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import type { Currency } from "@/lib/commerce/types";

export function CurrencySwitcher({ solid }: { solid: boolean }) {
  const { currency, setCurrency, supportedCurrencies } = useCurrency();
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const inactiveClass = solid
    ? "text-charcoal/50 hover:text-gold"
    : "text-stone/50 hover:text-gold";

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const label = locale === "ja" ? "通貨" : "Currency";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((o) => !o)}
        className={`text-[11px] uppercase tracking-[0.15em] transition-colors duration-500 ${inactiveClass}`}
      >
        {currency}
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={label}
          className="absolute right-0 top-full z-50 mt-2 min-w-[5rem] border border-gold/15 bg-stone py-2 shadow-[0_8px_32px_rgba(12,12,12,0.08)]"
        >
          {supportedCurrencies.map((c) => (
            <li key={c} role="option" aria-selected={c === currency}>
              <button
                type="button"
                onClick={() => {
                  setCurrency(c as Currency);
                  setOpen(false);
                }}
                className={`block w-full px-4 py-1.5 text-left text-[11px] uppercase tracking-[0.12em] transition-colors duration-300 ${
                  c === currency
                    ? "text-gold"
                    : "text-charcoal/70 hover:text-gold"
                }`}
              >
                {c}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
