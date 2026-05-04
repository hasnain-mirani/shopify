import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  CollectionCard,
  FeatureSpotlight,
  Hero,
  MarqueeBand,
  NewsletterSection,
  PromoBanner,
  StorySection,
  TestimonialStrip,
  ValueProps,
} from "@/components/home";
import { ProductGrid } from "@/components/product";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { getCollections, getProducts } from "@/lib/shopify";
import { getLandingProducts } from "@/lib/landing-products";

export const revalidate = 900; // 15 minutes

export default async function HomePage() {
  const [collections, products, landingConfig] = await Promise.all([
    getCollections().catch(() => []),
    getProducts({ limit: 12 }).catch(() => []),
    getLandingProducts().catch(() => null),
  ]);

  const featuredCollections = collections.slice(0, 4);
  const spotlightProduct   = products[0];

  // If admin has configured specific landing products, fetch those.
  // Otherwise fall back to the default product list (products 2-9).
  let gridProducts = products.slice(1, 9);
  let sectionHeading = "Featured Products";
  let sectionSubcopy = "Hand-picked tech accessories, smartwatches and power banks — restocked and updated every week.";

  if (landingConfig && landingConfig.productHandles.length > 0) {
    const { getProductByHandle } = await import("@/lib/shopify");
    const configured = await Promise.all(
      landingConfig.productHandles.map((h) => getProductByHandle(h).catch(() => null)),
    );
    const resolved = configured.filter(Boolean) as typeof products;
    if (resolved.length > 0) {
      gridProducts = resolved;
      sectionHeading = landingConfig.sectionHeading;
      sectionSubcopy = landingConfig.sectionSubcopy;
    }
  }

  return (
    <>
      <Hero />

      <MarqueeBand />

      <ValueProps />

      {/* ─── Collections bento ──────────────────────────────────────── */}
      {featuredCollections.length > 0 && (
        <section className="container-shop py-20 md:py-28">
          <ScrollReveal direction="up" delay={0.1}>
          <div className="flex items-end justify-between gap-6 mb-10 md:mb-14">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="h-[1px] w-10" style={{ background: "rgba(245,166,35,0.5)" }} />
                <span className="font-ui text-[11px] uppercase tracking-[0.3em]" style={{ color: "rgba(245,166,35,0.7)" }}>
                  Collections · {featuredCollections.length}
                </span>
              </div>
              <h2
                className="heading-display text-4xl md:text-5xl lg:text-6xl"
                style={{ color: "white" }}
              >
                Shop by{" "}
                <span
                  style={{
                    background: "linear-gradient(120deg, #FFD580, #F5A623, #E8850A)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    fontStyle: "italic",
                  }}
                >
                  category
                </span>.
              </h2>
              <p className="font-sans text-base mt-4 max-w-md" style={{ color: "rgba(255,255,255,0.5)" }}>
                Phone cases, smartwatches, power banks, wireless chargers and more —
                all in one place.
              </p>
            </div>
            <Link
              href="/collections"
              className="hidden sm:inline-flex items-center gap-2 font-ui text-sm font-medium pb-0.5 transition-colors"
              style={{
                color: "rgba(245,166,35,0.7)",
                borderBottom: "1px solid rgba(245,166,35,0.3)",
              }}
            >
              View all collections
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 auto-rows-[200px] md:auto-rows-[260px] gap-4 md:gap-5">
            {featuredCollections[0] && (
              <div className="md:col-span-3 md:row-span-2">
                <CollectionCard collection={featuredCollections[0]} priority index={1} aspect="3/4" tone="green" className="h-full w-full" delay={0} />
              </div>
            )}
            {featuredCollections[1] && (
              <div className="md:col-span-3">
                <CollectionCard collection={featuredCollections[1]} priority index={2} aspect="16/9" tone="yellow" className="h-full w-full" delay={0.1} />
              </div>
            )}
            {featuredCollections[2] && (
              <div className="md:col-span-2">
                <CollectionCard collection={featuredCollections[2]} index={3} aspect="1/1" tone="orange" className="h-full w-full" delay={0.2} />
              </div>
            )}
            {featuredCollections[3] && (
              <div className="md:col-span-1">
                <CollectionCard collection={featuredCollections[3]} index={4} aspect="1/1" tone="green" className="h-full w-full" delay={0.3} />
              </div>
            )}
          </div>
          </ScrollReveal>
        </section>
      )}

      {/* ─── Admin-configurable promo banner ─── */}
      <PromoBanner />

      {/* ─── Editorial spotlight for the top product ─── */}
      {spotlightProduct && (
        <ScrollReveal direction="up" delay={0.15}>
          <FeatureSpotlight product={spotlightProduct} />
        </ScrollReveal>
      )}

      {/* ─── Stats band ─── */}
      <StorySection />

      {/* ─── Featured products ─── */}
      {gridProducts.length > 0 && (
        <section className="container-shop py-20 md:py-28">
          <ScrollReveal direction="up" delay={0.2}>
          <div className="flex items-end justify-between gap-6 mb-10 md:mb-14">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="h-[1px] w-10" style={{ background: "rgba(245,166,35,0.5)" }} />
                <span className="font-ui text-[11px] uppercase tracking-[0.3em]" style={{ color: "rgba(245,166,35,0.7)" }}>
                  This week · {String(gridProducts.length).padStart(2, "0")} products
                </span>
              </div>
              <h2
                className="heading-display text-4xl md:text-5xl lg:text-6xl"
                style={{ color: "white" }}
              >
                Featured{" "}
                <span
                  style={{
                    background: "linear-gradient(120deg, #FFD580, #F5A623, #E8850A)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    fontStyle: "italic",
                  }}
                >
                  {sectionHeading.replace("Featured ", "") || "Products"}
                </span>.
              </h2>
              <p className="font-sans text-base mt-4 max-w-md" style={{ color: "rgba(255,255,255,0.5)" }}>
                {sectionSubcopy}
              </p>
            </div>
            <Link
              href="/shop"
              className="hidden sm:inline-flex items-center gap-2 font-ui text-sm font-medium pb-0.5 transition-colors"
              style={{
                color: "rgba(245,166,35,0.7)",
                borderBottom: "1px solid rgba(245,166,35,0.3)",
              }}
            >
              Shop all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <ProductGrid products={gridProducts} />

          <div className="mt-12 flex justify-center">
            <Link href="/shop" className="btn-outline">
              View all products
            </Link>
          </div>
          </ScrollReveal>
        </section>
      )}

      {/* ─── Testimonials ─── */}
      <TestimonialStrip />

      {/* ─── Dark marquee — bookend ─── */}
      <MarqueeBand
        tone="dark"
        items={[
          "Free Shipping Over $50",
          "30-Day Easy Returns",
          "Authentic Products Only",
          "Ships Worldwide",
          "New Drops Every Week",
        ]}
      />

      <NewsletterSection />
    </>
  );
}
