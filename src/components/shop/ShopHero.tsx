import Link from "next/link";
import { Compass, Sparkles } from "lucide-react";

export interface ShopHeroProps {
  /** Active tag, when the page is filtered via `?tag=…`. */
  tag?: string;
  /** Total number of products currently showing. */
  count: number;
}

/**
 * Editorial hero for the shop — mirrors the home page's language
 * (eyebrow rail with accent bar, giant serif H1 with an italic
 * keyword, radial gradient sun-wash, subtle dot grid).
 *
 * Deliberately short in height so the actual product grid can start
 * high on the page. This is a *hat* for the catalog, not a second
 * landing screen.
 */
export function ShopHero({ tag, count }: ShopHeroProps) {
  const indexLabel = String(count).padStart(2, "0");

  return (
    <section aria-labelledby="shop-hero-heading" className="relative overflow-hidden isolate">
      {/* Dark, professional gradient layer matching global theme. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(900px 420px at 88% 20%, rgba(245,158,11,0.2), transparent 62%), " +
            "radial-gradient(700px 360px at 6% 90%, rgba(30,64,175,0.18), transparent 62%), " +
            "linear-gradient(180deg, #0b1224 0%, #0f172a 100%)",
        }}
      />
      <div
        aria-hidden="true"
          className="absolute inset-0 -z-10 opacity-[0.16]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(148,163,184,0.18) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 85%)",
        }}
      />

      <div className="container-shop relative pt-10 pb-8 md:pt-14 md:pb-12">
        {/* Top rail: accent bar + eyebrow on the left, index counter on the right */}
        <div className="flex items-center justify-between gap-4 mb-6 md:mb-8">
          <span className="inline-flex items-center gap-3 font-ui text-[11px] uppercase tracking-[0.28em] text-slate-300">
            <span aria-hidden="true" className="h-px w-10 bg-accent" />
            The shop · Glow Drop &rsquo;26
          </span>
          <span className="inline-flex items-baseline gap-1 font-ui text-[11px] uppercase tracking-[0.24em] text-slate-400">
            <span className="font-display text-slate-100 text-lg md:text-xl leading-none">
              {indexLabel}
            </span>
            <span>pieces in stock</span>
          </span>
        </div>

        {/* Headline + meta */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 lg:gap-10">
          <div className="max-w-2xl">
            <h1
              id="shop-hero-heading"
              className="heading-display text-[clamp(2.25rem,5.5vw,4.5rem)] text-slate-100"
            >
              {tag ? (
                <>
                  All things{" "}
                  <span className="relative inline-block">
                    <em className="italic relative z-10 text-accent-light">
                      {tag}
                    </em>
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
                  .
                </>
              ) : (
                <>
                  Everything we&rsquo;ve{" "}
                  <span className="relative inline-block">
                    <em className="italic relative z-10 text-accent-light">
                      made
                    </em>
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
                  , in one place.
                </>
              )}
            </h1>

            <p className="font-sans text-slate-300 text-[15px] md:text-base max-w-lg mt-5 leading-relaxed">
              {tag
                ? `Pieces tagged ${tag} — filtered for you. Clear the filter to browse the full catalog.`
                : "Phone accessories and home pieces, hand-picked for the aesthetically curious. Filter by mood, sort by whim."}
            </p>
          </div>

          {/* Inline meta chips — signal of craft, no noise */}
          <ul className="flex flex-wrap gap-2 lg:justify-end" aria-label="Shop highlights">
            <MetaChip icon={<Sparkles className="h-3.5 w-3.5" />} label="Bundle & save" />
            <MetaChip icon={<Compass className="h-3.5 w-3.5" />} label="Free worldwide shipping" />
            <Link
              href="/collections"
              className="inline-flex items-center gap-1.5 rounded-full bg-accent text-brand-950 pl-3.5 pr-2 py-1.5 font-ui text-[11px] font-semibold uppercase tracking-[0.2em] hover:bg-accent-light transition-colors"
            >
              Browse collections
              <span aria-hidden="true" className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-950 text-accent text-[10px]">
                →
              </span>
            </Link>
          </ul>
        </div>
      </div>
    </section>
  );
}

function MetaChip({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-900/70 backdrop-blur-sm border border-brand-200/20 pl-2.5 pr-3 py-1.5 font-ui text-[11px] font-medium uppercase tracking-[0.18em] text-slate-200">
      <span aria-hidden="true" className="text-accent">
        {icon}
      </span>
      {label}
    </span>
  );
}

export default ShopHero;
