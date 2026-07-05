"use client";

import { useTranslations } from "next-intl";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";

type QuantitySelectorProps = {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  disabled?: boolean;
  /** Hide the "Quantity" label (compact mode for selections rows). */
  compact?: boolean;
};

export function QuantitySelector({
  value,
  onChange,
  max = 10,
  disabled,
  compact,
}: QuantitySelectorProps) {
  const t = useTranslations("works");

  return (
    <div className="flex items-center gap-3">
      {!compact && (
        <span className="text-[10px] uppercase tracking-[0.2em] text-gold-muted">
          {t("quantity")}
        </span>
      )}
      <div className="flex items-center border border-charcoal/15 transition-colors duration-300 hover:border-gold/25">
        <button
          type="button"
          aria-label={t("decreaseQuantity")}
          disabled={disabled || value <= 1}
          onClick={() => onChange(Math.max(1, value - 1))}
          className="px-3 py-2 text-charcoal/60 transition-all duration-300 hover:bg-gold/5 hover:text-gold active:scale-90 disabled:opacity-30 disabled:hover:bg-transparent"
        >
          −
        </button>
        <span className="min-w-[2rem] border-x border-charcoal/10 px-1 py-2 text-center text-sm text-charcoal">
          <AnimatedNumber value={value} />
        </span>
        <button
          type="button"
          aria-label={t("increaseQuantity")}
          disabled={disabled || value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
          className="px-3 py-2 text-charcoal/60 transition-all duration-300 hover:bg-gold/5 hover:text-gold active:scale-90 disabled:opacity-30 disabled:hover:bg-transparent"
        >
          +
        </button>
      </div>
    </div>
  );
}
