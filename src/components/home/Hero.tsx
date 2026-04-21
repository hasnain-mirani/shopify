import Link from "next/link";
import { ArrowRight, Leaf, Sparkles, Star } from "lucide-react";

/**
 * Editorial hero — full-bleed, magazine-style.
 *
 *  ┌──────────────────────────────────────────────────────────────┐
 *  │  badge     │  H1: Pieces that  [wear in], not out            │
 *  │            │  subcopy                                         │
 *  │            │  [Shop new arrivals] [Explore collections]       │
 *  │            │                                                  │
 *  │            │                           ╔═════════════╗        │
 *  │            │  ★ 4.9                    ║             ║        │
 *  │            │  rating pill              ║  bento art  ║        │
 *  │            │                           ║             ║        │
 *  │  ↓ scroll  │                           ╚═════════════╝        │
 *  └──────────────────────────────────────────────────────────────┘
 *
 * All decorative imagery is synthesized from gradients so the page
 * renders instantly even on a cold Shopify cache.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden isolate">
      {/* Soft sun-wash gradient behind everything.
          Three radial pools mimic the golden-hour light in the
          reference's hero renders. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(900px 600px at 85% 15%, rgba(245,224,74,0.18), transparent 60%), " +
            "radial-gradient(700px 500px at 10% 90%, rgba(242,166,90,0.14), transparent 60%), " +
            "radial-gradient(1200px 800px at 50% 50%, rgba(19,54,31,0.05), transparent 70%), " +
            "linear-gradient(180deg, #f7f8f4 0%, #edeee9 100%)",
        }}
      />

      {/* Subtle grid/dots pattern overlay for that engineered feel. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(13,43,20,0.08) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        }}
      />

      {/* Top padding: header + promo already consume vertical space; large
          pt here stacked with header padding and read as inconsistent gaps. */}
      <div className="container-shop relative grid min-h-[min(88vh,920px)] grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] items-center gap-8 lg:gap-14 pt-8 pb-16 md:pt-12 md:pb-20 lg:pt-14 lg:pb-24">
        {/* ─── Left column: copy + CTAs + stat pills ─── */}
        <div className="flex flex-col gap-7 max-w-xl relative z-10">
          {/* eyebrow */}
          <span className="inline-flex items-center gap-2 self-start font-ui text-[11px] uppercase tracking-[0.28em] text-brand-700 animate-fade-up opacity-0 [animation-delay:60ms]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 rounded-full bg-accent animate-ping opacity-75" />
              <span className="relative rounded-full h-2 w-2 bg-accent" />
            </span>
            The Spring edit · 2026
          </span>

          {/* headline — oversized serif with brush underline on 'wear in' */}
          <h1 className="heading-display text-[clamp(2.75rem,7vw,5.5rem)] text-brand-900 animate-fade-up opacity-0 [animation-delay:160ms]">
            Pieces that{" "}
            <span className="relative inline-block">
              <em className="italic relative z-10">wear in</em>
              {/* hand-painted yellow swoosh underneath */}
              <svg
                aria-hidden="true"
                viewBox="0 0 300 32"
                preserveAspectRatio="none"
                className="absolute left-0 right-0 -bottom-2 w-full h-[18px] md:h-[26px] text-accent"
              >
                <path
                  d="M2 22 Q 80 4, 160 16 T 298 12"
                  stroke="currentColor"
                  strokeWidth="10"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.85"
                />
              </svg>
            </span>
            ,<br className="hidden sm:block" /> not out.
          </h1>

          <p className="font-sans text-brand-600 text-base md:text-lg leading-relaxed max-w-md animate-fade-up opacity-0 [animation-delay:320ms]">
            Considered goods in honest materials — made to last and age
            gracefully. Discover our latest arrivals and restocked favorites.
          </p>

          <div className="flex flex-wrap gap-3 pt-1 animate-fade-up opacity-0 [animation-delay:460ms]">
            <Link href="/shop" className="btn-primary group">
              Shop new arrivals
              <ArrowRight
                aria-hidden="true"
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
            <Link href="/collections" className="btn-outline">
              Explore collections
            </Link>
          </div>

          {/* trust pills */}
          <div className="flex flex-wrap items-center gap-3 pt-6 animate-fade-up opacity-0 [animation-delay:620ms]">
            <StatPill
              icon={<Star className="h-3.5 w-3.5 fill-accent text-accent" />}
              label="4.9 / 5"
              sub="2.3k reviews"
            />
            <StatPill
              icon={<Leaf className="h-3.5 w-3.5 text-brand-700" />}
              label="Small-batch"
              sub="100% traceable"
            />
            <StatPill
              icon={<Sparkles className="h-3.5 w-3.5 text-brand-700" />}
              label="Free shipping"
              sub="over $100"
            />
          </div>
        </div>

        {/* ─── Right column: bento collage ─── */}
        <div className="relative h-[480px] md:h-[600px] lg:h-[640px] animate-fade-in opacity-0 [animation-delay:200ms]">
          {/* Big deep-green slab with floating metric card inside */}
          <div className="absolute top-0 left-0 h-[64%] w-[62%] rounded-[28px] bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900 overflow-hidden shadow-[0_30px_60px_-20px_rgba(13,43,20,0.35)]">
            {/* decorative swirl */}
            <div
              aria-hidden="true"
              className="absolute -right-20 -bottom-20 h-72 w-72 rounded-full opacity-30 blur-3xl"
              style={{ background: "radial-gradient(circle, #f5e04a, transparent 70%)" }}
            />
            <div
              aria-hidden="true"
              className="absolute -left-10 -top-10 h-48 w-48 rounded-full opacity-40 blur-2xl"
              style={{ background: "radial-gradient(circle, #f2a65a, transparent 70%)" }}
            />

            {/* huge number in the corner */}
            <div className="absolute left-6 top-6 font-display text-white/25 text-[5rem] leading-none select-none">
              01
            </div>

            {/* floating glass info widget */}
            <div className="absolute left-5 bottom-5 right-5 glass-pill rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
              <div>
                <div className="font-ui text-[10px] uppercase tracking-[0.22em] text-white/70">
                  Delivered
                </div>
                <div className="font-display text-2xl text-white leading-none mt-1">
                  <span className="text-accent">2.3M+</span> pieces
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-white/80" aria-hidden="true" />
            </div>
          </div>

          {/* Yellow gradient tile */}
          <div className="absolute top-0 right-0 h-[42%] w-[42%] rounded-[24px] bg-gradient-to-br from-accent to-accent-dark overflow-hidden">
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-30 mix-blend-overlay"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 30% 30%, white, transparent 60%)",
              }}
            />
            <div className="absolute left-5 top-5 font-ui text-[10px] uppercase tracking-[0.22em] text-brand-900/70">
              Editorial
            </div>
            <div className="absolute left-5 bottom-5 right-5 font-display text-brand-900 text-xl md:text-2xl leading-tight">
              Sun-washed<br />essentials
            </div>
          </div>

          {/* Orange→green tile */}
          <div className="absolute bottom-0 right-0 h-[52%] w-[46%] rounded-[24px] overflow-hidden bg-gradient-to-br from-[color:var(--color-accent-orange)] to-brand-700">
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <div className="font-ui text-[10px] uppercase tracking-[0.22em] text-white/80">
                New collection
              </div>
              <div className="font-display text-white text-2xl md:text-3xl leading-tight mt-1">
                Gilded<br />Hour
              </div>
            </div>
          </div>

          {/* Mini bottom-left card w/ rating */}
          <div className="absolute bottom-6 left-4 md:left-2 glass-pill rounded-2xl px-4 py-3 flex items-center gap-3 max-w-[200px]">
            <div className="flex -space-x-2">
              <Avatar color="bg-accent" letter="A" />
              <Avatar color="bg-brand-700 text-white" letter="M" />
              <Avatar color="bg-[color:var(--color-accent-orange)]" letter="K" />
            </div>
            <div className="leading-none">
              <div className="font-display text-lg text-brand-900">
                Loved by <span className="text-brand-700">10k+</span>
              </div>
              <div className="font-ui text-[10px] uppercase tracking-[0.18em] text-brand-500 mt-1">
                Discerning buyers
              </div>
            </div>
          </div>

          {/* circular rotating badge */}
          <div className="absolute -bottom-3 -right-3 h-24 w-24 md:h-28 md:w-28">
            <div className="relative h-full w-full">
              <div className="absolute inset-0 rounded-full bg-brand-900 flex items-center justify-center shadow-xl">
                <span className="font-display text-accent text-3xl md:text-4xl">→</span>
              </div>
              <svg
                aria-hidden="true"
                viewBox="0 0 100 100"
                className="absolute inset-0 h-full w-full animate-[spin_12s_linear_infinite] text-white"
              >
                <defs>
                  <path id="hero-circle" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
                </defs>
                <text fontSize="10" letterSpacing="3" fill="currentColor" fontFamily="var(--font-ui)">
                  <textPath href="#hero-circle">
                    SHOP NEW · FREE SHIPPING · NEW IN ·
                  </textPath>
                </text>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* scroll indicator */}
      <div className="hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2 flex-col items-center gap-2 text-brand-500 animate-fade-up opacity-0 [animation-delay:800ms]">
        <span className="font-ui text-[10px] uppercase tracking-[0.3em]">
          Scroll
        </span>
        <span className="h-10 w-[1px] bg-gradient-to-b from-brand-500 to-transparent" />
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Small subcomponents                                                        */
/* -------------------------------------------------------------------------- */

function StatPill({
  icon,
  label,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-full surface-card px-3.5 py-2">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100">
        {icon}
      </span>
      <div className="leading-none">
        <div className="font-ui text-[12px] font-semibold text-brand-900">
          {label}
        </div>
        <div className="font-ui text-[10px] text-brand-500 mt-0.5">{sub}</div>
      </div>
    </div>
  );
}

function Avatar({ color, letter }: { color: string; letter: string }) {
  return (
    <span
      className={`h-7 w-7 rounded-full ring-2 ring-white flex items-center justify-center font-ui text-[11px] font-bold text-brand-900 ${color}`}
    >
      {letter}
    </span>
  );
}

export default Hero;
