import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  CollectionCard,
  FeatureSpotlight,
  Hero,
  MarqueeBand,
  NewsletterSection,
  StorySection,
  TestimonialStrip,
  ValueProps,
} from "@/components/home";
import { ProductGrid } from "@/components/product";
import { getCollections, getProducts } from "@/lib/shopify";

export const revalidate = 900; // 15 minutes

export default async function HomePage() {
  const [collections, products] = await Promise.all([
    getCollections().catch(() => []),
    getProducts({ limit: 12 }).catch(() => []),
  ]);

  const featuredCollections = collections.slice(0, 4);
  const spotlightProduct = products[0];
  // Grid shows products 2..9 so the spotlight's hero item doesn't also
  // appear directly below it.
  const gridProducts = products.slice(1, 9);

  return (
    <>
      <Hero />

      <MarqueeBand />

      <ValueProps />

      {/* ─── Collections bento ──────────────────────────────────────── */}
      {featuredCollections.length > 0 && (
        <section className="container-shop py-20 md:py-28">
          <div className="flex items-end justify-between gap-6 mb-10 md:mb-14">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="h-[1px] w-10 bg-brand-700" />
                <span className="font-ui text-[11px] uppercase tracking-[0.3em] text-brand-700">
                  Collections · {featuredCollections.length}
                </span>
              </div>
              <h2 className="heading-display text-4xl md:text-5xl lg:text-6xl text-brand-900">
                Shop by <em className="italic text-brand-700">edit</em>.
              </h2>
              <p className="font-sans text-brand-600 text-base mt-4 max-w-md">
                Four quiet stories — small, curated capsules you can live in.
              </p>
            </div>
            <Link
              href="/collections"
              className="hidden sm:inline-flex items-center gap-2 font-ui text-sm font-medium text-brand-800 hover:text-brand-900 border-b border-brand-300 hover:border-brand-900 pb-0.5 transition-colors"
            >
              View all collections
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 auto-rows-[200px] md:auto-rows-[260px] gap-4 md:gap-5">
            {featuredCollections[0] && (
              <div className="md:col-span-3 md:row-span-2">
                <CollectionCard
                  collection={featuredCollections[0]}
                  priority
                  index={1}
                  aspect="3/4"
                  tone="green"
                  className="h-full w-full"
                />
              </div>
            )}
            {featuredCollections[1] && (
              <div className="md:col-span-3">
                <CollectionCard
                  collection={featuredCollections[1]}
                  priority
                  index={2}
                  aspect="16/9"
                  tone="yellow"
                  className="h-full w-full"
                />
              </div>
            )}
            {featuredCollections[2] && (
              <div className="md:col-span-2">
                <CollectionCard
                  collection={featuredCollections[2]}
                  index={3}
                  aspect="1/1"
                  tone="orange"
                  className="h-full w-full"
                />
              </div>
            )}
            {featuredCollections[3] && (
              <div className="md:col-span-1">
                <CollectionCard
                  collection={featuredCollections[3]}
                  index={4}
                  aspect="1/1"
                  tone="green"
                  className="h-full w-full"
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─── Editorial spotlight for the top product ─── */}
      {spotlightProduct && <FeatureSpotlight product={spotlightProduct} />}

      {/* ─── Big numbers band ─── */}
      <StorySection />

      {/* ─── Featured products ─── */}
      {gridProducts.length > 0 && (
        <section className="container-shop py-20 md:py-28">
          <div className="flex items-end justify-between gap-6 mb-10 md:mb-14">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="h-[1px] w-10 bg-brand-700" />
                <span className="font-ui text-[11px] uppercase tracking-[0.3em] text-brand-700">
                  This week · {String(gridProducts.length).padStart(2, "0")} pieces
                </span>
              </div>
              <h2 className="heading-display text-4xl md:text-5xl lg:text-6xl text-brand-900">
                Featured <em className="italic text-brand-700">pieces</em>.
              </h2>
              <p className="font-sans text-brand-600 text-base mt-4 max-w-md">
                A rotating edit of restocks and quiet new arrivals, hand-picked
                each week.
              </p>
            </div>
            <Link
              href="/shop"
              className="hidden sm:inline-flex items-center gap-2 font-ui text-sm font-medium text-brand-800 hover:text-brand-900 border-b border-brand-300 hover:border-brand-900 pb-0.5 transition-colors"
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
        </section>
      )}

      {/* ─── Testimonials ─── */}
      <TestimonialStrip />

      {/* ─── Light-tone marquee — bookend to the one at the top ─── */}
      <MarqueeBand
        tone="light"
        items={[
          "Free shipping over $100",
          "30-day returns",
          "Lifetime repairs",
          "Carbon-neutral",
          "Small-batch runs",
        ]}
      />

      <NewsletterSection />
    </>
  );
}
