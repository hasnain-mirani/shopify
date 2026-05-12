"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
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
  const [centerWhenFits, setCenterWhenFits] = useState(false);
  const [isLg, setIsLg] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const fn = () => setIsLg(mq.matches);
    fn();
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  const syncScrollMetrics = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCenterWhenFits(el.scrollWidth <= el.clientWidth + 2);
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useLayoutEffect(() => {
    syncScrollMetrics();
  }, [categories.length, syncScrollMetrics]);

  useEffect(() => {
    syncScrollMetrics();
    const el = scrollRef.current;
    if (el) el.addEventListener("scroll", syncScrollMetrics);
    window.addEventListener("resize", syncScrollMetrics);
    return () => {
      if (el) el.removeEventListener("scroll", syncScrollMetrics);
      window.removeEventListener("resize", syncScrollMetrics);
    };
  }, [categories.length, syncScrollMetrics]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => syncScrollMetrics());
    ro.observe(el);
    return () => ro.disconnect();
  }, [categories.length, syncScrollMetrics]);

  const scrollByDir = (delta: number) => {
    scrollRef.current?.scrollBy({ left: delta, behavior: "smooth" });
    setTimeout(syncScrollMetrics, 350);
  };

  const showArrows = isLg;

  const isActiveHref = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <section
      ref={sectionRef}
      aria-label="Shop by category"
      className="relative w-full min-w-0 shrink-0 border-y border-white/[0.08] bg-[#03060f]/40 py-2 backdrop-blur-[2px] md:py-2.5"
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute left-0 top-0 z-[1] h-full w-10 bg-gradient-to-r from-[#03060f] via-[#03060f]/90 to-transparent md:w-14",
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
          "no-scrollbar flex min-w-0 gap-2 overflow-x-auto scroll-smooth scroll-pb-1 scroll-pl-[max(0.75rem,env(safe-area-inset-left,0px))] scroll-pr-[max(0.75rem,env(safe-area-inset-right,0px))] px-[max(0.75rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] pb-0.5 pt-0.5 [scrollbar-width:none] sm:gap-2.5 md:gap-3 md:px-4",
          centerWhenFits && "justify-center",
          showArrows ? "lg:mx-11" : "",
          "snap-x snap-proximity",
        )}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {categories.map((cat, index) => {
          const isActive = isActiveHref(cat.href);

          return (
            <motion.div
              key={cat.label}
              className="relative shrink-0 snap-start"
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
                  "flex w-[5.125rem] min-w-[5.125rem] max-w-[5.125rem] flex-col items-center rounded-xl border border-transparent px-1 py-1.5 transition-[background-color,border-color,box-shadow,transform] duration-200 sm:w-[5.5rem] sm:min-w-[5.5rem] sm:max-w-[5.5rem] md:w-[5.75rem] md:min-w-[5.75rem] md:max-w-[5.75rem]",
                  "hover:border-white/10 hover:bg-white/[0.06] active:scale-[0.98]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#03060f]",
                  isActive &&
                    "border-amber-400/30 bg-white/[0.07] shadow-[inset_0_0_0_1px_rgba(245,166,35,0.12)]",
                )}
              >
                <div
                  className={cn(
                    "relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/[0.06] ring-1 ring-inset ring-white/10 sm:h-11 sm:w-11 md:h-12 md:w-12",
                    isActive && "ring-amber-400/35",
                  )}
                >
                  {cat.img ? (
                    <Image
                      src={cat.img}
                      alt=""
                      width={48}
                      height={48}
                      className={cn(
                        "h-8 w-8 object-contain sm:h-9 sm:w-9 md:h-10 md:w-10",
                        cat.img.endsWith(".png") && "mix-blend-multiply contrast-[1.05]",
                      )}
                      unoptimized
                      priority={index === 0}
                      fetchPriority={index === 0 ? "high" : undefined}
                      loading={index === 0 ? "eager" : "lazy"}
                      quality={index === 0 ? 85 : undefined}
                      sizes="(max-width: 768px) 64px, 88px"
                    />
                  ) : (
                    <span
                      className="text-[1.35rem] leading-none sm:text-2xl"
                      aria-hidden
                    >
                      {cat.emoji ?? "📦"}
                    </span>
                  )}
                </div>
                <span
                  className={cn(
                    "mt-1 flex min-h-[2.5rem] w-full max-w-full items-center justify-center px-0.5 text-center font-ui text-[10px] font-medium leading-snug tracking-wide text-white/82 sm:min-h-[2.625rem] sm:text-[10.5px] md:text-[11px]",
                    "line-clamp-2 break-words [overflow-wrap:anywhere]",
                    isActive && "font-semibold text-[#f5a623]",
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
          "pointer-events-none absolute right-0 top-0 z-[1] h-full w-10 bg-gradient-to-l from-[#03060f] via-[#03060f]/90 to-transparent md:w-14",
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
