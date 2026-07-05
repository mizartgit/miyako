import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ArtistProfile } from "@/components/artists/ArtistProfile";
import { routing } from "@/i18n/routing";
import {
  getArtistBySlug,
  getArtistSlugs,
  getWorksByArtist,
} from "@/lib/content";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getArtistSlugs().map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "artists" });
  const artist = getArtistBySlug(slug);
  if (!artist) return { title: t("notFound") };

  return {
    title: artist.name,
    description: artist.introShort,
  };
}

export default async function ArtistPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const artist = getArtistBySlug(slug);
  if (!artist) notFound();

  const works = getWorksByArtist(slug);

  return (
    <div className="pt-[var(--header-height)]">
      <ArtistProfile artist={artist} works={works} />
    </div>
  );
}
