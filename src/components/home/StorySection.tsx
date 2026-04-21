"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Stat {
  value: number;
  suffix?: string;
  label: string;
  sub: string;
}

const STATS: Stat[] = [
  { value: 2_300_000, suffix: "+", label: "Pieces delivered", sub: "since 2018" },
  { value: 18, label: "Countries", sub: "shipped monthly" },
  { value: 98, suffix: "%", label: "Customer rating", sub: "2.3k reviews" },
  { value: 12, label: "Craftspeople", sub: "small-batch workshops" },
];

/**
 * Editorial numbers band.
 *
 * Full-bleed deep-green canvas with a huge script headline and four
 * animated counter stats. Counters tick on scroll-into-view (once),
 * honoring `prefers-reduced-motion`.
 */
export function StorySection() {
  return (
    <section
      aria-labelledby="story-heading"
      className="relative overflow-hidden bg-brand-900 text-white isolate"
    >
      {/* Decorative sun-pools */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -left-24 h-[500px] w-[500px] rounded-full opacity-25 blur-3xl"
        style={{ background: "radial-gradient(circle, #f5e04a, transparent 65%)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-20 h-[520px] w-[520px] rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #f2a65a, transparent 65%)" }}
      />

      {/* Dot grid */}
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
        {/* Top eyebrow rail */}
        <div className="flex items-center justify-between mb-10 md:mb-14">
          <div className="flex items-center gap-3">
            <span className="h-[1px] w-10 bg-accent" />
            <span className="font-ui text-[11px] uppercase tracking-[0.3em] text-accent">
              By the numbers
            </span>
          </div>
          <Link
            href="/about"
            className="group hidden md:inline-flex items-center gap-2 font-ui text-sm text-white/70 hover:text-white transition-colors"
          >
            Our story
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Tagline */}
        <h2
          id="story-heading"
          className="heading-display text-[clamp(2.5rem,6vw,5rem)] max-w-3xl text-white leading-[0.95] mb-16 md:mb-24"
        >
          Built slowly,{" "}
          <em className="italic text-accent">loved loudly</em>.
        </h2>

        {/* Stats */}
        <dl className="grid grid-cols-2 lg:grid-cols-4 gap-10 md:gap-6">
          {STATS.map((stat, i) => (
            <StatBlock key={stat.label} stat={stat} delayMs={i * 120} />
          ))}
        </dl>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Counter block with scroll-into-view animation                              */
/* -------------------------------------------------------------------------- */

function StatBlock({ stat, delayMs }: { stat: Stat; delayMs: number }) {
  const [display, setDisplay] = useState(0);
  const [fired, setFired] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (fired) return;
    const node = ref.current;
    if (!node) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setFired(true);
        io.disconnect();

        if (reduce) {
          setDisplay(stat.value);
          return;
        }

        const duration = 1600;
        const start = performance.now() + delayMs;

        const tick = (now: number) => {
          const t = Math.min(1, Math.max(0, (now - start) / duration));
          // ease-out cubic
          const eased = 1 - Math.pow(1 - t, 3);
          setDisplay(Math.round(stat.value * eased));
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.25 },
    );

    io.observe(node);
    return () => io.disconnect();
  }, [stat.value, delayMs, fired]);

  return (
    <div ref={ref} className="flex flex-col gap-2 border-t border-white/15 pt-5">
      <div className="font-display text-5xl md:text-6xl lg:text-7xl text-accent leading-none tabular-nums tracking-tight">
        {formatCompact(display)}
        {stat.suffix}
      </div>
      <dt className="font-ui text-sm font-semibold text-white uppercase tracking-[0.14em] mt-2">
        {stat.label}
      </dt>
      <dd className="font-sans text-sm text-white/55">{stat.sub}</dd>
    </div>
  );
}

/** 2,300,000 → "2.3M", 98 → "98", 1500 → "1.5k". */
function formatCompact(n: number): string {
  if (n >= 1_000_000) {
    return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (n >= 10_000) {
    return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return n.toLocaleString();
}

export default StorySection;
