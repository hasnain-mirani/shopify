"use client";

import Link from "next/link";
import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Compass,
  Search as SearchIcon,
  Sparkles,
  X,
} from "lucide-react";
import { ProductGrid } from "./ProductGrid";
import { ProductGridSkeleton } from "./ProductGridSkeleton";
import { searchProducts } from "@/lib/shopify/actions";
import type { ShopifyProduct } from "@/types";

export interface SearchViewProps {
  initialQuery: string;
  initialResults: ShopifyProduct[];
  /** Optional popular suggestion chips. Falls back to a default list. */
  suggestions?: string[];
}

const DEFAULT_SUGGESTIONS = [
  "Phone case",
  "MagSafe charger",
  "Wall mirror",
  "Soy candle",
  "Phone stand",
  "Bundle deal",
];

const BROWSE_LINKS: Array<{ label: string; href: string; hint: string }> = [
  { label: "New arrivals", href: "/shop?sort=CREATED_AT&reverse=true", hint: "Fresh glow drops" },
  { label: "All collections", href: "/collections", hint: "Phone · home · bundle" },
  { label: "Shop everything", href: "/shop", hint: "The full catalog" },
];

/**
 * Client-side search view.
 *
 * - Reads initial query + results from a parent server component (so bots +
 *   direct URLs still work without JS).
 * - Debounces typing by 300ms; debounce is cleared on blur/submit.
 * - Uses `router.replace` + `useTransition` to keep the URL in sync without
 *   blocking typing.
 */
export function SearchView({
  initialQuery,
  initialResults,
  suggestions,
}: SearchViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<ShopifyProduct[]>(initialResults);
  const [loading, setLoading] = useState(false);
  const [, startTransition] = useTransition();

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRequestIdRef = useRef(0);

  const hasQuery = query.trim().length > 0;
  const chips = suggestions?.length ? suggestions : DEFAULT_SUGGESTIONS;

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

  const syncUrl = (next: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (next.trim()) params.set("q", next);
      else params.delete("q");
      const qs = params.toString();
      router.replace(qs ? `?${qs}` : "?", { scroll: false });
    });
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setQuery(next);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      syncUrl(next);
      runSearch(next);
    }, 300);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    syncUrl(query);
    runSearch(query);
    inputRef.current?.blur();
  };

  const applyChip = (term: string) => {
    setQuery(term);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    syncUrl(term);
    runSearch(term);
    inputRef.current?.focus();
  };

  const clear = () => {
    setQuery("");
    setResults([]);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    syncUrl("");
    inputRef.current?.focus();
  };

  return (
    <>
      {/* ───────────────────────── Hero ───────────────────────── */}
      <section
        aria-label="Search"
        className="relative overflow-hidden isolate"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(720px 420px at 90% 15%, rgba(245,164,124,0.25), transparent 60%), " +
              "radial-gradient(620px 360px at 8% 95%, rgba(242,138,173,0.2), transparent 60%), " +
              "linear-gradient(180deg, #fbf7f9 0%, #f1eaf4 100%)",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 opacity-[0.3]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(26,14,46,0.08) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage:
              "radial-gradient(ellipse at center, black 40%, transparent 85%)",
          }}
        />

        <div className="container-shop relative pt-12 pb-10 md:pt-16 md:pb-14">
          <div className="flex items-center justify-between gap-4 mb-6 md:mb-8">
            <span className="inline-flex items-center gap-3 font-ui text-[11px] uppercase tracking-[0.28em] text-brand-700">
              <span aria-hidden="true" className="h-px w-10 bg-accent" />
              Search the shelf
            </span>
            <span className="inline-flex items-center gap-1.5 font-ui text-[11px] uppercase tracking-[0.24em] text-brand-500">
              <Compass className="h-3.5 w-3.5 text-accent-dark" aria-hidden="true" />
              Find by keyword, tag, or material
            </span>
          </div>

          <h1 className="heading-display text-[clamp(2.25rem,5.5vw,4.5rem)] text-brand-900 leading-[0.98] max-w-3xl">
            Find what you&rsquo;re{" "}
            <span className="relative inline-block">
              <em className="italic relative z-10 text-brand-700">after</em>
              <svg
                aria-hidden="true"
                viewBox="0 0 300 24"
                preserveAspectRatio="none"
                className="absolute left-0 right-0 -bottom-1 w-full h-3 md:h-4 text-accent"
              >
                <path
                  d="M2 18 Q 80 4, 160 12 T 298 10"
                  stroke="currentColor"
                  strokeWidth="9"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.85"
                />
              </svg>
            </span>
            .
          </h1>
          <p className="font-sans text-brand-600 text-[15px] md:text-base max-w-lg mt-5 leading-relaxed">
            Search every piece in the shop — by name, material, or the vibe
            you&rsquo;re chasing. Type slowly, we&rsquo;re listening.
          </p>

          {/* ─── Search input ─── */}
          <form
            onSubmit={onSubmit}
            role="search"
            className="mt-8 max-w-2xl"
            aria-label="Site search"
          >
            <div className="relative group">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-full opacity-60 blur-xl transition-opacity duration-300 group-focus-within:opacity-90"
                style={{
                  background:
                    "radial-gradient(180px 60px at 20% 50%, rgba(245,164,124,0.45), transparent 70%)",
                }}
              />
              <SearchIcon
                className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-600 z-10"
                aria-hidden="true"
              />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={onInputChange}
                autoFocus
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="search"
                placeholder="Try &ldquo;phone case&rdquo; or &ldquo;candle&rdquo;"
                aria-label="Search products"
                className="relative w-full rounded-full border border-brand-300 bg-white/80 backdrop-blur-sm pl-12 pr-28 py-4 font-sans text-base text-brand-900 placeholder:text-brand-400 outline-none shadow-[0_8px_24px_-12px_rgba(26,14,46,0.18)] focus:border-brand-900 focus:bg-white focus:shadow-[0_12px_32px_-12px_rgba(26,14,46,0.25)] transition-all"
              />
              {hasQuery ? (
                <button
                  type="button"
                  onClick={clear}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700 hover:bg-brand-200 hover:text-brand-900 transition-colors z-10"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              ) : (
                <span
                  aria-hidden="true"
                  className="absolute right-5 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-1 font-ui text-[10px] uppercase tracking-[0.22em] text-brand-500 z-10"
                >
                  <kbd className="rounded border border-brand-300 bg-white px-1.5 py-0.5 text-[10px] font-medium text-brand-700">
                    ↵
                  </kbd>
                  to search
                </span>
              )}
            </div>
          </form>

          {/* ─── Suggestion chips ─── */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 font-ui text-[10px] uppercase tracking-[0.25em] text-brand-500">
              <Sparkles className="h-3 w-3 text-accent-dark" aria-hidden="true" />
              Popular
            </span>
            {chips.map((term) => {
              const active = query.trim().toLowerCase() === term.toLowerCase();
              return (
                <button
                  key={term}
                  type="button"
                  onClick={() => applyChip(term)}
                  aria-pressed={active}
                  className={
                    active
                      ? "inline-flex items-center rounded-full bg-brand-900 text-white px-3 py-1.5 font-ui text-[11px] font-medium uppercase tracking-[0.18em] transition-colors"
                      : "inline-flex items-center rounded-full bg-white/70 backdrop-blur-sm border border-brand-200/60 px-3 py-1.5 font-ui text-[11px] font-medium uppercase tracking-[0.18em] text-brand-800 hover:border-brand-900 hover:text-brand-900 transition-colors"
                  }
                >
                  {term}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────────────────────── Results body ───────────────────────── */}
      <section
        aria-live="polite"
        aria-busy={loading}
        className="container-shop pb-20 md:pb-28"
      >
        {loading ? (
          <div className="pt-4">
            <ResultsStatus query={query} state="loading" />
            <ProductGridSkeleton count={8} />
          </div>
        ) : !hasQuery ? (
          <EmptyPrompt onPick={applyChip} />
        ) : results.length === 0 ? (
          <NoResults query={query} onPick={applyChip} chips={chips} />
        ) : (
          <div className="pt-2">
            <ResultsStatus
              query={query}
              state="results"
              count={results.length}
              onClear={clear}
            />
            <ProductGrid products={results} />
          </div>
        )}
      </section>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Status strip above the grid                                                */
/* -------------------------------------------------------------------------- */

function ResultsStatus({
  query,
  state,
  count,
  onClear,
}: {
  query: string;
  state: "loading" | "results";
  count?: number;
  onClear?: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-8 pb-5 border-b border-brand-200">
      <div className="flex items-center gap-3">
        <span className="h-px w-8 bg-brand-700" aria-hidden="true" />
        <span className="font-ui text-[11px] uppercase tracking-[0.28em] text-brand-700">
          {state === "loading" ? "Searching" : "Results"}
        </span>
        {query && (
          <span className="font-ui text-sm text-brand-800">
            for{" "}
            <span className="font-display text-brand-900 italic">
              &ldquo;{query}&rdquo;
            </span>
          </span>
        )}
      </div>
      {state === "results" && typeof count === "number" && (
        <div className="flex items-center gap-4">
          <span className="font-ui text-[11px] uppercase tracking-[0.22em] text-brand-500 tabular-nums">
            {String(count).padStart(2, "0")} {count === 1 ? "piece" : "pieces"}
          </span>
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-1.5 font-ui text-[11px] uppercase tracking-[0.22em] text-brand-600 hover:text-brand-900 transition-colors"
            >
              Clear
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Empty prompt (no query yet)                                                */
/* -------------------------------------------------------------------------- */

function EmptyPrompt({ onPick }: { onPick: (term: string) => void }) {
  return (
    <div className="pt-12 md:pt-16 grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-14 items-start">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="h-px w-10 bg-brand-700" />
          <span className="font-ui text-[11px] uppercase tracking-[0.3em] text-brand-700">
            Not sure where to start?
          </span>
        </div>
        <h2 className="heading-display text-3xl md:text-4xl text-brand-900 leading-[1.05]">
          Browse by{" "}
          <em className="italic text-brand-700">vibe</em>, or wander
          the full catalog.
        </h2>
        <p className="font-sans text-brand-600 text-base mt-4 max-w-md leading-relaxed">
          Most shoppers come in looking for a material (matte, leather),
          a piece (case, candle), or a mood (cosy, minimal). Try one of those.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {["Matte", "Leather", "Ceramic", "Cosy", "Minimal", "Pastel"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onPick(t)}
              className="inline-flex items-center rounded-full bg-white border border-brand-200 px-3 py-1.5 font-ui text-[11px] font-medium uppercase tracking-[0.18em] text-brand-800 hover:border-brand-900 hover:text-brand-900 transition-colors"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        {BROWSE_LINKS.map((link, i) => (
          <Link
            key={link.href}
            href={link.href}
            className="group surface-card p-5 md:p-6 flex flex-col gap-3 card-hover"
          >
            <span className="font-ui text-[10px] uppercase tracking-[0.22em] text-brand-400 tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="font-display text-lg md:text-xl text-brand-900 leading-tight">
              {link.label}
            </h3>
            <p className="font-sans text-xs text-brand-600 leading-relaxed">
              {link.hint}
            </p>
            <span className="mt-auto inline-flex items-center gap-1.5 font-ui text-[11px] uppercase tracking-[0.22em] text-brand-800 group-hover:gap-2.5 transition-all">
              Open
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* No results                                                                 */
/* -------------------------------------------------------------------------- */

function NoResults({
  query,
  onPick,
  chips,
}: {
  query: string;
  onPick: (term: string) => void;
  chips: string[];
}) {
  const alts = chips.slice(0, 4);
  return (
    <div className="pt-10 md:pt-14">
      <div className="surface-card relative overflow-hidden p-8 md:p-14 text-center">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-16 h-72 w-72 rounded-full opacity-35 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(245,164,124,0.55), transparent 65%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -right-10 h-64 w-64 rounded-full opacity-35 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(242,138,173,0.5), transparent 65%)",
          }}
        />

        <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/20 text-brand-800 mb-6">
          <SearchIcon className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2 className="relative heading-display text-3xl md:text-4xl text-brand-900 leading-tight">
          Nothing under{" "}
          <em className="italic text-brand-700">&ldquo;{query}&rdquo;</em>.
        </h2>
        <p className="relative font-sans text-brand-600 text-sm md:text-base mt-3 max-w-md mx-auto leading-relaxed">
          We searched every product, collection, and tag. Try a broader term,
          or wander the shelf instead.
        </p>

        {alts.length > 0 && (
          <div className="relative mt-7 flex flex-wrap justify-center gap-2">
            {alts.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => onPick(term)}
                className="inline-flex items-center rounded-full bg-white border border-brand-200 px-3 py-1.5 font-ui text-[11px] font-medium uppercase tracking-[0.18em] text-brand-800 hover:border-brand-900 hover:text-brand-900 transition-colors"
              >
                Try &ldquo;{term}&rdquo;
              </button>
            ))}
          </div>
        )}

        <div className="relative mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-full bg-brand-900 text-white px-5 py-3 font-ui text-sm font-semibold uppercase tracking-[0.18em] hover:bg-brand-800 transition-colors"
          >
            Shop everything
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/collections" className="btn-outline">
            Browse collections
          </Link>
        </div>
      </div>
    </div>
  );
}
