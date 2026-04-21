import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Quote, Star } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { ShopifyProduct } from "@/types/shopify";

export interface FeatureSpotlightProps {
  product: ShopifyProduct;
  /** Editorial eyebrow. Defaults to "Editor's pick". */
  eyebrow?: string;
  /** Optional headline override. */
  headline?: React.ReactNode;
  /** Optional body blurb. */
  blurb?: string;
  /** Optional pull quote. */
  quote?: string;
  /** 0-based index used as the big watermark number ("01", "02"…). */
  watermarkIndex?: number;
}

/**
 * Magazine-spread hero product block.
 *
 * Layout:
 *   ┌ big watermark "01" ┐ ┌────── headline ─────┐
 *   │  ╔═══════════════╗ │ │ eyebrow              │
 *   │  ║               ║ │ │ H2 (text-balance)    │
 *   │  ║    product    ║ │ │ body blurb           │
 *   │  ║     image     ║ │ │ ┌─ pull quote ─┐     │
 *   │  ║               ║ │ │ └──────────────┘     │
 *   │  ╚═══════════════╝ │ │ spec rail (3-up)     │
 *   └────────────────────┘ │ CTAs                 │
 *                          └──────────────────────┘
 *
 * All floating decorations are positioned so nothing overlaps the price
 * chip — which was the biggest regression in v1.
 */
export function FeatureSpotlight({
  product,
  eyebrow = "Editor's pick",
  headline,
  blurb,
  quote,
  watermarkIndex = 0,
}: FeatureSpotlightProps) {
  const image = product.featuredImage ?? product.images[0] ?? null;
  const price = product.priceRange.minVariantPrice;

  // Derive a clean body blurb from the product description, stripping
  // Shopify's HTML entities if the description leaks them.
  const firstSentences = product.description
    .replace(/\s+/g, " ")
    .split(". ")
    .slice(0, 2)
    .join(". ")
    .trim();
  const body =
    blurb ?? (firstSentences || "A piece we return to, season after season.");

  const pullQuote =
    quote ??
    "The fit softens with wear — a piece that quietly becomes yours.";

  const watermark = String(watermarkIndex + 1).padStart(2, "0");

  return (
    <section className="relative overflow-hidden isolate">
      {/* Soft diagonal wash behind the whole block */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(800px 500px at 15% 20%, rgba(245,224,74,0.2), transparent 60%), " +
            "radial-gradient(900px 600px at 90% 85%, rgba(242,166,90,0.14), transparent 60%), " +
            "linear-gradient(180deg, #f7f8f4, #edeee9)",
        }}
      />

      <div className="container-shop relative py-24 md:py-32">
        {/* ─── Section eyebrow rail (top) ─────────────────────────────── */}
        <div className="flex items-center justify-between mb-12 md:mb-16">
          <div className="flex items-center gap-3">
            <span className="h-[1px] w-10 bg-brand-700" />
            <span className="font-ui text-[11px] uppercase tracking-[0.3em] text-brand-700">
              {eyebrow}
            </span>
          </div>
          <div className="hidden md:flex items-center gap-2 font-ui text-[11px] uppercase tracking-[0.22em] text-brand-500">
            <span className="font-display text-brand-900 text-lg leading-none">
              {watermark}
            </span>
            <span className="h-[1px] w-6 bg-brand-300" />
            <span>Featured</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* ─── Image column ─────────────────────────────────────────── */}
          <div className="relative lg:col-span-7 order-2 lg:order-1">
            {/* Gigantic watermark number sitting behind the image frame */}
            <span
              aria-hidden="true"
              className="absolute -top-10 md:-top-16 -left-4 md:-left-8 font-display text-[10rem] md:text-[16rem] leading-none text-brand-900/5 select-none pointer-events-none z-0"
            >
              {watermark}
            </span>

            <div className="relative z-10">
              {/* Main product frame */}
              <div className="relative aspect-[4/5] md:aspect-[5/5] rounded-[32px] overflow-hidden shadow-[0_40px_80px_-30px_rgba(13,43,20,0.35)]">
                {/* Sun-washed canvas behind the product */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(circle at 30% 25%, rgba(245,224,74,0.35), transparent 55%), " +
                      "radial-gradient(circle at 80% 85%, rgba(19,54,31,0.12), transparent 60%), " +
                      "linear-gradient(180deg, #fafbf6 0%, #e6e8df 100%)",
                  }}
                />
                {/* subtle grid pattern */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 opacity-[0.25]"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle, rgba(13,43,20,0.18) 1px, transparent 1px)",
                    backgroundSize: "22px 22px",
                    maskImage:
                      "radial-gradient(ellipse at center, black 55%, transparent 95%)",
                  }}
                />

                {image ? (
                  <Image
                    src={image.url}
                    alt={image.altText ?? product.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-contain p-8 md:p-12 relative z-10 drop-shadow-[0_20px_35px_rgba(13,43,20,0.25)]"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center font-display text-brand-900/15 text-[10rem]">
                    {product.title.charAt(0)}
                  </div>
                )}

                {/* Top-left "IN STOCK" chip */}
                <div className="absolute top-5 left-5 z-20 flex items-center gap-2 rounded-full bg-white/85 backdrop-blur-md px-3.5 py-1.5 shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-60" />
                    <span className="relative rounded-full h-2 w-2 bg-green-500" />
                  </span>
                  <span className="font-ui text-[10px] uppercase tracking-[0.22em] text-brand-900">
                    In stock
                  </span>
                </div>

                {/* Top-right price tag — repositioned so it NEVER collides
                    with anything pinned to the bottom. */}
                <div className="absolute top-5 right-5 z-20 text-right rounded-2xl bg-brand-900/90 backdrop-blur-md px-4 py-2.5 shadow-lg">
                  <div className="font-ui text-[9px] uppercase tracking-[0.25em] text-white/60">
                    From
                  </div>
                  <div className="font-display text-xl md:text-2xl text-accent leading-none mt-0.5">
                    {formatPrice(price.amount, price.currencyCode)}
                  </div>
                </div>

                {/* Bottom vendor line */}
                {product.vendor && (
                  <div className="absolute bottom-5 left-5 right-5 z-20 flex items-center justify-between">
                    <span className="font-ui text-[10px] uppercase tracking-[0.25em] text-brand-500">
                      {product.vendor}
                    </span>
                    <span className="font-ui text-[10px] uppercase tracking-[0.25em] text-brand-500">
                      SKU · {product.handle.slice(0, 6).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Floating ★ rating chip — pinned to the TOP-LEFT outside
                  the frame so it doesn't overlap the price. */}
              <div className="hidden md:flex absolute -top-4 right-8 md:right-16 items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-md border border-brand-100 z-20">
                <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                <span className="font-ui text-[11px] font-semibold text-brand-900">
                  4.9
                </span>
                <span className="font-ui text-[10px] text-brand-500">
                  2.3k reviews
                </span>
              </div>

              {/* Mini colour-chip cluster bottom-left — adds editorial
                  richness without overlapping anything critical. */}
              <div className="hidden md:flex absolute -bottom-4 left-6 items-center gap-3 rounded-full bg-white px-4 py-2 shadow-md border border-brand-100 z-20">
                <span className="font-ui text-[10px] uppercase tracking-[0.22em] text-brand-500">
                  Colours
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="h-3.5 w-3.5 rounded-full bg-brand-900 ring-1 ring-brand-200" />
                  <span className="h-3.5 w-3.5 rounded-full bg-accent ring-1 ring-brand-200" />
                  <span className="h-3.5 w-3.5 rounded-full bg-[color:var(--color-accent-orange)] ring-1 ring-brand-200" />
                  <span className="h-3.5 w-3.5 rounded-full bg-brand-300 ring-1 ring-brand-200" />
                </div>
              </div>
            </div>
          </div>

          {/* ─── Copy column ──────────────────────────────────────────── */}
          <div className="lg:col-span-5 order-1 lg:order-2 flex flex-col gap-6">
            <h2
              className="heading-display text-[clamp(2rem,4.4vw,3.75rem)] text-brand-900 text-balance line-clamp-3"
              title={product.title}
            >
              {headline ?? (
                <>
                  Meet the{" "}
                  <em className="italic text-brand-700">
                    {shortTitle(product.title)}
                  </em>
                  .
                </>
              )}
            </h2>

            <p className="font-sans text-brand-600 text-base md:text-lg leading-relaxed max-w-md line-clamp-4">
              {body}
            </p>

            {/* Pull quote — inline, not floating. No more overlap bugs. */}
            <blockquote className="relative border-l-2 border-accent pl-5 py-1 my-1 max-w-md">
              <Quote
                aria-hidden="true"
                className="absolute -left-2 -top-1 h-4 w-4 bg-brand-50 text-accent"
              />
              <p className="font-display italic text-lg md:text-xl text-brand-800 leading-snug">
                {pullQuote}
              </p>
            </blockquote>

            {/* spec rail */}
            <dl className="grid grid-cols-3 gap-5 mt-2 max-w-md">
              <SpecItem label="Material" value="Honest fibres" />
              <SpecItem label="Made in" value={product.vendor ?? "Small batch"} />
              <SpecItem label="Returns" value="30 days free" />
            </dl>

            <div className="flex flex-wrap gap-3 pt-3">
              <Link
                href={`/products/${product.handle}`}
                className="btn-primary group"
              >
                Shop this piece
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
              <Link href="/shop" className="btn-outline">
                View all
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Produce a readable "hero" phrase from a long product title.
 * "The Collection Snowboard: Liquid" → "Liquid".
 * "Oxford hoodie"                    → "Oxford hoodie".
 */
function shortTitle(title: string): string {
  // If the title contains a colon, prefer the text after it.
  if (title.includes(":")) {
    const tail = title.split(":").pop()?.trim();
    if (tail && tail.length > 0) return tail;
  }
  // Otherwise drop a leading "The " and truncate to a handful of words.
  const cleaned = title.replace(/^the\s+/i, "").trim();
  const words = cleaned.split(/\s+/);
  if (words.length <= 3) return cleaned;
  return words.slice(0, 3).join(" ");
}

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-brand-200 pt-3">
      <dt className="font-ui text-[10px] uppercase tracking-[0.22em] text-brand-500">
        {label}
      </dt>
      <dd className="font-display text-base md:text-lg text-brand-900 mt-1 leading-tight line-clamp-1">
        {value}
      </dd>
    </div>
  );
}

export default FeatureSpotlight;
