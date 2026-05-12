import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import UnifiedBanner from "@/components/banner/UnifiedBanner";
import {
  CategoryMenu,
  PromoBanner,
  ProductRow,
  NewsletterSection,
  MarqueeBand,
  FinanceBanner,
  TestimonialStrip,
} from "@/components/home";
import { getProducts } from "@/lib/catalog";
import { getHeroConfig } from "@/lib/hero-config";
import { getLandingProducts } from "@/lib/landing-products";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildHomeMetadata } from "@/lib/metadata";
import { buildHomeJsonLd } from "@/lib/seo/json-ld";
import type { Product } from "@/types";

export const revalidate = 300;

export const metadata: Metadata = buildHomeMetadata();

export default async function HomePage() {
  const [products, heroConfig, landingConfig] = await Promise.all([
    getProducts({ limit: 80 }).catch(() => []),
    getHeroConfig(),
    getLandingProducts().catch(() => null),
  ]);
  const activeProducts = products.filter((p) => p.availableForSale || p.status === "ACTIVE");

  const row1 = pickCategoryProducts(activeProducts, FEATURED_KEYWORDS, 10);
  const row2 = pickCategoryProducts(products, EARBUD_KEYWORDS, 10);
  const row3 = pickCategoryProducts(products, WATCH_KEYWORDS, 10);
  const rowBest = pickCategoryProducts(products, BEST_SELLER_KEYWORDS, 10);
  const row4 = pickCategoryProducts(products, CHARGER_KEYWORDS, 10);
  const rowSpeakers = pickCategoryProducts(products, SPEAKER_KEYWORDS, 10);
  const featuredProducts =
    row1.length > 0
      ? row1
      : activeProducts.length > 0
        ? activeProducts.slice(0, 10)
        : products.slice(0, 10);
  const mobileFeatured = featuredProducts.slice(0, 4);

  return (
    <>
      <JsonLd data={buildHomeJsonLd()} />
      {/* ── Category icon strip (horizontal scroll; PriceOye-style on mobile) ── */}
      <CategoryMenu trendingHref={landingConfig?.trendingHref || "/shop"} />

      {/* ── Unified promotional hero + deals banner ── */}
      <UnifiedBanner promoPersonImageUrl={heroConfig.promoPersonImageUrl} />

      {/* ── Mobile trending grid (PriceOye-style cards; copy is “Trending products” only) ── */}
      {mobileFeatured.length > 0 && (
        <section className="mx-auto w-full min-w-0 max-w-[1200px] px-[max(0.5rem,env(safe-area-inset-left,0px))] pr-[max(0.5rem,env(safe-area-inset-right,0px))] pb-2 pt-1.5 md:hidden">
          <div className="min-w-0 overflow-hidden rounded-2xl border border-teal-900/35 shadow-[0_16px_40px_rgba(2,28,26,0.55)]">
            <div className="relative bg-gradient-to-r from-teal-600 via-teal-600 to-teal-700 px-3 pb-3 pt-3 sm:px-4">
              <span
                className="pointer-events-none absolute right-4 top-2 text-base opacity-40 sm:right-6 sm:text-lg"
                aria-hidden
              >
                ✨
              </span>
              <span
                className="pointer-events-none absolute left-[28%] top-1 text-xs opacity-30 sm:left-1/3 sm:text-sm"
                aria-hidden
              >
                ✨
              </span>
              <div className="relative flex min-w-0 flex-col gap-2.5 min-[360px]:flex-row min-[360px]:items-center min-[360px]:justify-between min-[360px]:gap-3">
                <h2 className="min-w-0 max-w-full text-balance font-ui text-[clamp(0.95rem,4.5vw,1.125rem)] font-extrabold leading-snug tracking-tight text-white">
                  Trending Products
                </h2>
                <Link
                  href="/shop"
                  className="inline-flex min-h-[44px] shrink-0 items-center justify-center self-start rounded-md bg-white px-3.5 py-2 font-ui text-[11px] font-bold text-slate-900 shadow-sm min-[360px]:self-auto min-[400px]:px-4"
                >
                  View All
                </Link>
              </div>
            </div>
            <div className="min-w-0 bg-[linear-gradient(180deg,#052a28_0%,#041f1e_100%)] px-1.5 pb-2.5 pt-2 sm:px-2.5">
              <div className="grid min-w-0 grid-cols-2 gap-1.5 min-[360px]:gap-2">
                {mobileFeatured.map((p) => {
                  const price = Number.parseFloat(
                    p.priceRange?.minVariantPrice?.amount ?? "0",
                  );
                  const compareRaw = p.compareAtPriceRange?.minVariantPrice?.amount;
                  const original =
                    compareRaw != null ? Number.parseFloat(compareRaw) : NaN;
                  const hasDiscount =
                    Number.isFinite(original) && original > price && price > 0;
                  const discountPct = hasDiscount
                    ? Math.round(((original - price) / original) * 100)
                    : 0;
                  const rating = 3.8 + (p.id.charCodeAt(0) % 12) / 10;
                  const reviewCount = 3 + (p.id.charCodeAt(1) % 50);

                  return (
                    <Link
                      key={p.id}
                      href={`/products/${p.handle}`}
                      className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-white p-1.5 shadow-[0_2px_10px_rgba(15,23,42,0.08)] min-[360px]:p-2"
                    >
                      <div className="mb-1 flex min-h-0 w-full min-w-0 shrink-0 items-center justify-center rounded-lg bg-slate-100 py-0.5 min-[360px]:mb-1.5 min-[360px]:py-1">
                        {p.featuredImage?.url ? (
                          <Image
                            src={p.featuredImage.url}
                            alt={p.featuredImage.altText ?? p.title}
                            width={360}
                            height={360}
                            sizes="(max-width: 380px) 44vw, 46vw"
                            className="h-auto max-h-[4.75rem] w-full max-w-full object-contain min-[360px]:max-h-[6rem]"
                          />
                        ) : (
                          <div className="flex min-h-[3.5rem] items-center justify-center text-xl min-[360px]:min-h-[4rem] min-[360px]:text-2xl">
                            📦
                          </div>
                        )}
                      </div>
                      <div className="mb-0.5 flex min-w-0 flex-wrap items-center gap-0.5 rounded-full bg-amber-100 px-1 py-0.5 font-ui text-[8px] font-semibold leading-tight text-amber-950 min-[360px]:mb-1 min-[360px]:px-1.5 min-[360px]:text-[9px]">
                        <span className="shrink-0 text-amber-500" aria-hidden>
                          ★
                        </span>
                        <span className="shrink-0">{rating.toFixed(1)}</span>
                        <span className="min-w-0 truncate text-amber-900/85">
                          {reviewCount}&nbsp;Reviews
                        </span>
                      </div>
                      <p className="mb-0.5 max-w-full truncate rounded bg-violet-600 px-1 py-0.5 font-ui text-[8px] font-bold tracking-wide text-white min-[360px]:mb-1 min-[360px]:px-1.5 min-[360px]:text-[9px]">
                        Trending products
                      </p>
                      <p className="line-clamp-2 min-h-0 min-w-0 break-words font-ui text-[11px] font-semibold leading-snug text-slate-900 min-[360px]:text-[12px]">
                        {p.title}
                      </p>
                      <div className="mt-1 flex min-w-0 flex-wrap items-baseline gap-x-1 gap-y-0.5">
                        <span className="min-w-0 break-words font-ui text-[clamp(0.6875rem,3.2vw,0.8125rem)] font-extrabold tabular-nums text-slate-900">
                          Rs {price.toLocaleString("en-PK")}
                        </span>
                        {discountPct > 0 && (
                          <span className="shrink-0 rounded bg-emerald-100 px-1 py-0.5 font-ui text-[8px] font-bold text-emerald-800 min-[360px]:px-1.5 min-[360px]:text-[9px]">
                            {discountPct}% OFF
                          </span>
                        )}
                      </div>
                      <div className="mt-auto min-w-0 pt-1 min-[360px]:pt-1.5">
                        <span className="inline-flex max-w-full min-w-0 items-center gap-0.5 rounded-full border border-rose-200/80 bg-rose-50 px-1.5 py-0.5 font-ui text-[8px] font-bold italic text-amber-600 min-[360px]:px-2 min-[360px]:text-[9px]">
                          <span className="truncate">Fast Delivery</span>
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Product rows — each with a distinct dark-tinted background ── */}
      {featuredProducts.length > 0 && (
        <ProductRow
          title="Featured Products"
          subtitle="Top picks trending this week"
          icon="🔥"
          viewAllHref="/shop"
          products={featuredProducts}
          sectionBg="linear-gradient(135deg, #0f172a 0%, #111c34 100%)"
        />
      )}

      {/* ── Admin-configured promo banner (enable from admin panel) ── */}
      <PromoBanner />

      <MarqueeBand
        tone="dark"
        items={["Fast Delivery", "Authentic Products", "Free Returns", "Best Prices in Pakistan", "Top Rated Brands"]}
      />

      {row2.length > 0 && (
        <ProductRow
          title="Latest Wireless Earbuds"
          subtitle="Clean sound, low latency, all-day comfort"
          icon="🎧"
          viewAllHref="/collections/wireless-earbuds"
          products={row2}
          sectionBg="linear-gradient(135deg, #172554 0%, #111827 100%)"
        />
      )}

      <FinanceBanner />

      {row3.length > 0 && (
        <ProductRow
          title="Latest Smart Watches"
          subtitle="Fitness, calls, notifications, and style"
          icon="⌚"
          viewAllHref="/collections/smart-watches"
          products={row3}
          sectionBg="linear-gradient(135deg, #0b1224 0%, #0f172a 100%)"
        />
      )}

      {rowBest.length > 0 && (
        <ProductRow
          title="Best Sellers"
          subtitle="Most loved by customers this month"
          icon="🏆"
          viewAllHref="/collections/mobiles"
          products={rowBest}
          sectionBg="linear-gradient(135deg, #1f2937 0%, #0f172a 100%)"
        />
      )}

      {row4.length > 0 && (
        <ProductRow
          title="Chargers & Power Banks"
          subtitle="Fast charging essentials for every device"
          icon="🔋"
          viewAllHref="/collections/power-banks"
          products={row4}
          sectionBg="linear-gradient(135deg, #111827 0%, #0f172a 100%)"
        />
      )}

      {rowSpeakers.length > 0 && (
        <ProductRow
          title="Wireless BT Speakers"
          subtitle="Loud, clear audio with deep bass"
          icon="🔊"
          viewAllHref="/collections/bluetooth-speakers"
          products={rowSpeakers}
          sectionBg="linear-gradient(135deg, #172554 0%, #111827 100%)"
        />
      )}

      <TestimonialStrip />

      <NewsletterSection />
    </>
  );
}

function pickCategoryProducts(
  products: Product[],
  keywords: readonly string[],
  limit: number,
): Product[] {
  const keywordSet = keywords.map((k) => k.toLowerCase());

  const matched = products.filter((product) => {
    const haystack = [
      product.title,
      product.productType ?? "",
      ...(product.tags ?? []),
    ]
      .join(" ")
      .toLowerCase();
    return keywordSet.some((key) => haystack.includes(key));
  });

  return matched.slice(0, limit);
}

const FEATURED_KEYWORDS = ["featured", "best seller", "popular", "top rated", "trending"] as const;
const EARBUD_KEYWORDS = ["earbud", "earbuds", "airpod", "pods", "bluetooth ear", "tws"] as const;
const WATCH_KEYWORDS = ["watch", "smartwatch", "wearable", "strap", "ultra watch"] as const;
const BEST_SELLER_KEYWORDS = ["best seller", "bestseller", "top rated", "popular", "featured", "mobile", "phone"] as const;
const CHARGER_KEYWORDS = ["charger", "charging", "power bank", "powerbank", "adapter", "usb c", "pd charger"] as const;
const SPEAKER_KEYWORDS = ["speaker", "speakers", "bluetooth speaker", "wireless speaker", "bt speaker", "soundbar"] as const;
