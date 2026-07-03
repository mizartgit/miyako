import type { MetadataRoute } from "next";
import { getArtistSlugs, getWorkSlugs } from "@/lib/content";

const BASE_URL = "https://miyako.art";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/mission", "/artists", "/contact"].map(
    (path) => ({
      url: `${BASE_URL}${path}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : 0.8,
    }),
  );

  const artistRoutes = getArtistSlugs().map((slug) => ({
    url: `${BASE_URL}/artists/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const workRoutes = getWorkSlugs().map((slug) => ({
    url: `${BASE_URL}/works/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...artistRoutes, ...workRoutes];
}
