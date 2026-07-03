import type { Metadata } from "next";
import { ArtistGrid } from "@/components/artists/ArtistGrid";
import { Reveal } from "@/components/ui/Reveal";
import { getAllArtists } from "@/lib/content";

export const metadata: Metadata = {
  title: "Artists",
  description:
    "We partner with a small number of exceptional artisans, celebrating their craftsmanship, heritage, and the traditions.",
};

export default function ArtistsPage() {
  const artists = getAllArtists();

  return (
    <div className="pt-[var(--header-height)]">
      <section className="bg-stone px-6 py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="text-[10px] uppercase tracking-[0.35em] text-gold-muted">
              The Roster
            </p>
            <h1 className="mt-6 font-serif text-4xl text-charcoal md:text-5xl">
              Our Artists
            </h1>
          </Reveal>
          <Reveal delay={120}>
            <p className="mx-auto mt-8 max-w-2xl text-sm leading-relaxed text-charcoal/70 md:text-base">
              We partner with a small number of exceptional artisans, celebrating
              their craftsmanship, heritage, and the traditions.
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
