import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass, Layers, Sparkles } from "lucide-react";
import { CollectionCard } from "@/components/home";
import { MarqueeBand } from "@/components/home";
import { getCollections } from "@/lib/shopify";
import { buildPageMetadata } from "@/lib/metadata";

export const revalidate = 900;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata(
    "Collections",
    "Shop phone accessories, home decor, and bundle deals — three curated collections from Glow Store PK.",
    "/collections",
  );
}

const TONES = ["green", "yellow", "orange"] as const;

export default async function CollectionsPage() {
  const collections = await getCollections().catch(() => []);
  const total = collections.length;
  const indexLabel = String(total).padStart(2, "0");

  const hero = collections[0];
  const bento = collections.slice(1, 5);
  const rest = collections.slice(5);

  return (
    <>
      {/* ───────────────────────── Hero ───────────────────────── */}
      <section
        aria-labelledby="collections-hero-heading"
        className="relative overflow-hidden isolate"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(760px 420px at 85% 15%, rgba(245,164,124,0.25), transparent 60%), " +
              "radial-gradient(640px 360px at 5% 90%, rgba(242,138,173,0.2), transparent 60%), " +
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
              Collections · Glow Drop &rsquo;26
            </span>
            <span className="inline-flex items-baseline gap-1.5 font-ui text-[11px] uppercase tracking-[0.24em] text-brand-500">
              <span className="font-display text-brand-900 text-lg md:text-xl leading-none tabular-nums">
                {indexLabel}
              </span>
              <span>collections live</span>
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 lg:gap-10">
            <div className="max-w-2xl">
              <h1
                id="collections-hero-heading"
                className="heading-display text-[clamp(2.25rem,5.5vw,4.75rem)] text-brand-900"
              >
                Shop by{" "}
                <span className="relative inline-block">
                  <em className="italic relative z-10 text-brand-700">vibe</em>
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
                , not by noise.
              </h1>
              <p className="font-sans text-brand-600 text-[15px] md:text-base max-w-lg mt-5 leading-relaxed">
                Three curated collections — phone accessories, home decor,
                and bundle deals. Refreshed weekly with new glow drops you
                won&rsquo;t find anywhere else.
              </p>
            </div>

            <ul
              className="flex flex-wrap gap-2 lg:justify-end"
              aria-label="Collections highlights"
            >
              <MetaChip
                icon={<Layers className="h-3.5 w-3.5" />}
                label={`${indexLabel} collections`}
              />
              <MetaChip
                icon={<Sparkles className="h-3.5 w-3.5" />}
                label="Bundle & save"
              />
              <Link
                href="/shop"
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-900 text-white pl-3.5 pr-2 py-1.5 font-ui text-[11px] font-semibold uppercase tracking-[0.2em] hover:bg-brand-800 transition-colors"
              >
                Shop everything
                <span
                  aria-hidden="true"
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent text-brand-900 text-[10px]"
                >
                  →
                </span>
              </Link>
            </ul>
          </div>
        </div>
      </section>

      {total === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* ─────────────── Featured + bento ─────────────── */}
          {hero && (
            <section
              aria-label="Featured collections"
              className="container-shop pt-4 pb-16 md:pt-6 md:pb-24"
            >
              <div className="flex items-baseline justify-between gap-4 mb-6 md:mb-8">
                <span className="inline-flex items-center gap-3 font-ui text-[11px] uppercase tracking-[0.28em] text-brand-700">
                  <span aria-hidden="true" className="h-px w-8 bg-accent" />
                  In rotation
                </span>
                <span className="font-ui text-[11px] uppercase tracking-[0.22em] text-brand-500 tabular-nums">
                  01 / {indexLabel}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-6 auto-rows-[220px] md:auto-rows-[260px] gap-4 md:gap-5">
                {/* Featured hero card — very wide */}
                <div className="md:col-span-6 md:row-span-2">
                  <CollectionCard
                    collection={hero}
                    priority
                    index={1}
                    aspect="16/9"
                    tone="green"
                    className="h-full w-full"
                  />
                </div>

                {/* Bento tiles for the next four */}
                {bento[0] && (
                  <div className="md:col-span-3 md:row-span-2">
                    <CollectionCard
                      collection={bento[0]}
                      priority
                      index={2}
                      aspect="3/4"
                      tone="yellow"
                      className="h-full w-full"
                    />
                  </div>
                )}
                {bento[1] && (
                  <div className="md:col-span-3">
                    <CollectionCard
                      collection={bento[1]}
                      priority
                      index={3}
                      aspect="16/9"
                      tone="orange"
                      className="h-full w-full"
                    />
                  </div>
                )}
                {bento[2] && (
                  <div className="md:col-span-2">
                    <CollectionCard
                      collection={bento[2]}
                      index={4}
                      aspect="1/1"
                      tone="green"
                      className="h-full w-full"
                    />
                  </div>
                )}
                {bento[3] && (
                  <div className="md:col-span-1">
                    <CollectionCard
                      collection={bento[3]}
                      index={5}
                      aspect="1/1"
                      tone="yellow"
                      className="h-full w-full"
                    />
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ─────────────── Marquee bookend ─────────────── */}
          <MarqueeBand
            tone="light"
            items={[
              "Phone accessories",
              "Home decor",
              "Bundle deals",
              "New drops weekly",
              "Ships worldwide",
            ]}
          />

          {/* ─────────────── The full index ─────────────── */}
          {rest.length > 0 && (
            <section
              aria-label="All collections"
              className="container-shop py-16 md:py-24"
            >
              <div className="flex items-end justify-between gap-6 mb-10 md:mb-14">
                <div className="max-w-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="h-px w-10 bg-brand-700" />
                    <span className="font-ui text-[11px] uppercase tracking-[0.3em] text-brand-700">
                      The index · {String(rest.length).padStart(2, "0")} more
                    </span>
                  </div>
                  <h2 className="heading-display text-3xl md:text-5xl text-brand-900">
                    Every <em className="italic text-brand-700">collection</em>,
                    in one place.
                  </h2>
                  <p className="font-sans text-brand-600 text-base mt-4 max-w-md">
                    Browse the rest of the shelf — past drops, seasonal
                    bundles, and limited runs.
                  </p>
                </div>
                <Link
                  href="/shop"
                  className="hidden sm:inline-flex items-center gap-2 font-ui text-sm font-medium text-brand-800 hover:text-brand-900 border-b border-brand-300 hover:border-brand-900 pb-0.5 transition-colors"
                >
                  Shop all products
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {rest.map((c, i) => (
                  <CollectionCard
                    key={c.id}
                    collection={c}
                    index={i + 6}
                    aspect="4/5"
                    tone={TONES[i % TONES.length]}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ─────────────── Closing CTA ─────────────── */}
          <section
            aria-label="Can't decide"
            className="container-shop pb-20 md:pb-28"
          >
            <div className="surface-card relative overflow-hidden p-8 md:p-14 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 -right-16 h-80 w-80 rounded-full opacity-40 blur-3xl"
                style={{
                  background:
                    "radial-gradient(circle, rgba(245,164,124,0.55), transparent 65%)",
                }}
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-24 -left-10 h-64 w-64 rounded-full opacity-35 blur-3xl"
                style={{
                  background:
                    "radial-gradient(circle, rgba(242,138,173,0.5), transparent 65%)",
                }}
              />

              <div className="relative max-w-xl">
                <div className="flex items-center gap-3 mb-3">
                  <Compass className="h-4 w-4 text-brand-700" />
                  <span className="font-ui text-[11px] uppercase tracking-[0.3em] text-brand-700">
                    Not sure where to start?
                  </span>
                </div>
                <h3 className="heading-display text-2xl md:text-4xl text-brand-900">
                  Browse the{" "}
                  <em className="italic text-brand-700">full catalog</em>.
                </h3>
                <p className="font-sans text-brand-600 text-sm md:text-base mt-3 max-w-md">
                  Skip the collections and see every piece in the shop — filter
                  by tag, price, or in-stock only.
                </p>
              </div>

              <div className="relative flex flex-wrap gap-3">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 rounded-full bg-brand-900 text-white px-5 py-3 font-ui text-sm font-semibold uppercase tracking-[0.18em] hover:bg-brand-800 transition-colors"
                >
                  Shop everything
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/search" className="btn-outline">
                  Search by keyword
                </Link>
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Bits                                                                       */
/* -------------------------------------------------------------------------- */

function MetaChip({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 backdrop-blur-sm border border-brand-200/60 pl-2.5 pr-3 py-1.5 font-ui text-[11px] font-medium uppercase tracking-[0.18em] text-brand-800">
      <span aria-hidden="true" className="text-accent-dark">
        {icon}
      </span>
      {label}
    </span>
  );
}

function EmptyState() {
  return (
    <section className="container-shop py-20 md:py-28">
      <div className="surface-card p-10 md:p-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/20 text-brand-800 mb-6">
          <Layers className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2 className="heading-display text-3xl md:text-4xl text-brand-900">
          No collections <em className="italic text-brand-700">yet</em>.
        </h2>
        <p className="font-sans text-brand-600 text-sm md:text-base mt-3 max-w-md mx-auto">
          We&rsquo;re curating the next glow drop. In the meantime, wander the
          full catalog — every piece is fair game.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-full bg-brand-900 text-white px-5 py-3 font-ui text-sm font-semibold uppercase tracking-[0.18em] hover:bg-brand-800 transition-colors"
          >
            Shop everything
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/" className="btn-outline">
            Back home
          </Link>
        </div>
      </div>
    </section>
  );
}
