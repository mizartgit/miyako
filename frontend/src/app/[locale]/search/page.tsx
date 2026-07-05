import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/ui/Reveal";
import { SearchPageClient } from "@/components/search/SearchPageClient";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { q } = await searchParams;
  const t = await getTranslations({ locale, namespace: "search" });
  return { title: q ? `${t("resultsFor")} ${q}` : t("title") };
}

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { q = "" } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("search");

  return (
    <div className="bg-stone pt-[var(--header-height)]">
      <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
        <Reveal>
          <h1 className="font-serif text-4xl text-charcoal">{t("title")}</h1>
        </Reveal>

        <Reveal delay={80}>
          <div className="mt-10">
            <SearchPageClient key={q} initialQuery={q} />
          </div>
        </Reveal>
      </div>
    </div>
  );
}
