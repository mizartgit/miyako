"use client";

import { useTranslations } from "next-intl";
import type { ProductVariant } from "@/lib/commerce/types";

type VariantSelectorProps = {
  variants: ProductVariant[];
  selectedId: string | null;
  onSelect: (variantId: string) => void;
};

export function VariantSelector({
  variants,
  selectedId,
  onSelect,
}: VariantSelectorProps) {
  const t = useTranslations("works");

  if (variants.length <= 1) return null;

  const optionName = variants[0]?.selectedOptions[0]?.name ?? t("variant");

  return (
    <div className="space-y-3">
      <span className="text-[10px] uppercase tracking-[0.2em] text-gold-muted">
        {optionName}
      </span>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const label =
            variant.selectedOptions.map((o) => o.value).join(" / ") ||
            variant.title;
          const selected = variant.id === selectedId;
          const disabled = !variant.availableForSale;

          return (
            <button
              key={variant.id}
              type="button"
              disabled={disabled}
              aria-pressed={selected}
              onClick={() => onSelect(variant.id)}
              className={`border px-4 py-2 text-[11px] uppercase tracking-[0.15em] transition-all duration-500 ${
                selected
                  ? "border-gold bg-gold/10 text-gold"
                  : disabled
                    ? "cursor-not-allowed border-charcoal/10 text-charcoal/30"
                    : "border-charcoal/20 text-charcoal/70 hover:border-gold/50 hover:text-gold"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
