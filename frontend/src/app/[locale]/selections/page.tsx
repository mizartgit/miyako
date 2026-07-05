import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/ui/Reveal";
import { SelectionsClient } from "@/components/selections/SelectionsClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "selections" });
  return { title: t("title") };
}

export default async function SelectionsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("selections");

  return (
    <div className="bg-stone pt-[var(--header-height)]">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <Reveal>
          <p className="text-[10px] uppercase tracking-[0.35em] text-gold-muted">
            {t("label")}
          </p>
          <h1 className="mt-4 font-serif text-4xl text-charcoal">{t("title")}</h1>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-charcoal/60">
            {t("intro")}
          </p>
        </Reveal>

        <SelectionsClient />
      </div>
    </div>
  );
}
