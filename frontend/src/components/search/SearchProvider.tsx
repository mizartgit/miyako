"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  SearchResults,
  buildResultItems,
} from "@/components/search/SearchResults";
import {
  countSearchResults,
  searchContent,
} from "@/lib/search";

type SearchContextValue = {
  openSearch: () => void;
  closeSearch: () => void;
  isOpen: boolean;
};

const SearchContext = createContext<SearchContextValue | null>(null);

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) {
    throw new Error("useSearch must be used within SearchProvider");
  }
  return ctx;
}

function useDebouncedValue(value: string, delayMs: number): string {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

export function SearchProvider({ children }: { children: ReactNode }) {
  const tNav = useTranslations("nav");
  const tSearch = useTranslations("search");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebouncedValue(query, 120);

  const previewResults = useMemo(
    () => searchContent(debouncedQuery, { artists: 4, works: 5 }),
    [debouncedQuery],
  );

  const totalCount = useMemo(
    () => countSearchResults(debouncedQuery),
    [debouncedQuery],
  );

  const resultItems = useMemo(
    () => buildResultItems(previewResults),
    [previewResults],
  );

  const openSearch = useCallback(() => {
    setOpen(true);
    setActiveIndex(-1);
  }, []);

  const closeSearch = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(-1);
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        setActiveIndex(-1);
      }
      if (e.key === "Escape" && open) {
        closeSearch();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, closeSearch]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      window.requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function navigateTo(href: string) {
    closeSearch();
    router.push(href);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (resultItems.length === 0) return;
      setActiveIndex((i) => (i + 1) % resultItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (resultItems.length === 0) return;
      setActiveIndex((i) => (i <= 0 ? resultItems.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && resultItems[activeIndex]) {
        navigateTo(resultItems[activeIndex].href);
        return;
      }
      const q = query.trim();
      if (q.length >= 2) {
        closeSearch();
        router.push(`/search?q=${encodeURIComponent(q)}`);
      }
    }
  }

  useEffect(() => {
    if (activeIndex < 0 || !panelRef.current) return;
    const el = panelRef.current.querySelector(
      `[data-search-index="${activeIndex}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  return (
    <SearchContext.Provider
      value={{ openSearch, closeSearch, isOpen: open }}
    >
      {children}

      <div
        aria-hidden={!open}
        className={`fixed inset-0 z-[100] transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <button
          type="button"
          aria-label={tNav("closeSearch")}
          onClick={closeSearch}
          className="absolute inset-0 bg-ink/85 backdrop-blur-sm"
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-label={tNav("search")}
          className={`relative mx-auto flex max-h-[85vh] w-full max-w-2xl flex-col px-6 pt-24 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:pt-28 ${
            open ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
          }`}
        >
          <div className="shrink-0">
            <label htmlFor="global-search" className="sr-only">
              {tNav("searchPlaceholder")}
            </label>
            <input
              ref={inputRef}
              id="global-search"
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(-1);
              }}
              onKeyDown={handleKeyDown}
              placeholder={tNav("searchPlaceholder")}
              autoComplete="off"
              className="w-full border-b border-gold/30 bg-transparent py-3 font-serif text-2xl text-stone outline-none placeholder:text-stone/30 focus:border-gold md:text-3xl"
            />
            <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-stone/40">
              {tSearch("keyboardHint")}
            </p>
          </div>

          <div
            ref={panelRef}
            className="mt-6 min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-sm bg-stone/95 p-5 shadow-[0_24px_64px_rgba(12,12,12,0.2)] md:p-6"
          >
            <SearchResults
              query={debouncedQuery}
              results={previewResults}
              onNavigate={closeSearch}
              activeIndex={activeIndex}
              compact
              showViewAll={
                totalCount >
                previewResults.artists.length + previewResults.works.length
              }
              totalCount={totalCount}
            />
          </div>

          <button
            type="button"
            onClick={closeSearch}
            className="mt-4 shrink-0 self-center pb-6 text-[10px] uppercase tracking-[0.25em] text-stone/50 transition-colors hover:text-gold"
          >
            {tNav("closeSearch")}
          </button>
        </div>
      </div>
    </SearchContext.Provider>
  );
}
