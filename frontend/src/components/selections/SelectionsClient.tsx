"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { DualTitle } from "@/components/ui/DualTitle";
import { AnimatedNumber, AnimatedPresence } from "@/components/ui/AnimatedNumber";
import { Reveal } from "@/components/ui/Reveal";
import { QuantitySelector } from "@/components/work/QuantitySelector";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useSelections } from "@/contexts/SelectionsContext";
import { startSelectionsCheckout } from "@/lib/actions/checkout";

export function SelectionsClient() {
  const t = useTranslations("selections");
  const { formatJpy } = useCurrency();
  const {
    items,
    count,
    subtotalJpy,
    isReady,
    lastAddedSlug,
    remove,
    setQuantity,
    refreshFromMedusa,
  } = useSelections();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isReady && items.length) void refreshFromMedusa();
  }, [isReady, refreshFromMedusa, items.length]);

  const purchasable = items.filter((i) => i.variantId && i.available);
  const distinctCount = items.length;

  async function handleCheckout() {
    setError(null);
    if (purchasable.length === 0) {
      setError(t("nothingPurchasable"));
      return;
    }

    setLoading(true);
    const result = await startSelectionsCheckout(
      purchasable.map((i) => ({
        variantId: i.variantId as string,
        quantity: i.quantity,
      })),
    );

    if ("checkoutPath" in result) {
      router.push(result.checkoutPath);
      return;
    }

    setError(result.error);
    setLoading(false);
  }

  if (!isReady) {
    return <div className="min-h-[30vh] animate-pulse bg-charcoal/5" aria-hidden />;
  }

  if (items.length === 0) {
    return (
      <Reveal>
        <div className="mt-16 border border-charcoal/10 bg-stone px-8 py-16 text-center md:px-16 md:py-20">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="mx-auto text-gold/60"
            aria-hidden
          >
            <path d="M12 3.5l2.6 5.27 5.82.85-4.21 4.1.99 5.79L12 16.77l-5.2 2.74.99-5.79-4.21-4.1 5.82-.85z" />
          </svg>
          <p className="mt-6 text-sm leading-relaxed text-charcoal/60">{t("empty")}</p>
          <Link
            href="/artists"
            className="link-underline mt-8 inline-block text-[11px] uppercase tracking-[0.25em] text-gold transition-colors hover:text-gold-muted"
          >
            {t("continueExploring")}
          </Link>
        </div>
      </Reveal>
    );
  }

  return (
    <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_22rem] lg:gap-16">
      <div>
        <p className="mb-8 flex flex-wrap items-center gap-x-1.5 text-[10px] uppercase tracking-[0.3em] text-gold-muted">
          <AnimatedNumber value={count} className="text-gold" />
          <span>{t("piecesLabel")}</span>
          <span className="text-charcoal/25">·</span>
          <span>{t("worksCount", { count: distinctCount })}</span>
        </p>

        <ul className="space-y-0">
          {items.map((item, index) => {
            const linePrice =
              item.priceJpy > 0 ? item.priceJpy * item.quantity : 0;
            const isNew = item.workSlug === lastAddedSlug;

            return (
              <Reveal key={item.workSlug} delay={index * 40}>
                <li
                  className={`flex flex-col gap-6 border-t border-charcoal/10 py-8 transition-colors duration-700 sm:flex-row sm:gap-8 ${
                    isNew ? "selection-row-highlight" : ""
                  }`}
                >
                  <Link
                    href={`/works/${item.workSlug}`}
                    className="relative aspect-[4/5] w-full shrink-0 overflow-hidden bg-ink/5 sm:w-36 md:w-40"
                  >
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.titleJa ?? item.title}
                        fill
                        className="object-cover transition-transform duration-700 hover:scale-105"
                        sizes="(max-width: 640px) 100vw, 160px"
                      />
                    )}
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-6">
                    <div>
                      <Link href={`/works/${item.workSlug}`} className="group">
                        <h2 className="font-serif text-2xl text-charcoal transition-colors group-hover:text-gold">
                          <DualTitle
                            nameJa={item.titleJa ?? undefined}
                            nameEn={item.title}
                          />
                        </h2>
                      </Link>

                      {(item.material || item.dimensions) && (
                        <p className="mt-2 text-[11px] tracking-wide text-charcoal/50">
                          {[item.material, item.dimensions]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      )}

                      <p className="mt-3 font-serif text-lg text-charcoal/80">
                        {item.priceJpy > 0
                          ? formatJpy(item.priceJpy)
                          : t("priceOnRequest")}
                        {item.quantity > 1 && item.priceJpy > 0 && (
                          <span className="ml-2 inline-flex items-center gap-1 text-sm font-sans text-charcoal/50">
                            × <AnimatedNumber value={item.quantity} />
                          </span>
                        )}
                      </p>

                      {!item.available && (
                        <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-charcoal/40">
                          {t("notAvailable")}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-end justify-between gap-4 border-t border-charcoal/5 pt-4">
                      <QuantitySelector
                        value={item.quantity}
                        onChange={(q) => setQuantity(item.workSlug, q)}
                        max={10}
                        disabled={!item.available}
                        compact
                      />
                      <div className="flex items-center gap-6">
                        {linePrice > 0 && (
                          <AnimatedPresence watch={linePrice}>
                            <span className="font-serif text-base text-charcoal">
                              {formatJpy(linePrice)}
                            </span>
                          </AnimatedPresence>
                        )}
                        <button
                          type="button"
                          onClick={() => remove(item.workSlug)}
                          className="text-[10px] uppercase tracking-[0.2em] text-charcoal/40 transition-all duration-300 hover:text-gold active:scale-95"
                        >
                          {t("remove")}
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              </Reveal>
            );
          })}
        </ul>
      </div>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <Reveal delay={80}>
          <div className="border border-charcoal/10 bg-stone p-8 shadow-[0_4px_32px_rgba(12,12,12,0.04)]">
            <h2 className="text-[10px] uppercase tracking-[0.3em] text-gold-muted">
              {t("summary")}
            </h2>

            <dl className="mt-8 space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-charcoal/60">{t("worksSelected")}</dt>
                <dd className="text-charcoal">{distinctCount}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-charcoal/60">{t("totalPieces")}</dt>
                <dd className="text-charcoal">
                  <AnimatedNumber value={count} />
                </dd>
              </div>
              <div className="flex items-center justify-between border-t border-charcoal/10 pt-4">
                <dt className="text-charcoal/60">{t("subtotal")}</dt>
                <dd className="font-serif text-lg text-charcoal">
                  <AnimatedPresence watch={subtotalJpy}>
                    {subtotalJpy > 0 ? formatJpy(subtotalJpy) : t("priceOnRequest")}
                  </AnimatedPresence>
                </dd>
              </div>
            </dl>

            <p className="mt-6 text-[10px] leading-relaxed tracking-wide text-charcoal/45">
              {t("taxNote")}
            </p>

            <button
              type="button"
              onClick={handleCheckout}
              disabled={loading || purchasable.length === 0}
              className="mt-8 w-full border border-charcoal bg-charcoal px-8 py-4 text-[11px] uppercase tracking-[0.25em] text-stone transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-gold hover:bg-ink hover:text-gold disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.99]"
            >
              {loading ? t("preparing") : t("proceedToCheckout")}
            </button>

            {error && (
              <p className="mt-4 text-xs text-charcoal/60" role="alert">
                {error}
              </p>
            )}

            <Link
              href="/artists"
              className="link-underline mt-6 inline-block text-[11px] uppercase tracking-[0.25em] text-charcoal/60 transition-colors hover:text-gold"
            >
              {t("continueExploring")}
            </Link>
          </div>
        </Reveal>
      </aside>
    </div>
  );
}
