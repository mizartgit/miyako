"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { useSelections } from "@/contexts/SelectionsContext";
import type { SelectionItem } from "@/lib/selections/types";

type AddToSelectionsButtonProps = {
  work: Omit<SelectionItem, "quantity">;
  quantity?: number;
};

export function AddToSelectionsButton({
  work,
  quantity = 1,
}: AddToSelectionsButtonProps) {
  const t = useTranslations("works");
  const { add, quantityOf, addGeneration, lastAddedSlug } = useSelections();
  const [animating, setAnimating] = useState(false);
  const [flash, setFlash] = useState(false);

  const inSelections = quantityOf(work.workSlug) > 0;
  const totalQty = quantityOf(work.workSlug);
  const isPulseTarget = lastAddedSlug === work.workSlug && addGeneration > 0;

  useEffect(() => {
    if (!isPulseTarget) return;
    const frame = requestAnimationFrame(() => {
      setAnimating(true);
      setFlash(true);
    });
    const t1 = setTimeout(() => setAnimating(false), 550);
    const t2 = setTimeout(() => setFlash(false), 1400);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [addGeneration, isPulseTarget]);

  function handleAdd() {
    add({ ...work, quantity });
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleAdd}
        aria-pressed={inSelections}
        className={`relative w-full overflow-hidden border border-charcoal bg-charcoal px-8 py-4 text-[11px] uppercase tracking-[0.25em] text-stone transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-gold hover:bg-ink hover:text-gold active:scale-[0.99] ${
          animating ? "selection-cta-pop" : ""
        }`}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {flash && (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-gold selection-star-flash"
              aria-hidden
            >
              <path d="M12 3.5l2.6 5.27 5.82.85-4.21 4.1.99 5.79L12 16.77l-5.2 2.74.99-5.79-4.21-4.1 5.82-.85z" />
            </svg>
          )}
          {inSelections ? t("addAnother") : t("addToSelections")}
        </span>
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-0 bg-gold/20 transition-opacity duration-500 ${
            flash ? "opacity-100" : "opacity-0"
          }`}
        />
      </button>

      {inSelections && (
        <p
          className={`flex flex-wrap items-center gap-x-1.5 text-[10px] uppercase tracking-[0.2em] text-gold-muted transition-all duration-500 ${
            flash ? "selection-feedback-in" : ""
          }`}
        >
          {flash ? (
            t("addedToSelections")
          ) : (
            <>
              <AnimatedNumber value={totalQty} className="text-gold" />
              <span>{t("inSelectionsCountShort")}</span>
            </>
          )}{" "}
          <Link
            href="/selections"
            className="link-underline text-gold transition-colors hover:text-gold-muted"
          >
            {t("viewSelections")}
          </Link>
        </p>
      )}
    </div>
  );
}
