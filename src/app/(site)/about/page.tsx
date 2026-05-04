import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Hammer,
  Map as MapIcon,
  Quote,
  Ruler,
  Scissors,
  Sparkles,
  Sun,
} from "lucide-react";
import { MarqueeBand, NewsletterSection } from "@/components/home";
import { buildPageMetadata } from "@/lib/metadata";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata(
    "About",
    "Glow Store PK — who we are, how we curate, and why our phone accessories and home decor feel like they belong together.",
    "/about",
  );
}

const PRINCIPLES = [
  {
    Icon: Sparkles,
    title: "Aesthetic first",
    body: "We only stock pieces we'd actually keep. Every case, candle, and cable has to earn its spot with how it looks — and how it feels in your hand.",
  },
  {
    Icon: Hammer,
    title: "Curated, not cluttered",
    body: "One hundred eighty pieces, not ten thousand. If it doesn't pair with something else in the shop, it doesn't make the shelf.",
  },
  {
    Icon: Ruler,
    title: "Built to last",
    body: "MagSafe-grade magnets, real wax candles, hand-finished mirrors. We test every piece in our own homes before it goes live.",
  },
  {
    Icon: Scissors,
    title: "Bundle, don't upsell",
    body: "Pair a phone case with a home piece and you save. No dark patterns, no 'limited-time' fake urgency — just a real discount.",
  },
] as const;

const TIMELINE = [
  {
    year: "2022",
    title: "A bedroom, a ring light, a hunch",
    body: "We started with twelve phone cases and an Instagram account. They sold out the first weekend and the DMs hit differently.",
  },
  {
    year: "2023",
    title: "From cases to corners",
    body: "We realised our customers were photographing their phones next to candles and mirrors. So we added home decor — same aesthetic, same vibe.",
  },
  {
    year: "2024",
    title: "The first bundle",
    body: "Phone case + candle for 15% off. It outsold everything else. Bundle Deals became a permanent shelf, not a promo.",
  },
  {
    year: "2026",
    title: "Shipping worldwide",
    body: "Glow Drop '26 ships to 34 countries. Same hand-packed box, same tissue paper, same little thank-you card.",
  },
] as const;

const MAKERS = [
  {
    name: "Ayesha Khan",
    role: "Founder & lead curator",
    tone: "green",
    initials: "AK",
    quote:
      "I buy for the shop the way I'd buy for my own flat. If I wouldn't put it on a shelf, we don't stock it.",
  },
  {
    name: "Zain Malik",
    role: "Sourcing · Phone category",
    tone: "yellow",
    initials: "ZM",
    quote:
      "A case has to survive a drop and still look good in a flat-lay. We test every one — concrete floors included.",
  },
  {
    name: "Noor Ibrahim",
    role: "Styling · Home category",
    tone: "orange",
    initials: "NI",
    quote:
      "Good home decor is quiet. It shouldn't shout when you walk in — it should make the room exhale.",
  },
] as const;

export default function AboutPage() {
  return (
    <>
      {/* ───────────────────────── Hero ───────────────────────── */}
      <section
        aria-labelledby="about-hero-heading"
        className="relative overflow-hidden isolate"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(820px 480px at 12% 20%, rgba(245,164,124,0.28), transparent 60%), " +
              "radial-gradient(680px 420px at 92% 85%, rgba(242,138,173,0.2), transparent 60%), " +
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

        <div className="container-shop relative pt-14 pb-16 md:pt-20 md:pb-24">
          <div className="flex items-center justify-between gap-4 mb-8 md:mb-10">
            <span className="inline-flex items-center gap-3 font-ui text-[11px] uppercase tracking-[0.28em] text-brand-700">
              <span aria-hidden="true" className="h-px w-10 bg-accent" />
              About · Est. 2022
            </span>
            <span className="inline-flex items-center gap-1.5 font-ui text-[11px] uppercase tracking-[0.24em] text-brand-500">
              <Sun className="h-3.5 w-3.5 text-accent-dark" aria-hidden="true" />
              An aesthetic company
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-14 items-end">
            <div>
              <h1
                id="about-hero-heading"
                className="heading-display text-[clamp(2.5rem,6.5vw,5.5rem)] text-brand-900 leading-[0.95]"
              >
                Aesthetics for your{" "}
                <span className="relative inline-block">
                  <em className="italic relative z-10 text-brand-700">phone</em>
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
                <br className="hidden sm:block" /> and your{" "}
                <em className="italic text-brand-700">home</em>.
              </h1>
              <p className="font-sans text-brand-600 text-base md:text-lg max-w-xl mt-6 leading-relaxed">
                Glow Store PK is a small, independent online shop for the
                aesthetically curious. We curate phone accessories, home
                decor, and bundle deals — so the things on your desk look as
                good as the feed they end up on.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 rounded-full bg-brand-900 text-white px-5 py-3 font-ui text-sm font-semibold uppercase tracking-[0.18em] hover:bg-brand-800 transition-colors"
                >
                  Shop the glow drop
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/contact" className="btn-outline">
                  Say hello
                </Link>
              </div>
            </div>

            {/* Side stat card */}
            <aside
              aria-label="At a glance"
              className="surface-card relative overflow-hidden p-7 md:p-8"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-20 -right-16 h-56 w-56 rounded-full opacity-40 blur-3xl"
                style={{
                  background:
                    "radial-gradient(circle, rgba(245,164,124,0.55), transparent 65%)",
                }}
              />
              <div className="relative">
                <span className="font-ui text-[10px] uppercase tracking-[0.3em] text-brand-700">
                  At a glance
                </span>
                <dl className="mt-5 grid grid-cols-2 gap-y-6 gap-x-4">
                  <Fact value="4" sub="years curating" />
                  <Fact value="180+" sub="pieces in rotation" />
                  <Fact value="34" sub="countries shipped" />
                  <Fact value="48k+" sub="orders delivered" />
                </dl>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ─────────────────── Principles ─────────────────── */}
      <section
        aria-labelledby="principles-heading"
        className="container-shop py-16 md:py-24"
      >
        <div className="flex items-end justify-between gap-6 mb-10 md:mb-14">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-10 bg-brand-700" />
              <span className="font-ui text-[11px] uppercase tracking-[0.3em] text-brand-700">
                Principles · 04
              </span>
            </div>
            <h2
              id="principles-heading"
              className="heading-display text-3xl md:text-5xl lg:text-6xl text-brand-900"
            >
              How we{" "}
              <em className="italic text-brand-700">work</em>.
            </h2>
            <p className="font-sans text-brand-600 text-base mt-4 max-w-md">
              Four rules we wrote down early and never got around to breaking.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {PRINCIPLES.map(({ Icon, title, body }, i) => (
            <article
              key={title}
              className="surface-card relative p-6 md:p-7 flex flex-col gap-4 card-hover"
            >
              <span className="absolute top-5 right-6 font-ui text-[10px] uppercase tracking-[0.22em] text-brand-400 tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 text-brand-800">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="font-display text-xl md:text-2xl text-brand-900 leading-tight">
                {title}
              </h3>
              <p className="font-sans text-sm text-brand-600 leading-relaxed">
                {body}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* ─────────────────── Marquee band ─────────────────── */}
      <MarqueeBand
        tone="light"
        items={[
          "Est. 2022",
          "Hand-picked",
          "Bundle & save",
          "Free worldwide shipping",
          "48k+ happy shoppers",
          "Phone · Home · Glow",
        ]}
      />

      {/* ─────────────────── The story / timeline ─────────────────── */}
      <section
        aria-labelledby="story-heading"
        className="relative overflow-hidden bg-brand-900 text-white isolate"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 -right-20 h-[520px] w-[520px] rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, #f5a47c, transparent 65%)" }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 -left-24 h-[500px] w-[500px] rounded-full opacity-25 blur-3xl"
          style={{ background: "radial-gradient(circle, #f28aad, transparent 65%)" }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.1]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />

        <div className="container-shop relative py-20 md:py-28">
          <div className="flex items-center gap-3 mb-8">
            <span className="h-px w-10 bg-accent" />
            <span className="font-ui text-[11px] uppercase tracking-[0.3em] text-accent">
              The story so far
            </span>
          </div>

          <h2
            id="story-heading"
            className="heading-display text-[clamp(2.25rem,5.5vw,4.5rem)] max-w-3xl text-white leading-[0.95] mb-14 md:mb-20"
          >
            Four years of{" "}
            <em className="italic text-accent">small drops</em>.
          </h2>

          <ol className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-6">
            {TIMELINE.map((entry, i) => (
              <li
                key={entry.year}
                className="relative flex flex-col gap-3 border-t border-white/15 pt-5"
              >
                <span
                  aria-hidden="true"
                  className="absolute -top-[7px] left-0 h-[13px] w-[13px] rounded-full border-2 border-accent bg-brand-900"
                />
                <span className="font-ui text-[11px] uppercase tracking-[0.28em] text-accent tabular-nums">
                  {entry.year} · {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-2xl md:text-[28px] text-white leading-tight">
                  {entry.title}
                </h3>
                <p className="font-sans text-sm text-white/65 leading-relaxed">
                  {entry.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ─────────────────── Makers ─────────────────── */}
      <section
        aria-labelledby="makers-heading"
        className="container-shop py-20 md:py-28"
      >
        <div className="flex items-end justify-between gap-6 mb-10 md:mb-14">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-10 bg-brand-700" />
              <span className="font-ui text-[11px] uppercase tracking-[0.3em] text-brand-700">
                The makers · 03
              </span>
            </div>
            <h2
              id="makers-heading"
              className="heading-display text-3xl md:text-5xl lg:text-6xl text-brand-900"
            >
              The people behind the{" "}
              <em className="italic text-brand-700">glow</em>.
            </h2>
            <p className="font-sans text-brand-600 text-base mt-4 max-w-md">
              A tiny team that hand-picks, photographs, and ships every order.
              There are three of us on the shelf-picking side — the rest is
              packing tape and good coffee.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {MAKERS.map((maker) => (
            <MakerCard key={maker.name} {...maker} />
          ))}
        </div>
      </section>

      {/* ─────────────────── Sustainability band ─────────────────── */}
      <section
        aria-labelledby="sustain-heading"
        className="container-shop pb-16 md:pb-24"
      >
        <div className="surface-card relative overflow-hidden p-8 md:p-14 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -left-16 h-80 w-80 rounded-full opacity-35 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(245,164,124,0.55), transparent 65%)",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -right-10 h-64 w-64 rounded-full opacity-35 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(242,138,173,0.5), transparent 65%)",
            }}
          />

          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="h-4 w-4 text-brand-700" />
              <span className="font-ui text-[11px] uppercase tracking-[0.3em] text-brand-700">
                The promise
              </span>
            </div>
            <h2
              id="sustain-heading"
              className="heading-display text-2xl md:text-4xl text-brand-900"
            >
              Small shop,{" "}
              <em className="italic text-brand-700">big care</em>.
            </h2>
            <p className="font-sans text-brand-600 text-sm md:text-base mt-4 max-w-lg leading-relaxed">
              Every order is hand-packed by a real person. We use recycled
              mailers, plastic-free tissue paper, and a little thank-you card
              in every box. No greenwash — just the stuff we&rsquo;d want
              for ourselves.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/shop" className="btn-outline">
                Browse the shop
              </Link>
              <Link
                href="/collections"
                className="inline-flex items-center gap-2 font-ui text-sm font-medium text-brand-800 hover:text-brand-900 border-b border-brand-300 hover:border-brand-900 pb-0.5 transition-colors"
              >
                Explore collections
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <dl className="relative grid grid-cols-2 gap-5">
            <FootprintFact value="100%" label="Hand-packed orders" />
            <FootprintFact value="0" label="Plastic filler" suffix="g" />
            <FootprintFact value="48k+" label="Happy shoppers" />
            <FootprintFact value="34" label="Countries shipped" />
          </dl>
        </div>
      </section>

      {/* ─────────────────── Pull quote ─────────────────── */}
      <section
        aria-label="A quote from the studio"
        className="container-shop pb-20 md:pb-28"
      >
        <figure className="relative mx-auto max-w-4xl text-center">
          <Quote
            aria-hidden="true"
            className="mx-auto h-10 w-10 text-accent-dark mb-6"
          />
          <blockquote className="heading-display text-3xl md:text-5xl text-brand-900 leading-[1.1]">
            &ldquo;We&rsquo;re not trying to{" "}
            <em className="italic text-brand-700">disrupt</em> anything. We
            just want your phone and your desk to quietly glow.&rdquo;
          </blockquote>
          <figcaption className="mt-6 inline-flex items-center gap-3 font-ui text-[11px] uppercase tracking-[0.3em] text-brand-500">
            <MapIcon className="h-3.5 w-3.5" aria-hidden="true" />
            From the studio · Glow Drop &rsquo;26
          </figcaption>
        </figure>
      </section>

      <NewsletterSection />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Bits                                                                       */
/* -------------------------------------------------------------------------- */

function Fact({ value, sub }: { value: string; sub: string }) {
  return (
    <div>
      <dt className="sr-only">{sub}</dt>
      <dd>
        <div className="font-display text-3xl md:text-4xl text-brand-900 leading-none tabular-nums">
          {value}
        </div>
        <div className="font-ui text-[11px] uppercase tracking-[0.22em] text-brand-500 mt-2">
          {sub}
        </div>
      </dd>
    </div>
  );
}

function FootprintFact({
  value,
  label,
  suffix,
}: {
  value: string;
  label: string;
  suffix?: string;
}) {
  return (
    <div className="border-t border-brand-200 pt-4">
      <div className="font-display text-3xl md:text-4xl text-brand-900 leading-none tabular-nums">
        {value}
        {suffix && (
          <span className="ml-1 font-ui text-base text-brand-500 tracking-wide">
            {suffix}
          </span>
        )}
      </div>
      <div className="font-ui text-[11px] uppercase tracking-[0.22em] text-brand-600 mt-2">
        {label}
      </div>
    </div>
  );
}

function MakerCard({
  name,
  role,
  tone,
  initials,
  quote,
}: {
  name: string;
  role: string;
  tone: "green" | "yellow" | "orange";
  initials: string;
  quote: string;
}) {
  const toneStyles: Record<typeof tone, { bg: string; text: string }> = {
    green: {
      bg: "bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900",
      text: "text-accent",
    },
    yellow: {
      bg: "bg-gradient-to-br from-accent to-accent-dark",
      text: "text-brand-900",
    },
    orange: {
      bg: "bg-gradient-to-br from-[color:var(--color-accent-orange)] to-brand-700",
      text: "text-white",
    },
  };
  const styles = toneStyles[tone];

  return (
    <article className="surface-card overflow-hidden flex flex-col">
      <div className={`relative h-56 md:h-64 ${styles.bg}`}>
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-25 mix-blend-overlay"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 30%, white, transparent 60%)",
          }}
        />
        <span
          aria-hidden="true"
          className={`absolute left-6 top-6 font-display text-[5.5rem] leading-none select-none opacity-90 ${styles.text}`}
        >
          {initials}
        </span>
      </div>
      <div className="p-6 md:p-7 flex flex-col gap-3">
        <div>
          <h3 className="font-display text-xl md:text-2xl text-brand-900 leading-tight">
            {name}
          </h3>
          <p className="font-ui text-[11px] uppercase tracking-[0.22em] text-brand-500 mt-1.5">
            {role}
          </p>
        </div>
        <p className="font-sans text-sm text-brand-600 leading-relaxed italic">
          &ldquo;{quote}&rdquo;
        </p>
      </div>
    </article>
  );
}
