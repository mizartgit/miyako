import type { Artist } from "@/lib/types";
import { ArtistCard } from "./ArtistCard";

type ArtistGridProps = {
  artists: Artist[];
};

export function ArtistGrid({ artists }: ArtistGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {artists.map((artist) => (
        <ArtistCard key={artist.slug} artist={artist} />
      ))}
    </div>
  );
}
