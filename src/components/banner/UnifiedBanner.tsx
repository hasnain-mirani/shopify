"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import {
  motion,
  AnimatePresence,
  useInView,
  useReducedMotion,
} from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { BannerFloatingProducts, DEFAULT_FLOATING_PRODUCTS } from "./BannerFloatingProducts";
import type { FloatingProductDef } from "./BannerFloatingProducts";
import { BannerControls } from "./BannerControls";
import { useBannerSlider } from "./useBannerSlider";
import { CountdownTimer } from "./CountdownTimer";
import { UnifiedPersonColumn } from "./UnifiedPersonColumn";

const AUTO_MS = 5000;
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

const FLOAT_BEST: FloatingProductDef[] = [
  {
    id: "mobile",
    label: "Smartphones",
    src: "/menu/mobiles.webp",
    width: 175,
    right: "14%",
    top: "12%",
    rotateY: -6,
    rotateX: 4,
    parallaxX: 18,
    parallaxY: 12,
    float: { y: [0, -14, 0], duration: 4.2 },
    entranceDelay: 0,
  },
  {
    id: "earbuds",
    label: "Earbuds",
    src: "/menu/wireless-earbuds.webp",
    width: 125,
    right: "42%",
    top: "22%",
    rotateY: 12,
    rotateX: -4,
    parallaxX: 12,
    parallaxY: 8,
    float: { y: [0, -10, 0], rotate: [-2, 2, -2], duration: 3.4 },
    entranceDelay: 0.12,
  },
  {
    id: "power",
    label: "Power Banks",
    src: "/menu/power-banks.webp",
    width: 132,
    right: "12%",
    top: "54%",
    rotateY: -8,
    rotateX: 5,
    parallaxX: 14,
    parallaxY: 10,
    float: { y: [0, -12, 0], duration: 4.8 },
    entranceDelay: 0.26,
  },
  {
    id: "charger",
    label: "Chargers",
    src: "/menu/mobile-chargers.webp",
    width: 95,
    right: "48%",
    top: "52%",
    rotateY: 14,
    rotateX: -5,
    parallaxX: 9,
    parallaxY: 5,
    float: { y: [0, -7, 0], rotate: [0, 3, 0], duration: 3.6 },
    entranceDelay: 0.38,
  },
];

const FLOAT_NEW: FloatingProductDef[] = [
  {
    id: "watch",
    label: "Wearables",
    src: "/menu/smart-watches.webp",
    width: 178,
    right: "13%",
    top: "14%",
    rotateY: -9,
    rotateX: 5,
    parallaxX: 20,
    parallaxY: 14,
    float: { y: [0, -15, 0], duration: 3.9 },
    entranceDelay: 0,
  },
  {
    id: "speaker",
    label: "Speakers",
    src: "/menu/bluetooth-speakers.webp",
    width: 138,
    right: "40%",
    top: "26%",
    rotateY: 11,
    rotateX: -4,
    parallaxX: 13,
    parallaxY: 9,
    float: { y: [0, -11, 0], duration: 4.4 },
    entranceDelay: 0.14,
  },
  {
    id: "earbuds",
    label: "Audio",
    src: "/menu/wireless-earbuds.webp",
    width: 128,
    right: "10%",
    top: "56%",
    rotateY: -7,
    rotateX: 6,
    parallaxX: 15,
    parallaxY: 11,
    float: { y: [0, -13, 0], rotate: [-1.5, 1.5, -1.5], duration: 3.7 },
    entranceDelay: 0.28,
  },
  {
    id: "trending",
    label: "Trending",
    src: "/menu/trending.png",
    width: 105,
    right: "50%",
    top: "48%",
    rotateY: 13,
    rotateX: -6,
    parallaxX: 10,
    parallaxY: 6,
    float: { y: [0, -8, 0], duration: 5.1 },
    entranceDelay: 0.4,
  },
];

const SLIDE_PRODUCTS: FloatingProductDef[][] = [
  DEFAULT_FLOATING_PRODUCTS,
  FLOAT_BEST,
  FLOAT_NEW,
];

type SlideConfig = {
  id: string;
  glow: "amber" | "warm" | "cool";
  line1: string;
  line2Words: string[];
  sub: string;
  cta: string;
  href: string;
};

const SLIDES: SlideConfig[] = [
  {
    id: "flash",
    glow: "amber",
    line1: "Flash Sale",
    line2Words: ["Up", "to", "60%", "OFF"],
    sub: "On smartwatches, earbuds & accessories",
    cta: "Shop Flash Sale",
    href: "/shop",
  },
  {
    id: "best",
    glow: "warm",
    line1: "Best Sellers",
    line2Words: ["Top", "Rated", "Gear"],
    sub: "Crowd favorites — tested, trusted, and moving fast",
    cta: "Shop best sellers",
    href: "/shop",
  },
  {
    id: "new",
    glow: "cool",
    line1: "New Arrivals",
    line2Words: ["Fresh", "drops", "weekly"],
    sub: "Latest accessories and wearables landing on SSHUB",
    cta: "See what's new",
    href: "/shop",
  },
];

function useMatchMedia(query: string) {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false,
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const fn = () => setMatches(mq.matches);
    fn();
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, [query]);
  return matches;
}

function CenterSlideContent({
  slide,
  reduceMotion,
}: {
  slide: SlideConfig;
  reduceMotion: boolean;
}) {
  const wordsL1 = slide.line1.split(/\s+/).filter(Boolean);

  return (
    <div className="flex w-full max-w-[480px] flex-col items-center px-0 text-center md:mx-auto md:items-start md:px-10 md:text-left">
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
        className="mt-3 w-full max-md:flex max-md:justify-center md:mt-6"
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

function UnifiedBannerImpl({
  promoPersonImageUrl,
}: {
  promoPersonImageUrl?: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { amount: 0.08, once: false });
  const reduceMotion = useReducedMotion();
  const isMobile = useMatchMedia("(max-width: 767px)");
  const finePointer = useMatchMedia("(pointer: fine)");

  const parallaxEnabled = finePointer && !isMobile && reduceMotion !== true;
  const animationsActive = inView && reduceMotion !== true;

  const { active, goTo } = useBannerSlider(SLIDES.length, AUTO_MS);
  const [progressEpoch, setProgressEpoch] = useState(0);

  useEffect(() => {
    setProgressEpoch((e) => e + 1);
  }, [active]);

  const slide = SLIDES[active] ?? SLIDES[0];
  const products = SLIDE_PRODUCTS[active] ?? SLIDE_PRODUCTS[0];

  const prev = useCallback(() => {
    goTo((active - 1 + SLIDES.length) % SLIDES.length);
  }, [active, goTo]);

  const next = useCallback(() => {
    goTo((active + 1) % SLIDES.length);
  }, [active, goTo]);

  const leftBlob =
    slide.glow === "amber"
      ? "rgba(245,166,35,0.1)"
      : slide.glow === "warm"
        ? "rgba(251,146,60,0.09)"
        : "rgba(56,189,248,0.07)";
  const rightBlob =
    slide.glow === "amber"
      ? "rgba(245,166,35,0.07)"
      : slide.glow === "warm"
        ? "rgba(251,191,36,0.06)"
        : "rgba(34,211,238,0.06)";

  return (
    <section
      ref={sectionRef}
      className="relative isolate w-full overflow-x-hidden overflow-y-visible bg-[#0a0f1e] py-3 pb-8 md:h-[520px] md:min-h-[520px] md:overflow-hidden md:pb-8 md:py-0"
      aria-label="SSHUB promotions"
    >
      {/* Top accent */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[6] h-0.5"
        style={{
          background: "linear-gradient(90deg, transparent 0%, #f5a623 50%, transparent 100%)",
        }}
      />
      {/* Bottom accent */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[6] h-0.5"
        style={{
          background: "linear-gradient(90deg, transparent 0%, #f5a623 50%, transparent 100%)",
        }}
      />

      {/* Base */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[#0a0f1e]" />

      {/* Left blob */}
      <motion.div
        key={`lb-${active}`}
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
        key={`rb-${active}`}
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

      {/* Main row */}
      <div className="relative z-[3] mx-auto flex h-full w-full max-w-[1440px] flex-col gap-0 md:flex-row md:items-stretch md:gap-0">
        <UnifiedPersonColumn
          reduceMotion={!!reduceMotion}
          inView={inView}
          glowTint={slide.glow}
          imageUrl={promoPersonImageUrl}
        />

        {/* Center 40% — on mobile, stack below floating products so category strip stays visible */}
        <div className="relative z-[4] order-2 flex w-full flex-1 items-center justify-center py-1 md:order-none md:w-[40%] md:max-w-[40%] md:py-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              className="flex w-full justify-center px-3 md:px-0"
              initial={reduceMotion ? false : { x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={reduceMotion ? undefined : { x: -30, opacity: 0 }}
              transition={{ duration: 0.45, ease: textEase }}
            >
              <CenterSlideContent slide={slide} reduceMotion={!!reduceMotion} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right 30% — floating products (first on mobile so horizontal strip is not below the fold) */}
        <div className="relative z-[5] order-1 flex min-h-0 w-full shrink-0 flex-col justify-start md:order-none md:z-[2] md:w-[30%] md:max-w-[30%] md:min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              className="relative min-h-0 w-full px-3 md:absolute md:inset-0 md:h-full md:min-h-0 md:px-0"
              initial={reduceMotion ? false : { x: 45, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={reduceMotion ? undefined : { x: 40, opacity: 0 }}
              transition={{ duration: 0.45, ease: textEase }}
            >
              <BannerFloatingProducts
                className="relative w-full min-h-0 md:h-full md:min-h-0 md:pt-4"
                animationsActive={animationsActive}
                parallaxEnabled={parallaxEnabled}
                isMobile={isMobile}
                products={products}
                animationKey={`${active}-${slide.id}`}
                mobileLayout={isMobile ? "unified" : "hero"}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Arrows desktop */}
      <button
        type="button"
        aria-label="Previous slide"
        onClick={prev}
        className="absolute left-3 top-1/2 z-[8] hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-[rgba(255,255,255,0.05)] text-white/80 backdrop-blur-sm transition hover:border-[#f5a623]/70 hover:text-[#f5a623] md:flex"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Next slide"
        onClick={next}
        className="absolute right-3 top-1/2 z-[8] hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-[rgba(255,255,255,0.05)] text-white/80 backdrop-blur-sm transition hover:border-[#f5a623]/70 hover:text-[#f5a623] md:flex"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Indicators */}
      <div className="pointer-events-none absolute inset-x-0 bottom-1 z-[8] flex justify-center px-4 md:bottom-5">
        <div className="pointer-events-auto">
          <BannerControls
            count={SLIDES.length}
            active={active}
            intervalMs={AUTO_MS}
            onSelect={goTo}
            progressEpoch={progressEpoch}
            variant="unified"
          />
        </div>
      </div>
    </section>
  );
}

const UnifiedBanner = dynamic(
  () => Promise.resolve(UnifiedBannerImpl),
  { ssr: false },
);

export default UnifiedBanner;
