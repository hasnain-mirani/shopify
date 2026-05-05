"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Product {
  title: string;
  handle?: string;
  priceRange?: { minVariantPrice?: { amount?: string; currencyCode?: string } };
  featuredImage?: { url: string; altText?: string | null } | null;
}

interface HeroCarouselProps {
  products: Product[];
}

export function HeroCarousel({ products }: HeroCarouselProps) {
  const [active, setActive] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = products.length;

  const goTo = useCallback(
    (idx: number, dir: "next" | "prev" = "next") => {
      if (animating || idx === active) return;
      setDirection(dir);
      setAnimating(true);
      setTimeout(() => {
        setActive(idx);
        setAnimating(false);
      }, 350);
    },
    [animating, active]
  );

  const next = useCallback(() => {
    goTo((active + 1) % total, "next");
  }, [active, total, goTo]);

  const prev = useCallback(() => {
    goTo((active - 1 + total) % total, "prev");
  }, [active, total, goTo]);

  /* Auto-play every 3.5 s */
  useEffect(() => {
    if (total <= 1) return;
    timerRef.current = setTimeout(next, 3500);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active, total, next]);

  const current = products[active];
  const imgUrl = current?.featuredImage?.url;
  const altText = current?.featuredImage?.altText ?? current?.title ?? "Product";
  const price = current?.priceRange?.minVariantPrice?.amount;
  const currency = current?.priceRange?.minVariantPrice?.currencyCode ?? "USD";

  /* slide-in / slide-out direction */
  const enterFrom = direction === "next" ? "translateX(60px)" : "translateX(-60px)";

  return (
    <div
      className="relative select-none"
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px",
      }}
    >
      {/* ── Card ── */}
      <div
        style={{
          position: "relative",
          width: "320px",
          height: "400px",
          borderRadius: "28px",
          overflow: "hidden",
          border: "1.5px solid rgba(245,166,35,0.35)",
          boxShadow:
            "0 28px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(245,166,35,0.08), 0 0 60px rgba(245,166,35,0.18)",
          background: "rgba(38,18,0,0.82)",
          backdropFilter: "blur(16px)",
        }}
      >
        {/* Image */}
        <div
          key={active}
          style={{
            position: "absolute",
            inset: 0,
            animation: `heroCarouselSlide 0.38s cubic-bezier(0.22,1,0.36,1) both`,
            // injected via style tag below
          }}
        >
          {imgUrl ? (
            <Image
              src={imgUrl}
              alt={altText}
              fill
              sizes="320px"
              className="object-cover"
              style={{ objectFit: "cover" }}
              priority
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  "linear-gradient(145deg, rgba(245,166,35,0.1), rgba(232,133,10,0.05))",
              }}
            >
              <span style={{ fontSize: "60px", opacity: 0.3 }}>📦</span>
            </div>
          )}

          {/* Gradient overlay */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(26,13,0,0.9) 0%, rgba(26,13,0,0.35) 40%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Product info inside card */}
        <div
          key={`info-${active}`}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "20px 20px 22px",
            zIndex: 10,
            animation: `heroCarouselSlide 0.42s cubic-bezier(0.22,1,0.36,1) 0.05s both`,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "17px",
              fontWeight: 700,
              color: "#fff",
              lineHeight: 1.25,
              marginBottom: "6px",
              textShadow: "0 2px 8px rgba(0,0,0,0.6)",
            }}
          >
            {current?.title}
          </div>
          {price && (
            <div
              style={{
                fontFamily: "var(--font-outfit)",
                fontSize: "14px",
                fontWeight: 600,
                color: "#FFD580",
                letterSpacing: "0.03em",
              }}
            >
              {currency} {parseFloat(price).toFixed(2)}
            </div>
          )}
        </div>

        {/* 50% OFF badge */}
        <div
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            zIndex: 20,
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, #FFD580 0%, #F5A623 50%, #E8850A 100%)",
            boxShadow: "0 6px 24px rgba(245,166,35,0.55)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "0px",
            animation: "float-gentle 4s ease-in-out infinite",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-outfit)",
              fontSize: "7px",
              fontWeight: 700,
              color: "rgba(26,13,0,0.65)",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              lineHeight: 1,
            }}
          >
            UP TO
          </span>
          <span
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "19px",
              fontWeight: 900,
              color: "#1a0d00",
              lineHeight: 1,
            }}
          >
            50%
          </span>
          <span
            style={{
              fontFamily: "var(--font-outfit)",
              fontSize: "7px",
              fontWeight: 700,
              color: "rgba(26,13,0,0.65)",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              lineHeight: 1,
            }}
          >
            OFF
          </span>
        </div>

        {/* Slide counter badge */}
        <div
          style={{
            position: "absolute",
            top: "16px",
            left: "16px",
            zIndex: 20,
            background: "rgba(26,13,0,0.6)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(245,166,35,0.25)",
            borderRadius: "20px",
            padding: "4px 10px",
            fontFamily: "var(--font-outfit)",
            fontSize: "11px",
            fontWeight: 600,
            color: "rgba(255,255,255,0.7)",
            letterSpacing: "0.05em",
          }}
        >
          {active + 1} / {total}
        </div>
      </div>

      {/* ── Arrow buttons ── */}
      {total > 1 && (
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            onClick={prev}
            aria-label="Previous product"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              border: "1.5px solid rgba(245,166,35,0.3)",
              background: "rgba(245,166,35,0.08)",
              color: "#F5A623",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
              backdropFilter: "blur(8px)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(245,166,35,0.2)";
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "rgba(245,166,35,0.6)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(245,166,35,0.08)";
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "rgba(245,166,35,0.3)";
            }}
          >
            <ChevronLeft size={18} />
          </button>

          {/* Dots */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {products.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i, i > active ? "next" : "prev")}
                aria-label={`Go to product ${i + 1}`}
                style={{
                  width: i === active ? "24px" : "8px",
                  height: "8px",
                  borderRadius: "4px",
                  border: "none",
                  background:
                    i === active
                      ? "linear-gradient(90deg, #FFD580, #F5A623)"
                      : "rgba(245,166,35,0.25)",
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.22,1,0.36,1)",
                  padding: 0,
                  boxShadow:
                    i === active
                      ? "0 0 8px rgba(245,166,35,0.5)"
                      : "none",
                }}
              />
            ))}
          </div>

          <button
            onClick={next}
            aria-label="Next product"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              border: "1.5px solid rgba(245,166,35,0.3)",
              background: "rgba(245,166,35,0.08)",
              color: "#F5A623",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
              backdropFilter: "blur(8px)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(245,166,35,0.2)";
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "rgba(245,166,35,0.6)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(245,166,35,0.08)";
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "rgba(245,166,35,0.3)";
            }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Inline keyframes for slide animation */}
      <style>{`
        @keyframes heroCarouselSlide {
          from {
            opacity: 0;
            transform: ${enterFrom} scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
