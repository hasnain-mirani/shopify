"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/* ─── Category data ─────────────────────────────────────────────────────── */

const CATEGORIES = [
  { label: "Mobiles",            href: "/collections/mobiles",           img: "/category-icons/mobile.png" },
  { label: "Wireless Earbuds",   href: "/collections/wireless-earbuds",  img: "/category-icons/earbuds.png" },
  { label: "Smart Watches",      href: "/collections/smart-watches",     img: "/category-icons/smartwatch.png" },
  { label: "Trimmers Shaver",    href: "/collections/trimmers-shavers",  img: "/category-icons/trimmer.png" },
  { label: "Power Banks",        href: "/collections/power-banks",       img: "/category-icons/powerbank.png" },
  { label: "Wall Chargers",      href: "/collections/wall-chargers",     img: "/category-icons/charger.png" },
  { label: "Bluetooth Speakers", href: "/collections/bluetooth-speakers",img: "/category-icons/speaker.png" },
  { label: "Tablets",            href: "/collections/tablets",           img: "/category-icons/tablet.png" },
] as const;

/* ─── Component ─────────────────────────────────────────────────────────── */

export function CategoryMenu() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft,  setCanScrollLeft]  = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -220, behavior: "smooth" });
    setTimeout(updateScrollState, 350);
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 220, behavior: "smooth" });
    setTimeout(updateScrollState, 350);
  };

  return (
    <section aria-label="Shop by category" className="category-menu-section">

      {/* Left arrow */}
      <button
        type="button"
        aria-label="Scroll categories left"
        onClick={scrollLeft}
        className="category-arrow-btn category-arrow-left"
        style={{
          opacity: canScrollLeft ? 1 : 0,
          pointerEvents: canScrollLeft ? "auto" : "none",
        }}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Scrollable track */}
      <div ref={scrollRef} className="category-menu-track">
        {CATEGORIES.map((cat) => (
          <CategoryItem key={cat.href} {...cat} />
        ))}
      </div>

      {/* Right arrow */}
      <button
        type="button"
        aria-label="Scroll categories right"
        onClick={scrollRight}
        className="category-arrow-btn category-arrow-right"
        style={{
          opacity: canScrollRight ? 1 : 0,
          pointerEvents: canScrollRight ? "auto" : "none",
        }}
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      <style>{`
        .category-menu-section {
          position: relative;
          width: 100%;
          background: transparent;
          border-bottom: none;
          display: flex;
          align-items: center;
        }

        .category-menu-track {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 0;
          overflow-x: auto;
          scroll-behavior: smooth;
          flex: 1;
          padding: 8px 4px;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .category-menu-track::-webkit-scrollbar { display: none; }

        .category-arrow-btn {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(245,166,35,0.12);
          border: 1px solid rgba(245,166,35,0.35);
          color: #F5A623;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, opacity 0.2s;
          box-shadow: 0 1px 6px rgba(0,0,0,0.2);
          backdrop-filter: blur(6px);
        }
        .category-arrow-btn:hover {
          background: rgba(245,166,35,0.25);
          border-color: rgba(245,166,35,0.6);
        }
        .category-arrow-left { margin-left: 4px; }
        .category-arrow-right { margin-right: 4px; }

        .cat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 8px 10px;
          border-radius: 10px;
          min-width: 82px;
          max-width: 96px;
          text-decoration: none;
          transition: background 0.18s;
          background: transparent;
          border: 1px solid transparent;
          flex-shrink: 0;
        }
        .cat-item:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(245,166,35,0.2);
        }

        .cat-img-wrap {
          width: 52px;
          height: 52px;
          border-radius: 10px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.10);
          position: relative;
          transition: box-shadow 0.18s;
          backdrop-filter: blur(4px);
        }
        .cat-item:hover .cat-img-wrap {
          box-shadow: 0 2px 10px rgba(245,166,35,0.3);
        }

        .cat-label {
          font-size: 11px;
          font-weight: 500;
          color: #ffffff;
          text-align: center;
          line-height: 1.3;
          max-width: 76px;
          white-space: normal;
          text-shadow: 0 1px 3px rgba(0,0,0,0.4);
        }
        .cat-item:hover .cat-label { color: #F5A623; }
      `}</style>
    </section>
  );
}

/* ─── Single item ───────────────────────────────────────────────────────── */

function CategoryItem({ label, href, img }: { label: string; href: string; img: string }) {
  return (
    <Link href={href} className="cat-item" aria-label={label}>
      <div className="cat-img-wrap">
        <Image
          src={img}
          alt={label}
          fill
          sizes="52px"
          style={{ objectFit: "contain", padding: "4px" }}
          unoptimized
        />
      </div>
      <span className="cat-label">{label}</span>
    </Link>
  );
}
