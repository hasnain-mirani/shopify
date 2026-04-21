import type { Metadata } from "next";
import { ProductGrid, SortDropdown } from "@/components/product";
import { decodeSort } from "@/components/product/sort-utils";
import {
  FilterPanel,
  ShopEmpty,
  ShopHero,
  TagStrip,
} from "@/components/shop";
import { getProducts } from "@/lib/shopify";
import { buildPageMetadata } from "@/lib/metadata";
import type { ShopifyProduct } from "@/types/shopify";

interface ShopSearchParams {
  sort?: string;
  tag?: string;
  min?: string;
  max?: string;
  instock?: string;
}

interface PageProps {
  searchParams: Promise<ShopSearchParams>;
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata(
    "Shop all",
    "Browse the full collection. Considered goods in honest materials.",
    "/shop",
  );
}

/**
 * Editorial catalog page. Deliberately image-first and restrained —
 * the hero sets mood, the filter rail gives control, the grid does
 * the work.
 *
 *   1. `ShopHero`     — full-bleed band with italic serif H1, index
 *                        counter, and inline meta chips.
 *   2. Sticky toolbar — URL-driven tag chips + filters popover + sort.
 *   3. `ProductGrid`  — clean 4-col grid of everything that survives
 *                        the filters.
 *   4. `ShopEmpty`    — creative fallback with "clear filter" and
 *                        "browse collections" exits.
 *
 * URL contract:
 *   ?sort=…     — Shopify-side sort.
 *   ?tag=…      — single-tag filter, Shopify-side (`tag:"foo"`).
 *   ?instock=1  — availability filter, Shopify-side (`available_for_sale:true`).
 *   ?min=…&max=…— price bounds, filtered client-side after fetch because
 *                  Storefront API's price query operators aren't reliable.
 */
export default async function ShopPage({ searchParams }: PageProps) {
  const { sort, tag, min, max, instock } = await searchParams;
  const { sortKey, reverse } = decodeSort(sort);

  // Build the Shopify `query` string. Supports AND of multiple clauses.
  const clauses: string[] = [];
  if (tag) clauses.push(`tag:"${escapeQueryValue(tag)}"`);
  if (instock === "1") clauses.push("available_for_sale:true");
  const shopQuery = clauses.length > 0 ? clauses.join(" AND ") : undefined;

  const raw = await getProducts({
    sortKey,
    reverse,
    limit: 48,
    query: shopQuery,
  }).catch<ShopifyProduct[]>(() => []);

  // Client-side price filter. We parse numeric inputs defensively and
  // keep a product if ANY of its variants falls inside the range.
  const minPrice = parsePositiveNumber(min);
  const maxPrice = parsePositiveNumber(max);

  const products = raw.filter((p) => {
    if (minPrice === null && maxPrice === null) return true;
    return p.variants.some((v) => {
      const price = Number.parseFloat(v.price.amount);
      if (!Number.isFinite(price)) return false;
      if (minPrice !== null && price < minPrice) return false;
      if (maxPrice !== null && price > maxPrice) return false;
      return true;
    });
  });

  // Derive the catalog's real price range for the FilterPanel placeholders.
  const priceBounds = computePriceBounds(raw);
  const currencyCode =
    raw[0]?.priceRange?.minVariantPrice?.currencyCode ?? "USD";

  // Derive tag chips from the visible catalog — cap at 10.
  const tagPool = new Set<string>();
  for (const p of raw) {
    for (const t of p.tags) {
      const clean = t.trim();
      if (!clean) continue;
      tagPool.add(clean);
      if (tagPool.size >= 10) break;
    }
    if (tagPool.size >= 10) break;
  }
  const tagList = Array.from(tagPool);
  if (tag && !tagList.some((t) => t.toLowerCase() === tag.toLowerCase())) {
    tagList.unshift(tag);
  }

  const hasProducts = products.length > 0;
  const activeNonTagFilters =
    (minPrice !== null ? 1 : 0) + (maxPrice !== null ? 1 : 0) + (instock === "1" ? 1 : 0);
  const isFiltered = Boolean(tag) || activeNonTagFilters > 0;

  return (
    <>
      <ShopHero tag={tag} count={products.length} />

      {!hasProducts ? (
        <ShopEmpty tag={tag ?? (isFiltered ? "your filters" : undefined)} />
      ) : (
        <>
          {/* Sticky toolbar: tag chips (left) + filters + sort (right).
              Sits just under the site header so it's reachable while
              the user is deep in the grid. */}
          <section
            aria-label="Catalog filters"
            className="sticky top-[68px] md:top-[72px] z-30 bg-brand-50/85 backdrop-blur-md border-y border-brand-200/60"
          >
            <div className="container-shop flex items-center gap-3 md:gap-4 py-3">
              <div className="min-w-0 flex-1">
                <TagStrip tags={tagList} activeTag={tag} />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="hidden sm:inline-flex font-ui text-[11px] uppercase tracking-[0.22em] text-brand-500 tabular-nums">
                  {products.length}{" "}
                  {products.length === 1 ? "piece" : "pieces"}
                </span>
                <span
                  aria-hidden="true"
                  className="hidden sm:inline-block h-4 w-px bg-brand-300"
                />
                <FilterPanel
                  currencyCode={currencyCode}
                  priceBounds={priceBounds}
                />
                <SortDropdown />
              </div>
            </div>
          </section>

          <section
            aria-labelledby="shop-grid-heading"
            className="container-shop pt-8 pb-16 md:pt-12 md:pb-24"
          >
            <header className="flex items-baseline justify-between gap-4 mb-6 md:mb-8">
              <span className="inline-flex items-center gap-3 font-ui text-[11px] uppercase tracking-[0.28em] text-brand-700">
                <span aria-hidden="true" className="h-px w-8 bg-accent" />
                The full catalog
              </span>
              <h2 id="shop-grid-heading" className="sr-only">
                All products
              </h2>
              <span className="font-ui text-[11px] uppercase tracking-[0.22em] text-brand-500 tabular-nums">
                Showing {products.length}
                {raw.length !== products.length && ` / ${raw.length}`}
              </span>
            </header>

            <ProductGrid products={products} priorityFirstRow />
          </section>
        </>
      )}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Escape a user-supplied value so it can sit inside Shopify's `query`
 * parameter without breaking it. Shopify uses Lucene-like syntax, so
 * we only need to escape backslashes and quotes here.
 */
function escapeQueryValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function parsePositiveNumber(raw: string | undefined): number | null {
  if (!raw) return null;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function computePriceBounds(
  products: ShopifyProduct[],
): { min: number; max: number } | undefined {
  let lo = Number.POSITIVE_INFINITY;
  let hi = 0;
  for (const p of products) {
    const mn = Number.parseFloat(p.priceRange.minVariantPrice.amount);
    const mx = Number.parseFloat(p.priceRange.maxVariantPrice.amount);
    if (Number.isFinite(mn)) lo = Math.min(lo, mn);
    if (Number.isFinite(mx)) hi = Math.max(hi, mx);
  }
  if (!Number.isFinite(lo) || hi === 0) return undefined;
  return { min: lo, max: hi };
}
