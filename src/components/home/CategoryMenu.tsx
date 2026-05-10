"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useReducedMotion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import { isExcludedNavCategory } from "@/lib/nav-categories";

const BASE_CATEGORIES = [
  { label: "Trending Products", href: "/shop", img: "/menu/trending.png" },
  {
    label: "Wireless Earbuds",
    href: "/collections/wireless-earbuds",
    img: "/menu/wireless-earbuds.webp",
  },
  {
    label: "Wall Chargers",
    href: "/collections/wall-chargers",
    img: "/menu/mobile-chargers.webp",
  },
  {
    label: "Smart Watches",
    href: "/collections/smart-watches",
    img: "/menu/smart-watches.webp",
  },
  { label: "Wallets", href: "/collections/wallets", img: "/menu/vault.png" },
  {
    label: "Bluetooth Speakers",
    href: "/collections/bluetooth-speakers",
    img: "/menu/bluetooth-speakers.webp",
  },
  {
    label: "Power Banks",
    href: "/collections/power-banks",
    img: "/menu/power-banks.webp",
  },
  { label: "Torch", href: "/collections/torch", img: null, emoji: "🔦" },
] as const;

const STAGGER = 0.05;

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
  ).filter((c) => !isExcludedNavCategory(c.label, c.href));

  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-24px" });
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
  }, [categories.length]);

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
      className="relative w-full shrink-0 border-y border-white/[0.06] bg-[rgba(255,255,255,0.02)] py-2 md:py-3"
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute left-0 top-0 z-[1] h-full w-10 bg-gradient-to-r from-[#0a0f1e] via-[#0a0f1e]/85 to-transparent md:w-14",
          !showArrows && "hidden",
        )}
      />
      <button
        type="button"
        aria-label="Scroll categories left"
        onClick={() => scrollByDir(-220)}
        className={cn(
          "absolute left-1 top-1/2 z-[2] hidden h-8 w-8 shrink-0 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-[rgba(10,15,30,0.82)] text-amber-400 shadow-md backdrop-blur-md transition hover:border-[rgba(245,166,35,0.45)] hover:bg-[rgba(245,166,35,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 lg:flex",
          !canScrollLeft && "pointer-events-none opacity-0",
        )}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
      </button>

      <div
        ref={scrollRef}
        className={cn(
          "no-scrollbar flex min-w-0 gap-1 overflow-x-auto scroll-smooth px-2 [-ms-overflow-style:none] sm:gap-2 md:px-4",
          showArrows ? "lg:mx-11" : "",
        )}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {categories.map((cat, index) => {
          const isFeatured = index === 0;
          const isActive = isActiveHref(cat.href);

          return (
            <motion.div
              key={cat.label}
              className="relative shrink-0"
              initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
              animate={
                reduceMotion
                  ? undefined
                  : inView
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 8 }
              }
              transition={
                reduceMotion
                  ? undefined
                  : { delay: index * STAGGER, duration: 0.3, ease: "easeOut" }
              }
            >
              <Link
                href={cat.href}
                aria-label={cat.label}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex w-[4.25rem] flex-col items-center gap-1 rounded-xl px-1 py-1.5 transition-colors sm:w-[4.75rem] md:w-[5.25rem] md:gap-1.5 md:py-2",
                  "hover:bg-white/[0.06]",
                  isActive && "bg-white/[0.08]",
                  isFeatured && "ring-1 ring-[rgba(245,166,35,0.35)] ring-offset-0",
                )}
              >
                <div
                  className={cn(
                    "relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.08] sm:h-10 sm:w-10 md:h-11 md:w-11",
                    isFeatured && "border-[rgba(245,166,35,0.4)] bg-[rgba(245,166,35,0.12)]",
                  )}
                >
                  {isFeatured && !reduceMotion ? (
                    <span
                      className="absolute right-0.5 top-0.5 flex h-1.5 w-1.5"
                      aria-hidden
                    >
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#f5a623] opacity-50" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#f5a623]" />
                    </span>
                  ) : null}
                  {cat.img ? (
                    <Image
                      src={cat.img}
                      alt=""
                      width={40}
                      height={40}
                      className="h-7 w-7 object-contain sm:h-8 sm:w-8 md:h-9 md:w-9"
                      unoptimized
                      priority={index === 0}
                      fetchPriority={index === 0 ? "high" : undefined}
                      loading={index === 0 ? "eager" : "lazy"}
                      quality={index === 0 ? 85 : undefined}
                      sizes={index === 0 ? "(max-width: 768px) 96px, 120px" : "48px"}
                    />
                  ) : (
                    <span
                      className="text-lg leading-none sm:text-xl"
                      aria-hidden
                    >
                      {cat.emoji ?? "📦"}
                    </span>
                  )}
                </div>
                <span
                  className={cn(
                    "max-w-full px-0.5 text-center font-ui text-[11px] font-medium leading-[1.15] text-white sm:text-[11px] md:text-[11px]",
                    isFeatured && "text-[#f5a623]",
                    isActive && "text-[#f5a623]",
                  )}
                >
                  {cat.label}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute right-0 top-0 z-[1] h-full w-10 bg-gradient-to-l from-[#0a0f1e] via-[#0a0f1e]/85 to-transparent md:w-14",
          !showArrows && "hidden",
        )}
      />
      <button
        type="button"
        aria-label="Scroll categories right"
        onClick={() => scrollByDir(220)}
        className={cn(
          "absolute right-1 top-1/2 z-[2] hidden h-8 w-8 shrink-0 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-[rgba(10,15,30,0.82)] text-amber-400 shadow-md backdrop-blur-md transition hover:border-[rgba(245,166,35,0.45)] hover:bg-[rgba(245,166,35,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 lg:flex",
          !canScrollRight && "pointer-events-none opacity-0",
        )}
      >
        <ChevronRight className="h-4 w-4" aria-hidden />
      </button>
    </section>
  );
}
