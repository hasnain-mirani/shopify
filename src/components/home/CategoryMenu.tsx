"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { ChevronRight } from "lucide-react";

/* ─── Category data ─────────────────────────────────────────────────────── */

const CATEGORIES = [
  {
    label: "Mobiles",
    href: "/collections/mobiles",
    img: "/category-icons/mobile.png",
  },
  {
    label: "Wireless Earbuds",
    href: "/collections/wireless-earbuds",
    img: "/category-icons/earbuds.png",
  },
  {
    label: "Smart Watches",
    href: "/collections/smart-watches",
    img: "/category-icons/smartwatch.png",
  },
  {
    label: "Trimmers Shaver",
    href: "/collections/trimmers-shavers",
    img: "/category-icons/trimmer.png",
  },
  {
    label: "Power Banks",
    href: "/collections/power-banks",
    img: "/category-icons/powerbank.png",
  },
  {
    label: "Wall Chargers",
    href: "/collections/wall-chargers",
    img: "/category-icons/charger.png",
  },
  {
    label: "Bluetooth Speakers",
    href: "/collections/bluetooth-speakers",
    img: "/category-icons/speaker.png",
  },
  {
    label: "Tablets",
    href: "/collections/tablets",
    img: "/category-icons/tablet.png",
  },
] as const;

/* ─── Component ─────────────────────────────────────────────────────────── */

export function CategoryMenu() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  const scroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: 240, behavior: "smooth" });
    setTimeout(updateScrollState, 350);
  };

  return (
    <section
      aria-label="Shop by category"
      className="category-menu-section"
    >
      {/* Scrollable track */}
      <div
        ref={scrollRef}
        onScroll={updateScrollState}
        className="category-menu-track"
      >
        {CATEGORIES.map((cat) => (
          <CategoryItem key={cat.href} {...cat} />
        ))}
      </div>

      {/* Right arrow button */}
      <button
        type="button"
        aria-label="Scroll categories right"
        onClick={scroll}
        className="category-arrow-btn"
        style={{ opacity: canScrollRight ? 1 : 0, pointerEvents: canScrollRight ? "auto" : "none" }}
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
          justify-content: center;
        }

        .category-menu-track {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0;
          overflow-x: auto;
          scroll-behavior: smooth;
          flex: 1;
          padding: 8px 16px;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .category-menu-track::-webkit-scrollbar {
          display: none;
        }

        .category-arrow-btn {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.25);
          color: #fff;
          cursor: pointer;
          margin-right: 8px;
          transition: background 0.2s, color 0.2s;
          box-shadow: 0 1px 4px rgba(0,0,0,0.08);
          backdrop-filter: blur(4px);
        }
        .category-arrow-btn:hover {
          background: rgba(255,255,255,0.3);
          color: #fff;
        }

        .cat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 10px;
          min-width: 88px;
          max-width: 100px;
          text-decoration: none;
          transition: background 0.18s;
          background: transparent;
          border: 1px solid transparent;
          flex-shrink: 0;
        }
        .cat-item:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.2);
        }

        .cat-img-wrap {
          width: 56px;
          height: 56px;
          border-radius: 10px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.12);
          position: relative;
          transition: box-shadow 0.18s;
          backdrop-filter: blur(4px);
        }
        .cat-item:hover .cat-img-wrap {
          box-shadow: 0 2px 10px rgba(255,255,255,0.2);
        }

        .cat-label {
          font-size: 11px;
          font-weight: 500;
          color: #ffffff;
          text-align: center;
          line-height: 1.3;
          max-width: 80px;
          white-space: normal;
          text-shadow: 0 1px 3px rgba(0,0,0,0.4);
        }
        .cat-item:hover .cat-label {
          color: #f0c040;
        }
      `}</style>
    </section>
  );
}

/* ─── Single item ───────────────────────────────────────────────────────── */

function CategoryItem({ label, href, img }: { label: string; href: string; img: string }) {
  return (
    <Link href={href} className="cat-item" aria-label={label}>
      {/* Image container */}
      <div className="cat-img-wrap">
        <Image
          src={img}
          alt={label}
          fill
          sizes="56px"
          style={{ objectFit: "contain", padding: "4px" }}
          unoptimized
        />
      </div>

      {/* Label */}
      <span className="cat-label">{label}</span>
    </Link>
  );
}
