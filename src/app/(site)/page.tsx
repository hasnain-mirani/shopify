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
import { buildHomeJsonLd } from "@/lib/seo/json-ld";
import type { Product } from "@/types";

export const revalidate = 300;

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

      {/* ── Mobile-first quick featured block (structure-focused) ── */}
      {mobileFeatured.length > 0 && (
        <section className="mx-auto w-full max-w-[1200px] px-3 pb-2 pt-2 md:hidden">
          <div className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,#0c1a33_0%,#0a152a_100%)] p-3 shadow-[0_18px_45px_rgba(2,6,23,0.45)]">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="font-ui text-[11px] uppercase tracking-[0.16em] text-white/70">
                  Featured now
                </p>
                <h2 className="font-ui text-lg font-bold text-white">Top Picks</h2>
              </div>
              <Link
                href="/shop"
                className="rounded-full border border-white/20 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold text-white/90"
              >
                View All
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {mobileFeatured.map((p) => {
                const price = Number.parseFloat(
                  p.priceRange?.minVariantPrice?.amount ?? "0",
                );
                return (
                  <Link
                    key={p.id}
                    href={`/products/${p.handle}`}
                    className="rounded-xl border border-white/10 bg-[rgba(255,255,255,0.03)] p-2"
                  >
                    <div className="relative mb-2 aspect-square overflow-hidden rounded-lg bg-[#0c1730]">
                      {p.featuredImage?.url ? (
                        <Image
                          src={p.featuredImage.url}
                          alt={p.featuredImage.altText ?? p.title}
                          fill
                          sizes="45vw"
                          className="object-contain p-2"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xl">📦</div>
                      )}
                    </div>
                    <p className="line-clamp-1 font-ui text-[12px] font-semibold text-white">
                      {p.title}
                    </p>
                    <p className="mt-1 font-ui text-[12px] font-bold text-[#f5a623]">
                      Rs {price.toLocaleString("en-PK")}
                    </p>
                  </Link>
                );
              })}
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
