import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/ui/Reveal";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ order_id?: string; display_id?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "checkout" });
  return { title: t("successTitle") };
}

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("checkout");
  const { order_id: orderId, display_id: displayId } = await searchParams;

  return (
    <div className="bg-stone pt-[var(--header-height)]">
      <div className="mx-auto max-w-2xl px-6 py-16 md:py-24">
        <Reveal>
          <p className="text-[10px] uppercase tracking-[0.35em] text-gold-muted">
            {t("successLabel")}
          </p>
          <h1 className="mt-4 font-serif text-4xl text-charcoal">
            {t("successTitle")}
          </h1>
          <p className="mt-6 text-charcoal/70">{t("successMessage")}</p>
          {displayId && (
            <p className="mt-4 text-sm text-charcoal/60">
              {t("orderReference", { id: displayId })}
            </p>
          )}
          {orderId && !displayId && (
            <p className="mt-4 text-sm text-charcoal/60">
              {t("orderReference", { id: orderId.slice(-8) })}
            </p>
          )}
          <div className="mt-10 flex flex-wrap gap-6">
            <Link
              href="/account/orders"
              className="border border-charcoal px-8 py-4 text-[11px] uppercase tracking-[0.25em] text-charcoal transition-colors hover:border-gold hover:text-gold"
            >
              {t("viewOrders")}
            </Link>
            <Link
              href="/works"
              className="link-underline text-sm text-gold"
            >
              {t("continueBrowsing")}
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
