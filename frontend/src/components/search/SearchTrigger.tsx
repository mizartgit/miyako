"use client";

import { useTranslations } from "next-intl";
import { useSearch } from "@/components/search/SearchProvider";

type SearchTriggerProps = {
  solid: boolean;
  showLabel?: boolean;
};

export function SearchTrigger({ solid, showLabel = false }: SearchTriggerProps) {
  const t = useTranslations("nav");
  const { openSearch } = useSearch();

  const iconClass = solid
    ? "text-charcoal/50 hover:text-gold"
    : "text-stone/50 hover:text-gold";

  return (
    <button
      type="button"
      aria-label={t("search")}
      onClick={openSearch}
      className={`flex items-center gap-2 transition-colors duration-500 ${iconClass}`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20L16 16" />
      </svg>
      {showLabel && (
        <span className="hidden text-[11px] uppercase tracking-[0.15em] lg:inline">
          {t("search")}
        </span>
      )}
    </button>
  );
}
