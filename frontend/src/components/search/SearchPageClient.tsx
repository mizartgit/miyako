"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { SearchResults } from "@/components/search/SearchResults";
import { searchContent } from "@/lib/search";

type SearchPageClientProps = {
  initialQuery: string;
};

export function SearchPageClient({ initialQuery }: SearchPageClientProps) {
  const t = useTranslations("search");
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  const results = useMemo(() => searchContent(query), [query]);

  const updateUrl = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      const path = trimmed
        ? `/search?q=${encodeURIComponent(trimmed)}`
        : "/search";
      router.replace(path);
    },
    [router],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (query.trim() !== initialQuery.trim()) {
        updateUrl(query);
      }
    }, 200);
    return () => window.clearTimeout(timer);
  }, [query, initialQuery, updateUrl]);

  return (
    <div>
      <label htmlFor="search-page-input" className="sr-only">
        {t("title")}
      </label>
      <input
        id="search-page-input"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("pagePlaceholder")}
        autoFocus
        className="w-full max-w-xl border-b border-charcoal/15 bg-transparent py-3 font-serif text-2xl text-charcoal outline-none placeholder:text-charcoal/30 focus:border-gold md:text-3xl"
      />

      {query.trim() && (
        <p className="mt-4 text-sm text-charcoal/60">
          {t("resultsFor")} &ldquo;{query.trim()}&rdquo;
        </p>
      )}

      <div className="mt-12">
        <SearchResults query={query} results={results} />
      </div>
    </div>
  );
}
