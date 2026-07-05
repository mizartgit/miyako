"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { useSelections } from "@/contexts/SelectionsContext";

type SelectionsLinkProps = {
  solid: boolean;
};

export function SelectionsLink({ solid }: SelectionsLinkProps) {
  const t = useTranslations("nav");
  const { count, isReady, addGeneration } = useSelections();
  const [bump, setBump] = useState(false);
  const prevCount = useRef(0);
  const mounted = useRef(false);

  const iconClass = solid
    ? "text-charcoal/50 hover:text-gold"
    : "text-stone/50 hover:text-gold";

  const showBadge = isReady && count > 0;

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      prevCount.current = count;
      return;
    }
    if (count !== prevCount.current) {
      setBump(true);
      const timer = setTimeout(() => setBump(false), 550);
      prevCount.current = count;
      return () => clearTimeout(timer);
    }
  }, [count, addGeneration]);

  return (
    <Link
      href="/selections"
      aria-label={t("selections")}
      className={`group relative transition-colors duration-500 ${iconClass}`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className={`transition-transform duration-500 group-hover:scale-110 ${
          bump ? "selection-star-pulse" : ""
        }`}
      >
        <path d="M12 3.5l2.6 5.27 5.82.85-4.21 4.1.99 5.79L12 16.77l-5.2 2.74.99-5.79-4.21-4.1 5.82-.85z" />
      </svg>
      {showBadge && (
        <span
          className={`absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center bg-gold px-1 text-[9px] font-medium text-ink transition-transform duration-300 ${
            bump ? "selection-badge-pop" : ""
          }`}
        >
          <AnimatedNumber value={count} maxDisplay={9} />
        </span>
      )}
    </Link>
  );
}
