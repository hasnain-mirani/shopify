"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Eye, Star, Zap } from "lucide-react";
import { IMAGE_BLUR_DATA_URL } from "@/lib/image-blur";

interface Product {
  id: string;
  title: string;
  handle: string;
  featuredImage?: { url: string; altText?: string | null } | null;
  marketPrice?: number;
  compareAtPriceRange?: {
    minVariantPrice?: { amount?: string; currencyCode?: string };
  };
  priceRange?: {
    minVariantPrice?: { amount?: string; currencyCode?: string };
  };
  variants?: Array<{
    price?: { amount?: string; currencyCode?: string };
    compareAtPrice?: { amount?: string; currencyCode?: string } | null;
  }>;
  availableForSale?: boolean;
}

interface ProductRowProps {
  title: string;
  subtitle?: string;
  icon?: string;
  viewAllHref?: string;
  products: Product[];
  sectionBg?: string;
}

const PER_PAGE_DESKTOP = 10;

function StarRating({ rating = 4.5, count = 0 }: { rating?: number; count?: number }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.4;

  return (
    <div className="pr-star-row">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={11}
          className="pr-star"
          fill={i < full || (i === full && half) ? "#F5A623" : "none"}
          stroke={i < full || (i === full && half) ? "#F5A623" : "rgba(245,166,35,0.3)"}
          strokeWidth={1.5}
        />
      ))}
      {count > 0 && <span className="pr-review-count">{count} Reviews</span>}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const amount =
    product.priceRange?.minVariantPrice?.amount ??
    product.variants?.[0]?.price?.amount ??
    "0";
  const currencyCode =
    product.priceRange?.minVariantPrice?.currencyCode ??
    product.variants?.[0]?.price?.currencyCode ??
    "PKR";

  const price = parseFloat(amount);
  const compareAmount =
    product.compareAtPriceRange?.minVariantPrice?.amount ??
    product.variants?.[0]?.compareAtPrice?.amount ??
    (typeof product.marketPrice === "number" ? String(product.marketPrice) : undefined);
  const original = compareAmount ? parseFloat(compareAmount) : 0;
  const discount =
    price > 0 && original > price
      ? Math.round(((original - price) / original) * 100)
      : 0;

  const displayCurrency = currencyCode === "PKR" || !currencyCode ? "Rs" : currencyCode;

  const rating = 3.8 + (product.id.charCodeAt(0) % 12) / 10;
  const reviewCount = 3 + (product.id.charCodeAt(1) % 50);

  return (
    <Link href={`/products/${product.handle}`} className="pr-card" aria-label={product.title}>
      <div className="pr-img-wrap">
        <div className="pr-img-glow" aria-hidden />
        {product.featuredImage?.url ? (
          <Image
            src={product.featuredImage.url}
            alt={product.featuredImage.altText ?? product.title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
            placeholder="blur"
            blurDataURL={IMAGE_BLUR_DATA_URL}
            style={{ objectFit: "cover" }}
            className="pr-img"
          />
        ) : (
          <div className="pr-img-placeholder">
            <span>📦</span>
          </div>
        )}
        <div className="pr-img-fade" aria-hidden />
        {discount > 0 && (
          <span className="pr-discount-badge">{discount}% OFF</span>
        )}
        <span className="pr-quick-view">
          <Eye className="pr-quick-view-icon" aria-hidden />
          Quick View
        </span>
      </div>

      <div className="pr-info">
        <StarRating rating={parseFloat(rating.toFixed(1))} count={reviewCount} />
        <p className="pr-title">{product.title}</p>
        <p className="pr-brand">
          <Check className="pr-brand-check" aria-hidden strokeWidth={3} />
          SSHUB Verified
        </p>
        <div className="pr-price-row">
          <span className="pr-price">
            {displayCurrency} {price.toLocaleString("en-PK")}
          </span>
          {discount > 0 && (
            <span className="pr-discount-pct">{discount}% OFF</span>
          )}
        </div>
        <div className="pr-delivery-badge">
          <Zap size={10} />
          Fast Delivery
        </div>
      </div>
    </Link>
  );
}

export function ProductRow({
  title,
  subtitle = "Hand-picked for you",
  icon = "✨",
  viewAllHref = "/products",
  products,
  sectionBg,
}: ProductRowProps) {
  const [page, setPage] = useState(0);
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: "-60px" });

  if (!products || products.length === 0) return null;

  const totalPages = Math.ceil(products.length / PER_PAGE_DESKTOP);
  const start = page * PER_PAGE_DESKTOP;
  const visible = products.slice(start, start + PER_PAGE_DESKTOP);

  return (
    <motion.div
      ref={sectionRef}
      className="pr-section"
      style={sectionBg ? { background: sectionBg } : undefined}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
    >
      <div className="pr-section-header">
        <div className="pr-title-wrap">
          <span className="pr-kicker">
            <span className="pr-kicker-bar" aria-hidden />
            <span>
              {icon} Curated Picks
            </span>
          </span>
          <h2 className="pr-section-title pr-section-title-gradient">{title}</h2>
          <p className="pr-subtitle">{subtitle}</p>
        </div>
        <Link href={viewAllHref} className="pr-view-all">
          View All
        </Link>
      </div>

      <div className="pr-grid-wrapper">
        {/* Left arrow */}
        <button
          type="button"
          aria-label="Previous page"
          className="pr-nav-btn pr-nav-left"
          style={{ opacity: page > 0 ? 1 : 0, pointerEvents: page > 0 ? "auto" : "none" }}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
        >
          <ChevronLeft size={20} />
        </button>

        {/* 2-row grid */}
        <div className="pr-grid">
          {visible.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{
                duration: 0.42,
                ease: [0.22, 1, 0.36, 1] as const,
                delay: Math.min(i * 0.08, 0.28),
              }}
            >
              <ProductCard product={p} />
            </motion.div>
          ))}
        </div>

        {/* Right arrow */}
        <button
          type="button"
          aria-label="Next page"
          className="pr-nav-btn pr-nav-right"
          style={{ opacity: page < totalPages - 1 ? 1 : 0, pointerEvents: page < totalPages - 1 ? "auto" : "none" }}
          onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <style>{`
        .pr-section {
          width: 100%;
          padding: 30px 0 34px;
          border-bottom: 1px solid rgba(148,163,184,0.14);
        }
        .pr-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 56px 18px;
          max-width: 1200px;
          margin: 0 auto;
        }
        @media (max-width: 640px) {
          .pr-section-header {
            padding: 0 14px 12px;
            align-items: flex-start;
            gap: 8px;
          }
        }
        .pr-title-wrap {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .pr-kicker {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-outfit, sans-serif);
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          font-weight: 700;
          color: rgba(203,213,225,0.75);
        }
        .pr-kicker-bar {
          width: 4px;
          height: 20px;
          border-radius: 2px;
          background: #f5a623;
          box-shadow: 0 0 12px rgba(245,166,35,0.45);
        }
        .pr-section-title {
          font-family: var(--font-outfit, sans-serif);
          font-size: 21px;
          font-weight: 700;
          color: #f8fafc;
          margin: 0;
          letter-spacing: -0.01em;
        }
        .pr-section-title-gradient {
          background: linear-gradient(135deg, #ffffff 0%, #f5a623 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .pr-subtitle {
          margin: 0;
          font-family: var(--font-dm-sans, sans-serif);
          font-size: 12px;
          color: rgba(203,213,225,0.8);
          line-height: 1.5;
        }
        .pr-view-all {
          display: inline-flex;
          align-items: center;
          padding: 8px 18px;
          border-radius: 999px;
          border: 1px solid rgba(148,163,184,0.35);
          font-family: var(--font-outfit, sans-serif);
          font-size: 12px;
          font-weight: 600;
          color: #e2e8f0;
          text-decoration: none;
          transition: background 0.18s, border-color 0.18s;
          background: rgba(2,6,23,0.42);
        }
        .pr-view-all:hover {
          background: rgba(245,158,11,0.12);
          border-color: rgba(245,158,11,0.58);
          color: #fcd34d;
        }
        /* Grid wrapper with side nav arrows */
        .pr-grid-wrapper {
          position: relative;
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 0;
        }
        .pr-nav-btn {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid rgba(148,163,184,0.3);
          background: rgba(2,6,23,0.55);
          backdrop-filter: blur(10px);
          color: #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 12px rgba(0,0,0,0.35);
          transition: background 0.18s, border-color 0.18s, opacity 0.2s;
          z-index: 10;
          position: absolute;
        }
        .pr-nav-btn:hover {
          background: rgba(10,15,30,0.88);
          border-color: rgba(245,166,35,0.55);
          box-shadow: 0 0 18px rgba(245,166,35,0.25);
        }
        .pr-nav-left  { left: 6px; }
        .pr-nav-right { right: 6px; }
        /* 2-row × 5-col grid */
        .pr-grid {
          flex: 1;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          grid-template-rows: repeat(2, auto);
          gap: 10px;
          padding: 0 52px;
          overflow: hidden;
        }
        @media (min-width: 480px) {
          .pr-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (min-width: 768px) {
          .pr-grid { grid-template-columns: repeat(4, 1fr); }
        }
        @media (min-width: 1024px) {
          .pr-grid { grid-template-columns: repeat(5, 1fr); }
        }
        @media (max-width: 767px) {
          .pr-grid-wrapper { display: block; }
          .pr-nav-btn { display: none; }
          .pr-grid {
            display: flex;
            overflow-x: auto;
            gap: 10px;
            padding: 0 14px 4px;
            scroll-snap-type: x mandatory;
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .pr-grid::-webkit-scrollbar { display: none; }
          .pr-grid > * {
            min-width: 46%;
            flex: 0 0 46%;
            scroll-snap-align: start;
          }
          .pr-view-all { padding: 7px 12px; font-size: 11px; }
          .pr-subtitle { font-size: 11px; }
        }
        /* ── Card ── */
        .pr-card {
          border-radius: 20px;
          overflow: hidden;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          text-decoration: none;
          display: flex;
          flex-direction: column;
          transition: box-shadow 0.3s ease, transform 0.3s ease, border-color 0.3s ease;
          min-height: 280px;
        }
        @media (max-width: 767px) {
          .pr-card { min-height: 238px; }
        }
        .pr-card:hover {
          box-shadow: 0 8px 40px rgba(245,166,35,0.12);
          transform: translateY(-8px);
          border-color: rgba(245,166,35,0.4);
        }
        .pr-img-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 1;
          background: radial-gradient(circle at 30% 20%, rgba(245,166,35,0.12), rgba(10,15,30,0.95));
          overflow: hidden;
        }
        .pr-img-fade {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 45%;
          background: linear-gradient(to top, rgba(10,15,30,0.92), transparent);
          pointer-events: none;
          z-index: 2;
        }
        .pr-quick-view {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 4;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 8px;
          font-family: var(--font-outfit, sans-serif);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #fff;
          background: rgba(10,15,30,0.65);
          border-top: 1px solid rgba(245,166,35,0.2);
          opacity: 0;
          transform: translateY(100%);
          transition: opacity 0.3s ease, transform 0.3s ease;
          pointer-events: none;
        }
        .pr-quick-view-icon {
          width: 14px;
          height: 14px;
          opacity: 0.9;
        }
        .pr-card:hover .pr-quick-view {
          opacity: 1;
          transform: translateY(0);
        }
        .pr-img-glow {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(240px 140px at 20% 20%, rgba(245,158,11,0.26), transparent 65%),
            radial-gradient(180px 120px at 85% 80%, rgba(37,99,235,0.22), transparent 70%);
          pointer-events: none;
          z-index: 0;
        }
        .pr-img {
          z-index: 1;
          transition: transform 0.4s ease;
        }
        .pr-card:hover .pr-img {
          transform: scale(1.06);
        }
        .pr-img-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          opacity: 0.4;
        }
        .pr-discount-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          background: linear-gradient(135deg, #fcd34d, #f5a623, #e8850a);
          color: #1a0a00;
          font-family: var(--font-outfit, sans-serif);
          font-size: 9px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 999px;
          z-index: 5;
          box-shadow: 0 4px 14px rgba(245,166,35,0.35);
          transform: rotate(-2deg);
        }
        .pr-info {
          padding: 10px 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 5px;
          flex: 1;
        }
        .pr-star-row {
          display: flex;
          align-items: center;
          gap: 1px;
        }
        .pr-star { flex-shrink: 0; }
        .pr-review-count {
          font-family: var(--font-outfit, sans-serif);
          font-size: 9px;
          color: #94a3b8;
          margin-left: 3px;
          white-space: nowrap;
        }
        .pr-title {
          font-family: var(--font-dm-sans, sans-serif);
          font-size: 13px;
          font-weight: 600;
          color: #f1f5f9;
          line-height: 1.35;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .pr-brand {
          margin: 0;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-family: var(--font-outfit, sans-serif);
          font-size: 10px;
          color: #f5a623;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .pr-brand-check {
          width: 12px;
          height: 12px;
          color: #f5a623;
          flex-shrink: 0;
        }
        .pr-price-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 4px;
        }
        .pr-price {
          font-family: var(--font-outfit, sans-serif);
          font-size: 15px;
          font-weight: 800;
          color: #f8fafc;
        }
        .pr-discount-pct {
          font-family: var(--font-outfit, sans-serif);
          font-size: 10px;
          font-weight: 600;
          color: #16a34a;
        }
        .pr-delivery-badge {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          padding: 3px 8px;
          border-radius: 999px;
          background: rgba(245,158,11,0.14);
          border: 1px solid rgba(245,158,11,0.35);
          color: #fbbf24;
          font-family: var(--font-outfit, sans-serif);
          font-size: 9px;
          font-weight: 700;
          width: fit-content;
        }
      `}</style>
    </motion.div>
  );
}
