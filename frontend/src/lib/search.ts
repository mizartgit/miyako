import {
  getAllArtists,
  getAllWorks,
  getArtistForWork,
} from "@/lib/content";
import type { Artist, Work } from "@/lib/types";

export type SearchResult = {
  artists: Artist[];
  works: Work[];
};

export type SearchLimits = {
  artists?: number;
  works?: number;
};

function matchesQuery(text: string | undefined, query: string): boolean {
  if (!text) return false;
  return text.toLowerCase().includes(query);
}

export function searchContent(
  query: string,
  limits?: SearchLimits,
): SearchResult {
  const q = query.trim().toLowerCase();
  if (q.length < 2) {
    return { artists: [], works: [] };
  }

  const artists = getAllArtists().filter(
    (artist) =>
      matchesQuery(artist.name, q) ||
      matchesQuery(artist.nameJa, q) ||
      matchesQuery(artist.region, q) ||
      matchesQuery(artist.craft, q) ||
      matchesQuery(artist.introShort, q),
  );

  const works = getAllWorks().filter((work) => {
    const artist = getArtistForWork(work);
    return (
      matchesQuery(work.title, q) ||
      matchesQuery(work.titleJa, q) ||
      matchesQuery(work.material, q) ||
      matchesQuery(work.technique, q) ||
      matchesQuery(work.region, q) ||
      matchesQuery(artist?.name, q) ||
      matchesQuery(artist?.nameJa, q) ||
      matchesQuery(artist?.craft, q) ||
      matchesQuery(artist?.region, q)
    );
  });

  return {
    artists: limits?.artists ? artists.slice(0, limits.artists) : artists,
    works: limits?.works ? works.slice(0, limits.works) : works,
  };
}

export function countSearchResults(query: string): number {
  const { artists, works } = searchContent(query);
  return artists.length + works.length;
}
