"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { AddToSelectionsButton } from "@/components/work/AddToSelectionsButton";
import { InquiryButton } from "@/components/work/InquiryButton";
import { QuantitySelector } from "@/components/work/QuantitySelector";
import { ShareButton } from "@/components/work/ShareButton";
import { VariantSelector } from "@/components/work/VariantSelector";
import type { ProductCommerceState } from "@miyako/shared";

type ProductCommerceProps = {
  commerce: ProductCommerceState;
  workSlug: string;
  workTitle: string;
  workTitleJa: string | null;
  workImage: string;
  workMaterial?: string;
  workDimensions?: string;
  shareUrl: string;
};

export function ProductCommerce({
  commerce,
  workSlug,
  workTitle,
  workTitleJa,
  workImage,
  workMaterial,
  workDimensions,
  shareUrl,
}: ProductCommerceProps) {
  const t = useTranslations("works");
  const { formatJpy } = useCurrency();

  const defaultVariantId =
    commerce.variants.find((v) => v.availableForSale)?.id ??
    commerce.variantId;

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    defaultVariantId,
  );
  const [quantity, setQuantity] = useState(1);

  const maxQuantity = useMemo(() => {
    const variant = commerce.variants.find((v) => v.id === selectedVariantId);
    if (variant?.quantityAvailable != null) {
      return Math.min(10, variant.quantityAvailable);
    }
    return commerce.available ? 10 : 1;
  }, [commerce, selectedVariantId]);

  const priceDisplay =
    commerce.priceJpy > 0 ? formatJpy(commerce.priceJpy) : null;

  return (
    <div className="space-y-8">
      {priceDisplay && (
        <p className="font-serif text-3xl text-charcoal">{priceDisplay}</p>
      )}

      <dl className="space-y-3 text-sm">
        <div className="flex gap-4">
          <dt className="w-28 shrink-0 text-[10px] uppercase tracking-[0.2em] text-gold-muted">
            {t("availability")}
          </dt>
          <dd className={commerce.available ? "text-charcoal/80" : "text-charcoal/50"}>
            {commerce.available ? t("available") : t("soldOut")}
          </dd>
        </div>
        <div className="flex gap-4">
          <dt className="w-28 shrink-0 text-[10px] uppercase tracking-[0.2em] text-gold-muted">
            {t("shipping")}
          </dt>
          <dd className="text-charcoal/80">{t("shippingEstimate")}</dd>
        </div>
      </dl>

      {commerce.variants.length > 0 && (
        <VariantSelector
          variants={commerce.variants}
          selectedId={selectedVariantId}
          onSelect={setSelectedVariantId}
        />
      )}

      {commerce.available && (
        <QuantitySelector
          value={quantity}
          onChange={setQuantity}
          max={maxQuantity}
        />
      )}

      <AddToSelectionsButton
        work={{
          workSlug,
          variantId: selectedVariantId,
          title: workTitle,
          titleJa: workTitleJa,
          priceJpy: commerce.priceJpy,
          image: workImage,
          available: commerce.available,
          material: workMaterial,
          dimensions: workDimensions,
        }}
        quantity={quantity}
      />

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <InquiryButton href={`/contact?work=${workSlug}`} variant="compact" />
        <ShareButton title={workTitleJa ?? workTitle} url={shareUrl} />
      </div>

      <p className="text-[10px] leading-relaxed tracking-wide text-charcoal/45">
        {t("checkoutNotice")}
      </p>
    </div>
  );
}
