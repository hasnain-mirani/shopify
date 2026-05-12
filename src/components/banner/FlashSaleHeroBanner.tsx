"use client";

import Link from "next/link";
import {
  motion,
  useReducedMotion,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { CountdownTimer } from "./CountdownTimer";
import { UnifiedPersonColumn } from "./UnifiedPersonColumn";

const textEase = [0.22, 1, 0.36, 1] as const;

/** Deterministic decorative dots. */
const DOT_SEEDS = Array.from({ length: 24 }, (_, i) => {
  const s = ((i * 7919) >>> 0) % 997;
  return {
    left: `${(s % 88) + 6}%`,
    top: `${((s * 13) % 80) + 10}%`,
    delay: ((s % 10) * 0.08).toFixed(2),
    dur: (4 + (s % 5)).toFixed(1),
  };
});

type SlideConfig = {
  id: string;
  glow: "amber" | "warm" | "cool";
  line1: string;
  line2Words: string[];
  sub: string;
  cta: string;
  href: string;
};

/** Single static hero — no carousel. */
const HERO_SLIDE: SlideConfig = {
  id: "flash",
  glow: "amber",
  line1: "Flash Sale",
  line2Words: ["Up", "to", "60%", "OFF"],
  sub: "On smartwatches, earbuds & accessories",
  cta: "Shop Flash Sale",
  href: "/shop",
};

function CenterSlideContent({
  slide,
  reduceMotion,
}: {
  slide: SlideConfig;
  reduceMotion: boolean;
}) {
  const wordsL1 = slide.line1.split(/\s+/).filter(Boolean);

  return (
    <div className="flex w-full max-w-[560px] flex-col items-start px-0 text-left">
      <motion.span
        className={cn(
          "mb-2 inline-flex items-center gap-1 rounded-full border border-[rgba(245,166,35,0.35)] bg-[rgba(245,166,35,0.12)] px-[14px] py-[5px] text-[11px] font-semibold uppercase tracking-[0.1em] text-[#f5a623] md:mb-4",
          !reduceMotion && "unified-banner-badge-pulse",
        )}
        initial={reduceMotion ? undefined : { opacity: 0 }}
        animate={reduceMotion ? undefined : { opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.35 }}
      >
        ⚡ LIMITED TIME OFFER
      </motion.span>

      <h2 className="font-ui text-[24px] font-extrabold leading-[1.08] tracking-tight text-white md:text-[44px]">
        <span className="block">
          {wordsL1.map((w, wi) => (
            <motion.span
              key={`${slide.id}-l1-${wi}`}
              className="mr-[0.28em] inline-block"
              initial={reduceMotion ? undefined : { y: 28, opacity: 0 }}
              animate={reduceMotion ? undefined : { y: 0, opacity: 1 }}
              transition={{
                delay: reduceMotion ? 0 : 0.4 + wi * 0.08,
                duration: 0.5,
                ease: textEase,
              }}
            >
              {w}
            </motion.span>
          ))}
        </span>
        <span
          className="mt-0.5 block bg-gradient-to-r from-[#f5a623] to-[#ffd700] bg-clip-text text-[28px] font-black text-transparent md:mt-1 md:text-[50px]"
          style={{
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {slide.line2Words.map((w, wi) => (
            <motion.span
              key={`${slide.id}-l2-${wi}`}
              className="mr-[0.28em] inline-block"
              initial={reduceMotion ? undefined : { y: 32, opacity: 0 }}
              animate={reduceMotion ? undefined : { y: 0, opacity: 1 }}
              transition={{
                delay: reduceMotion ? 0 : 0.42 + (wordsL1.length + wi) * 0.08,
                duration: 0.5,
                ease: textEase,
              }}
            >
              {w}
            </motion.span>
          ))}
        </span>
      </h2>

      <motion.p
        className="mb-3 mt-2 max-w-md text-xs leading-relaxed text-[rgba(255,255,255,0.45)] md:mb-6 md:mt-3 md:text-sm"
        initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ delay: reduceMotion ? 0 : 0.6, duration: 0.45, ease: textEase }}
      >
        {slide.sub}
      </motion.p>

      <motion.div
        initial={reduceMotion ? undefined : { opacity: 0, y: 14 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ delay: reduceMotion ? 0 : 0.62, duration: 0.45, ease: textEase }}
      >
        <CountdownTimer reduceMotion={!!reduceMotion} />
      </motion.div>

      <motion.div
        className="mt-3 w-full md:mt-6"
        initial={reduceMotion ? undefined : { opacity: 0, y: 18 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ delay: reduceMotion ? 0 : 0.75, duration: 0.45, ease: textEase }}
      >
        <Link
          href={slide.href}
          className="group inline-flex w-full max-w-[360px] items-center justify-center gap-2 rounded-[10px] bg-gradient-to-br from-[#f5a623] to-[#e8960f] px-6 py-3 text-sm font-bold text-black shadow-[0_0_28px_rgba(245,166,35,0.35)] transition duration-300 hover:-translate-y-[3px] hover:shadow-[0_0_40px_rgba(245,166,35,0.5)] md:inline-flex md:w-auto md:max-w-none md:px-[36px] md:py-[14px] md:text-[15px]"
        >
          {slide.cta}
          <ArrowRight
            className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1"
            aria-hidden
          />
        </Link>
      </motion.div>
    </div>
  );
}

export default function FlashSaleHeroBanner({
  promoPersonImageUrl,
}: {
  promoPersonImageUrl?: string;
}) {
  const reduceMotion = useReducedMotion();

  const slide = HERO_SLIDE;
  const leftBlob = "rgba(245,166,35,0.1)";
  const rightBlob = "rgba(245,166,35,0.07)";

  return (
    <section
      className="relative isolate w-full overflow-hidden bg-[#03060f] py-3 pb-5 md:h-[520px] md:min-h-[520px] md:pb-0 md:py-0"
      aria-label="SSHUB promotions"
    >
      {/* Base */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[#03060f]" />

      {/* Left blob */}
      <motion.div
        className="pointer-events-none absolute z-[1] h-[400px] w-[400px] rounded-full blur-3xl"
        style={{
          left: "8%",
          top: "45%",
          transform: "translate(-40%, -50%)",
          background: `radial-gradient(circle, ${leftBlob}, transparent 60%)`,
        }}
        initial={false}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45 }}
      />
      {/* Right blob */}
      <motion.div
        className="pointer-events-none absolute z-[1] h-[350px] w-[350px] rounded-full blur-3xl"
        style={{
          right: "2%",
          top: "40%",
          background: `radial-gradient(circle, ${rightBlob}, transparent 60%)`,
        }}
        initial={false}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45 }}
      />

      {/* Dot grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] opacity-90"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(245,166,35,0.05) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />

      {/* SALE watermark center */}
      <div
        className="pointer-events-none absolute left-1/2 top-[42%] z-0 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap font-black leading-none text-[220px] text-[rgba(245,166,35,0.025)] max-md:top-1/3 max-md:text-[72px]"
        style={{ fontWeight: 900 }}
        aria-hidden
      >
        SALE
      </div>

      {/* Drift specks */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 z-[1] overflow-hidden ${reduceMotion ? "opacity-35" : ""}`}
      >
        {DOT_SEEDS.map((d, i) => (
          <span
            key={i}
            className="absolute h-1 w-1 rounded-full bg-[#f5a623]/25"
            style={{
              left: d.left,
              top: d.top,
              animation: reduceMotion
                ? "none"
                : `banner-hero-dot-drift ${d.dur}s ease-in-out ${d.delay}s infinite alternate`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes banner-hero-dot-drift {
          from { transform: translate3d(0, 0, 0); opacity: 0.25; }
          to { transform: translate3d(0, -10px, 0); opacity: 0.5; }
        }
        @keyframes unified-banner-badge-pulse-kf {
          0%, 100% { box-shadow: 0 0 0 0 rgba(245, 166, 35, 0); }
          50% { box-shadow: 0 0 12px rgba(245, 166, 35, 0.4); }
        }
        .unified-banner-badge-pulse {
          animation: unified-banner-badge-pulse-kf 2s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .unified-banner-badge-pulse { animation: none; }
        }
      `}</style>

      {/* Main row — copy first, art column on the right */}
      <div className="relative z-[3] mx-auto flex h-full w-full max-w-[1440px] flex-col gap-0 md:flex-row md:items-center md:justify-between md:gap-6">
        <div className="relative z-[4] order-1 flex min-h-0 w-full shrink-0 flex-col justify-center py-5 pl-4 pr-4 md:order-none md:max-w-[min(640px,54vw)] md:min-h-0 md:flex-none md:py-0 md:pl-8 md:pr-6 lg:pl-10 lg:pr-10">
          <motion.div
            className="flex w-full justify-start"
            initial={reduceMotion ? false : { x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.45, ease: textEase }}
          >
            <CenterSlideContent slide={slide} reduceMotion={!!reduceMotion} />
          </motion.div>
        </div>

        <UnifiedPersonColumn
          reduceMotion={!!reduceMotion}
          inView
          glowTint={slide.glow}
          imageUrl={promoPersonImageUrl}
          imagePriority
        />
      </div>
    </section>
  );
}
