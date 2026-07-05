import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getArtistSlugs, getWorkSlugs } from "@/lib/content";

const BASE_URL = "https://miyako.art";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ["", "/mission", "/artists", "/contact"];

  const staticRoutes = routing.locales.flatMap((locale) =>
    staticPaths.map((path) => ({
      url: `${BASE_URL}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : 0.8,
    })),
  );

  const artistRoutes = routing.locales.flatMap((locale) =>
    getArtistSlugs().map((slug) => ({
      url: `${BASE_URL}/${locale}/artists/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  );

  const workRoutes = routing.locales.flatMap((locale) =>
    getWorkSlugs().map((slug) => ({
      url: `${BASE_URL}/${locale}/works/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  );

  return [...staticRoutes, ...artistRoutes, ...workRoutes];
}
