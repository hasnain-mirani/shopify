"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search as SearchIcon, X } from "lucide-react";
import { ProductGrid } from "./ProductGrid";
import { ProductGridSkeleton } from "./ProductGridSkeleton";
import { searchProducts } from "@/lib/shopify/actions";
import type { ShopifyProduct } from "@/types";

export interface SearchViewProps {
  initialQuery: string;
  initialResults: ShopifyProduct[];
}

/**
 * Client-side search view.
 *
 * - Reads initial query + results from a parent server component (so bots +
 *   direct URLs still work without JS).
 * - Debounces typing by 300ms; debounce is cleared on blur/submit.
 * - Uses `router.replace` + `useTransition` to keep the URL in sync without
 *   blocking typing.
 */
export function SearchView({ initialQuery, initialResults }: SearchViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<ShopifyProduct[]>(initialResults);
  const [loading, setLoading] = useState(false);
  const [, startTransition] = useTransition();

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRequestIdRef = useRef(0);

  const hasQuery = query.trim().length > 0;

  // Keep the input in sync with the URL's `q` param when browsing back/forward.
  // Uses the "reset state on prop change" pattern with a tracked previous value,
  // so we don't need a setState-inside-effect.
  const urlQuery = searchParams.get("q") ?? "";
  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery);
  if (urlQuery !== prevUrlQuery) {
    setPrevUrlQuery(urlQuery);
    setQuery(urlQuery);
  }

  const runSearch = useMemo(
    () => async (q: string) => {
      const requestId = ++latestRequestIdRef.current;
      if (!q.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await searchProducts(q);
        if (requestId === latestRequestIdRef.current) setResults(data);
      } catch {
        if (requestId === latestRequestIdRef.current) setResults([]);
      } finally {
        if (requestId === latestRequestIdRef.current) setLoading(false);
      }
    },
    [],
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setQuery(next);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (next.trim()) params.set("q", next);
        else params.delete("q");
        const qs = params.toString();
        router.replace(qs ? `?${qs}` : "?", { scroll: false });
      });
      runSearch(next);
    }, 300);
  };

  const clear = () => {
    setQuery("");
    setResults([]);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    startTransition(() => {
      router.replace("?", { scroll: false });
    });
  };

  return (
    <div className="container-shop py-10 md:py-14">
      <header className="mb-8">
        <span className="text-xs uppercase tracking-[0.25em] text-brand-500">
          Search
        </span>
        <h1 className="heading-display text-3xl md:text-4xl text-brand-900 mt-2 mb-6">
          Find what you&apos;re looking for
        </h1>

        <div className="relative max-w-2xl">
          <SearchIcon
            className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-500"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={onInputChange}
            autoFocus
            placeholder="Search products, collections, tags..."
            aria-label="Search"
            className="w-full rounded-full border border-brand-300 bg-white pl-11 pr-11 py-3 text-sm text-brand-900 placeholder:text-brand-400 outline-none focus:border-brand-900 transition-colors"
          />
          {hasQuery && (
            <button
              type="button"
              onClick={clear}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-brand-100 transition-colors"
            >
              <X className="h-4 w-4 text-brand-600" aria-hidden="true" />
            </button>
          )}
        </div>
      </header>

      {loading ? (
        <ProductGridSkeleton count={8} />
      ) : !hasQuery ? (
        <EmptyPrompt />
      ) : results.length === 0 ? (
        <NoResults query={query} />
      ) : (
        <>
          <p className="mb-6 text-sm text-brand-500">
            {results.length} {results.length === 1 ? "result" : "results"} for{" "}
            <span className="text-brand-900">&ldquo;{query}&rdquo;</span>
          </p>
          <ProductGrid products={results} />
        </>
      )}
    </div>
  );
}

function EmptyPrompt() {
  return (
    <div className="py-12 text-center text-sm text-brand-500">
      Start typing to search our catalog.
    </div>
  );
}

function NoResults({ query }: { query: string }) {
  return (
    <div className="py-16 text-center">
      <h2 className="heading-display text-2xl text-brand-900">
        No results for &ldquo;{query}&rdquo;
      </h2>
      <p className="mt-2 text-sm text-brand-600">
        Try a different keyword or browse our collections.
      </p>
    </div>
  );
}
