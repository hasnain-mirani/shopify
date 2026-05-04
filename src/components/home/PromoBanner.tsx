import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { getPromoBanner } from "@/lib/promo-banner";
import { getProductByHandle } from "@/lib/shopify";
import { formatPrice } from "@/lib/utils";

/**
 * Home-page promotional banner, fully admin-driven.
 *
 * Fetches the saved config from `.data/promo-banner.json`, resolves each
 * selected handle against the Storefront API, and renders a warm-glow
 * editorial banner with up to four product tiles plus a CTA.
 *
 * Returns `null` (renders nothing) when the banner is disabled, has no
 * headline, or has no resolvable products — so it's safe to mount on the
 * home page unconditionally.
 */
export async function PromoBanner() {
  const config = await getPromoBanner();

  if (!config.enabled) return null;
  if (!config.headline || config.productHandles.length === 0) return null;

  const handles = config.productHandles.slice(0, 4);
  const products = (
    await Promise.all(
      handles.map((h) => getProductByHandle(h).catch(() => null)),
    )
  ).filter(
    (p): p is NonNullable<typeof p> =>
      !!p && !!p.featuredImage && !!p.priceRange?.minVariantPrice,
  );

  if (products.length === 0) return null;

  return (
    <section className="container-shop py-20 md:py-28">
      <div
        className="relative overflow-hidden rounded-[2.5rem] px-6 py-12 md:px-14 md:py-16"
        style={{
          background:
            "linear-gradient(135deg, #200f00 0%, #1a0d00 50%, #2a1500 100%)",
          border: "1px solid rgba(245,166,35,0.15)",
        }}
      >
        {/* Gold warm glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-16 h-72 w-72 rounded-full opacity-40 blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(245,166,35,0.4), transparent 65%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -right-10 h-80 w-80 rounded-full opacity-30 blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(232,133,10,0.35), transparent 65%)",
          }}
        />

        <div className="relative grid gap-10 md:grid-cols-12 md:items-center">
          {/* ─── Copy ─── */}
          <div className="md:col-span-5">
            <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 font-ui text-[11px] uppercase tracking-[0.3em] backdrop-blur-sm"
              style={{ border: "1px solid rgba(245,166,35,0.2)", background: "rgba(245,166,35,0.08)", color: "#F5A623" }}
            >
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              Limited drop
            </span>
            <h2 className="heading-display mt-5 text-[clamp(2.25rem,4.5vw,3.75rem)] leading-[1.02] text-white">
              {config.headline}
            </h2>
            {config.subheadline && (
              <p className="mt-5 max-w-md font-sans text-base leading-relaxed text-white/70 md:text-lg">
                {config.subheadline}
              </p>
            )}
            <div className="mt-8">
              <Link
                href={config.ctaHref}
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-ui text-sm font-semibold uppercase tracking-[0.14em] text-brand-900 transition-transform hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(135deg, #F5A623, #E8850A)",
                  boxShadow: "0 12px 40px -12px rgba(245,166,35,0.5)",
                }}
              >
                {config.ctaLabel}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* ─── Product tiles ─── */}
          <ul
            className={`md:col-span-7 grid gap-3 sm:gap-4 ${
              products.length === 1
                ? "grid-cols-1"
                : products.length === 2
                  ? "grid-cols-2"
                  : "grid-cols-2"
            }`}
          >
            {products.map((p) => {
              const img = p.featuredImage!;
              const amount = p.priceRange.minVariantPrice.amount;
              const currency = p.priceRange.minVariantPrice.currencyCode;
              return (
                <li key={p.id}>
                  <Link
                    href={`/products/${p.handle}`}
                    className="group relative flex aspect-[4/5] flex-col overflow-hidden rounded-2xl bg-white/95 ring-1 ring-white/10 transition-transform hover:-translate-y-1"
                  >
                    <div className="relative flex-1 overflow-hidden">
                      <Image
                        src={img.url}
                        alt={img.altText ?? p.title}
                        fill
                        sizes="(min-width: 768px) 22vw, 45vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2 bg-white px-3 py-2.5">
                      <span className="truncate font-ui text-xs font-medium text-brand-900">
                        {p.title}
                      </span>
                      <span className="shrink-0 font-ui text-xs font-semibold tabular-nums text-brand-700">
                        {formatPrice(amount, currency)}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default PromoBanner;
