import type { Metadata } from "next";
import { ArtistGrid } from "@/components/artists/ArtistGrid";
import { getAllArtists } from "@/lib/content";

export const metadata: Metadata = {
  title: "Artists",
  description:
    "A deliberately small circle of artisans — each selected for mastery, lineage, and the integrity of their craft.",
};

export default function ArtistsPage() {
  const artists = getAllArtists();

  return (
    <div className="pt-[var(--header-height)]">
      <section className="bg-stone px-6 py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[10px] uppercase tracking-[0.35em] text-gold-muted">
            The Roster
          </p>
          <h1 className="mt-6 font-serif text-4xl text-charcoal md:text-5xl">
            Our Artists
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-sm leading-relaxed text-charcoal/70 md:text-base">
            MIYAKO represents a deliberately small circle of artisans — each
            selected for mastery, lineage, and the integrity of their craft. We
            do not list hundreds of makers. We introduce a few, deeply.
          </p>
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
