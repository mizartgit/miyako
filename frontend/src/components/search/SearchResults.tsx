"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { DualTitle } from "@/components/ui/DualTitle";
import { Link } from "@/i18n/navigation";
import type { SearchResult } from "@/lib/search";

type SearchResultsProps = {
  query: string;
  results: SearchResult;
  onNavigate?: () => void;
  activeIndex?: number;
  compact?: boolean;
  showViewAll?: boolean;
  totalCount?: number;
};

type ResultItem = {
  type: "artist" | "work";
  href: string;
  key: string;
};

export function buildResultItems(results: SearchResult): ResultItem[] {
  return [
    ...results.artists.map((a) => ({
      type: "artist" as const,
      href: `/artists/${a.slug}`,
      key: `artist-${a.slug}`,
    })),
    ...results.works.map((w) => ({
      type: "work" as const,
      href: `/works/${w.slug}`,
      key: `work-${w.slug}`,
    })),
  ];
}

export function SearchResults({
  query,
  results,
  onNavigate,
  activeIndex = -1,
  compact = false,
  showViewAll = false,
  totalCount,
}: SearchResultsProps) {
  const t = useTranslations("search");
  const q = query.trim();

  if (q.length < 2) {
    return (
      <p className="py-8 text-center text-sm text-charcoal/45">
        {t("typeToSearch")}
      </p>
    );
  }

  if (results.artists.length === 0 && results.works.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-charcoal/45">
        {t("noResults")}
      </p>
    );
  }

  let index = 0;

  return (
    <div className={compact ? "space-y-6" : "space-y-12"}>
      {results.artists.length > 0 && (
        <section>
          <h2 className="text-[10px] uppercase tracking-[0.3em] text-gold-muted">
            {t("artists")}
          </h2>
          <ul className="mt-3 divide-y divide-charcoal/8">
            {results.artists.map((artist) => {
              const itemIndex = index++;
              const active = itemIndex === activeIndex;
              return (
                <li key={artist.slug}>
                  <Link
                    href={`/artists/${artist.slug}`}
                    onClick={onNavigate}
                    data-search-index={itemIndex}
                    className={`group flex items-center gap-4 py-3 transition-colors duration-300 ${
                      active ? "text-gold" : "text-charcoal hover:text-gold"
                    }`}
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden bg-ink/5">
                      <Image
                        src={artist.portrait}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-serif text-lg">
                        <DualTitle nameJa={artist.nameJa} nameEn={artist.name} />
                      </p>
                      <p className="mt-0.5 truncate text-[10px] uppercase tracking-[0.15em] opacity-60">
                        {artist.region} · {artist.craft}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {results.works.length > 0 && (
        <section>
          <h2 className="text-[10px] uppercase tracking-[0.3em] text-gold-muted">
            {t("works")}
          </h2>
          <ul
            className={
              compact
                ? "mt-3 divide-y divide-charcoal/8"
                : "mt-6 grid gap-6 sm:grid-cols-2"
            }
          >
            {results.works.map((work) => {
              const itemIndex = index++;
              const active = itemIndex === activeIndex;
              return (
                <li key={work.slug}>
                  <Link
                    href={`/works/${work.slug}`}
                    onClick={onNavigate}
                    data-search-index={itemIndex}
                    className={`group flex items-center gap-4 transition-colors duration-300 ${
                      compact ? "py-3" : "flex-col items-start"
                    } ${active ? "text-gold" : "text-charcoal hover:text-gold"}`}
                  >
                    <div
                      className={`relative shrink-0 overflow-hidden bg-ink/5 ${
                        compact ? "h-12 w-12" : "aspect-[4/5] w-full"
                      }`}
                    >
                      <Image
                        src={work.images[0]}
                        alt=""
                        fill
                        className={`object-cover transition-transform duration-700 ${
                          compact ? "" : "group-hover:scale-105"
                        }`}
                        sizes={compact ? "48px" : "50vw"}
                      />
                    </div>
                    <div className={compact ? "min-w-0" : "mt-3"}>
                      <p className={`truncate font-serif ${compact ? "text-lg" : "text-xl"}`}>
                        <DualTitle nameJa={work.titleJa} nameEn={work.title} />
                      </p>
                      <p className="mt-0.5 truncate text-[10px] uppercase tracking-[0.15em] opacity-60">
                        {work.material}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {showViewAll && totalCount != null && totalCount > 0 && (
        <Link
          href={`/search?q=${encodeURIComponent(q)}`}
          onClick={onNavigate}
          className="block border-t border-charcoal/10 pt-4 text-center text-[11px] uppercase tracking-[0.2em] text-gold-muted transition-colors hover:text-gold"
        >
          {t("viewAllResults", { count: totalCount })}
        </Link>
      )}
    </div>
  );
}
