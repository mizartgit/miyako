import type { Artist } from "@/lib/types";
import { Reveal } from "@/components/ui/Reveal";
import { ArtistCard } from "./ArtistCard";

type ArtistGridProps = {
  artists: Artist[];
};

export function ArtistGrid({ artists }: ArtistGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {artists.map((artist, i) => (
        <Reveal key={artist.slug} delay={(i % 3) * 100} variant="scale">
          <ArtistCard artist={artist} />
        </Reveal>
      ))}
    </div>
  );
}
