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
  const featuredProducts = row1.length > 0 ? row1 : activeProducts.slice(0, 10);

  return (
    <>
      {/* ── Category icon strip ── */}
      <CategoryMenu trendingHref={landingConfig?.trendingHref || "/shop"} />

      {/* ── Unified promotional hero + deals banner ── */}
      <UnifiedBanner promoPersonImageUrl={heroConfig.promoPersonImageUrl} />

      {/* ── Admin-configured promo banner (enable from admin panel) ── */}
      <PromoBanner />

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
