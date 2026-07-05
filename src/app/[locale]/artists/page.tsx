import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArtistGrid } from "@/components/artists/ArtistGrid";
import { Reveal } from "@/components/ui/Reveal";
import { routing } from "@/i18n/routing";
import { getAllArtists } from "@/lib/content";

type Props = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "artists" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function ArtistsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("artists");
  const artists = getAllArtists();

  return (
    <div className="pt-[var(--header-height)]">
      <section className="bg-stone px-6 py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="text-[10px] uppercase tracking-[0.35em] text-gold-muted">
              {t("rosterLabel")}
            </p>
            <h1 className="mt-6 font-serif text-4xl text-charcoal md:text-5xl">
              {t("title")}
            </h1>
          </Reveal>
          <Reveal delay={120}>
            <p className="mx-auto mt-8 max-w-2xl text-sm leading-relaxed text-charcoal/70 md:text-base">
              {t("intro")}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-stone px-6 pb-24 md:pb-32">
        <div className="mx-auto max-w-7xl">
          <ArtistGrid artists={artists} />
        </div>
      </section>
    </div>
  );
}
