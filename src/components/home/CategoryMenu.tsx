"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useReducedMotion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

const BASE_CATEGORIES = [
  { label: "Trending Products", href: "/shop", img: "/menu/trending.png" },
  { label: "Wireless Earbuds", href: "/collections/wireless-earbuds", img: "/menu/wireless-earbuds.webp" },
  { label: "Wall Chargers", href: "/collections/wall-chargers", img: "/menu/mobile-chargers.webp" },
  { label: "Smart Watches", href: "/collections/smart-watches", img: "/menu/smart-watches.webp" },
  { label: "Wallets", href: "/collections/wallets", img: "/menu/vault.png" },
  { label: "Bluetooth Speakers", href: "/collections/bluetooth-speakers", img: "/menu/bluetooth-speakers.webp" },
  { label: "Power Banks", href: "/collections/power-banks", img: "/menu/power-banks.webp" },
  { label: "Torch", href: "/collections/torch", img: null, emoji: "🔦" },
] as const;

/** Visual chip badges (same order as CATEGORIES; does not change labels or links). */
const CHIP_BADGES = ["🔥", "🎧", "🔌", "⌚", "👜", "📢", "🔋", "🔦"] as const;

const STAGGER = 0.06;

export function CategoryMenu({ trendingHref = "/shop" }: { trendingHref?: string }) {
  const normalizedTrendingHref = (() => {
    const input = String(trendingHref || "").trim();
    if (!input) return "/shop";
    if (/^https?:\/\//i.test(input)) return input;
    if (input.startsWith("/")) return input;
    return `/${input}`;
  })();
  const categories = BASE_CATEGORIES.map((c, i) =>
    i === 0 ? { ...c, href: normalizedTrendingHref } : c,
  );
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-40px" });
  const reduceMotion = useReducedMotion();
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isLg, setIsLg] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const fn = () => setIsLg(mq.matches);
    fn();
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (el) el.addEventListener("scroll", updateScrollState);
    window.addEventListener("resize", updateScrollState);
    return () => {
      if (el) el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  const scrollByDir = (delta: number) => {
    scrollRef.current?.scrollBy({ left: delta, behavior: "smooth" });
    setTimeout(updateScrollState, 350);
  };

  const showArrows = isLg;

  const isActiveHref = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <section
      ref={sectionRef}
      aria-label="Shop by category"
      className="relative flex h-14 w-full shrink-0 items-center border-y border-white/[0.06] bg-[rgba(255,255,255,0.02)] px-2 md:h-20 md:px-6"
    >
      {/* Left fade + arrow (desktop) */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute left-0 top-0 z-[1] h-full w-14 bg-gradient-to-r from-[#0a0f1e] via-[#0a0f1e]/90 to-transparent",
          !showArrows && "hidden",
        )}
      />
      <button
        type="button"
        aria-label="Scroll categories left"
        onClick={() => scrollByDir(-200)}
        className={cn(
          "absolute left-2 top-1/2 z-[2] flex h-8 w-8 shrink-0 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-[rgba(10,15,30,0.82)] text-amber-400 shadow-md backdrop-blur-md transition hover:border-[rgba(245,166,35,0.45)] hover:bg-[rgba(245,166,35,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50",
          !showArrows && "hidden",
          !canScrollLeft && "pointer-events-none opacity-0",
        )}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
      </button>

      <div
        ref={scrollRef}
        className={cn(
          "no-scrollbar flex h-full min-w-0 flex-1 items-center gap-1.5 overflow-x-auto scroll-smooth [-ms-overflow-style:none] md:gap-2.5",
          showArrows ? "lg:mx-10" : "",
        )}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {categories.map((cat, index) => {
          const isFeatured = index === 0;
          const isActive = isActiveHref(cat.href);
          const badge = CHIP_BADGES[index] ?? "•";

          return (
            <motion.div
              key={cat.label}
              className="relative shrink-0"
              initial={reduceMotion ? undefined : { opacity: 0, x: -20 }}
              animate={
                reduceMotion
                  ? undefined
                  : inView
                    ? { opacity: 1, x: 0 }
                    : { opacity: 0, x: -20 }
              }
              transition={
                reduceMotion
                  ? undefined
                  : {
                      delay: index * STAGGER,
                      duration: 0.35,
                      ease: "easeOut",
                    }
              }
            >
              <motion.div
                whileHover={
                  reduceMotion
                    ? undefined
                    : {
                        scale: 1.04,
                        y: -2,
                        transition: { duration: 0.2, ease: "easeOut" },
                      }
                }
                className="relative"
              >
                <Link
                  href={cat.href}
                  aria-label={cat.label}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group relative flex h-9 shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-3 py-1 transition-all duration-[250ms] ease-out md:h-11 md:gap-2 md:py-2 md:pl-2 md:pr-4",
                    "border-white/[0.08] bg-[rgba(255,255,255,0.04)]",
                    "hover:border-[rgba(245,166,35,0.45)] hover:bg-[rgba(245,166,35,0.1)] hover:shadow-[0_4px_20px_rgba(245,166,35,0.15)]",
                    isFeatured &&
                      "border-[rgba(245,166,35,0.5)] bg-gradient-to-br from-[rgba(245,166,35,0.2)] to-[rgba(245,166,35,0.05)] hover:border-[rgba(245,166,35,0.55)]",
                    isActive &&
                      "border-[#f5a623] bg-[rgba(245,166,35,0.15)] shadow-[0_2px_16px_rgba(245,166,35,0.12)]",
                  )}
                >
                  {/* Active: dot above pill */}
                  {isActive ? (
                    <span
                      className="absolute -top-1.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#f5a623] shadow-[0_0_8px_rgba(245,166,35,0.8)]"
                      aria-hidden
                    />
                  ) : null}

                  <div
                    className={cn(
                      "relative hidden shrink-0 items-center justify-center overflow-visible rounded-full border border-white/10 bg-[rgba(255,255,255,0.06)] transition-transform duration-300 ease-out group-hover:scale-110 md:flex",
                      "md:h-9 md:w-9 md:p-1",
                    )}
                  >
                    {/* Emoji badge — top-left of thumb */}
                    <span
                      className="absolute -left-0.5 -top-0.5 hidden h-4 w-4 items-center justify-center rounded-full border border-[rgba(245,166,35,0.5)] bg-[rgba(245,166,35,0.2)] text-[8px] leading-none shadow-[0_0_6px_rgba(245,166,35,0.35)] md:flex"
                      aria-hidden
                    >
                      {badge}
                    </span>
                    {isFeatured && !reduceMotion ? (
                      <span
                        className="absolute -right-0.5 -top-0.5 flex h-2 w-2"
                        aria-hidden
                      >
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#f5a623] opacity-60" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#f5a623]" />
                      </span>
                    ) : isFeatured ? (
                      <span
                        className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#f5a623]"
                        aria-hidden
                      />
                    ) : null}
                    {cat.img ? (
                      <Image
                        src={cat.img}
                        alt=""
                        width={36}
                        height={36}
                        className="h-full w-full rounded-full object-contain"
                        unoptimized
                      />
                    ) : (
                      <span
                        className="flex h-full w-full items-center justify-center text-base leading-none"
                        aria-hidden
                      >
                        {cat.emoji ?? "📦"}
                      </span>
                    )}
                  </div>
                  <span
                    className={cn(
                      "font-ui inline text-[11px] font-medium text-white/75 transition-colors duration-200 group-hover:text-[#f5a623] md:text-[13px]",
                      isFeatured && "text-[#f5a623]",
                      isActive && "text-[#f5a623]",
                    )}
                  >
                    {cat.label}
                  </span>
                </Link>

                {/* Active underline below pill */}
                {isActive ? (
                  <span
                    className="absolute -bottom-1 left-1/2 h-0.5 w-10 max-md:w-8 -translate-x-1/2 rounded-[1px] bg-[#f5a623]"
                    aria-hidden
                  />
                ) : null}
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute right-0 top-0 z-[1] h-full w-14 bg-gradient-to-l from-[#0a0f1e] via-[#0a0f1e]/90 to-transparent",
          !showArrows && "hidden",
        )}
      />
      <button
        type="button"
        aria-label="Scroll categories right"
        onClick={() => scrollByDir(200)}
        className={cn(
          "absolute right-2 top-1/2 z-[2] flex h-8 w-8 shrink-0 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-[rgba(10,15,30,0.82)] text-amber-400 shadow-md backdrop-blur-md transition hover:border-[rgba(245,166,35,0.45)] hover:bg-[rgba(245,166,35,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50",
          !showArrows && "hidden",
          !canScrollRight && "pointer-events-none opacity-0",
        )}
      >
        <ChevronRight className="h-4 w-4" aria-hidden />
      </button>
    </section>
  );
}
