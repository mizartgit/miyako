import artistsData from "../../content/artists.json";
import worksData from "../../content/works.json";
import type { Artist, Work } from "./types";

const artists = artistsData as Artist[];
const works = worksData as Work[];

export function getAllArtists(): Artist[] {
  return artists;
}

export function getArtistBySlug(slug: string): Artist | undefined {
  return artists.find((a) => a.slug === slug);
}

export function getAllWorks(): Work[] {
  return works;
}

export function getWorkBySlug(slug: string): Work | undefined {
  return works.find((w) => w.slug === slug);
}

export function getWorksByArtist(artistSlug: string): Work[] {
  return works.filter((w) => w.artistSlug === artistSlug);
}

export function getFeaturedWorks(): Work[] {
  return works.filter((w) => w.featured);
}

export function getPrimaryFeaturedWork(): Work | undefined {
  return works.find((w) => w.featured);
}

export function getArtistForWork(work: Work): Artist | undefined {
  return getArtistBySlug(work.artistSlug);
}

export function getArtistSlugs(): string[] {
  return artists.map((a) => a.slug);
}

export function getWorkSlugs(): string[] {
  return works.map((w) => w.slug);
}
