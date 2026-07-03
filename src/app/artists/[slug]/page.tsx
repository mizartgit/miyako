import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArtistProfile } from "@/components/artists/ArtistProfile";
import {
  getArtistBySlug,
  getArtistSlugs,
  getWorksByArtist,
} from "@/lib/content";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getArtistSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const artist = getArtistBySlug(slug);
  if (!artist) return { title: "Artist Not Found" };

  return {
    title: artist.name,
    description: artist.introShort,
  };
}

export default async function ArtistPage({ params }: Props) {
  const { slug } = await params;
  const artist = getArtistBySlug(slug);
  if (!artist) notFound();

  const works = getWorksByArtist(slug);

  return (
    <div className="pt-[var(--header-height)]">
      <ArtistProfile artist={artist} works={works} />
    </div>
  );
}
