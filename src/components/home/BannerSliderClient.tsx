"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { IMAGE_BLUR_DATA_URL } from "@/lib/image-blur";
import type { BannerSlide } from "@/lib/banner-slider-config";

export interface BannerSlideWithImage extends BannerSlide {
  imageUrl?: string | null;
  imageAlt?: string | null;
}

interface Props {
  slides: BannerSlideWithImage[];
  autoPlayMs?: number;
}

export function BannerSliderClient({ slides, autoPlayMs = 4500 }: Props) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartX = useRef<number | null>(null);
  const total = slides.length;

  const goTo = useCallback(
    (idx: number) => setActive(((idx % total) + total) % total),
    [total],
  );

  const next = useCallback(() => goTo(active + 1), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1), [active, goTo]);

  useEffect(() => {
    if (paused || total <= 1) return;
    timerRef.current = setTimeout(next, autoPlayMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active, next, paused, autoPlayMs, total]);

  if (total === 0) return null;

  const slide = slides[active];
  const progress = ((active + 1) / total) * 100;

  const onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const onTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current == null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      if (delta < 0) next();
      else prev();
    }
    touchStartX.current = null;
  };

  return (
    <section
      className="banner-slider-root"
      aria-label="Featured promotions"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div key={active} className="banner-slide" style={{ background: slide.bg }}>
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(800px 500px at 70% 50%, rgba(245,166,35,0.15) 0%, transparent 60%), " +
              "radial-gradient(400px 300px at 20% 80%, rgba(232,133,10,0.10) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />

        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            aria-hidden
            className="banner-particle"
            style={{
              left: `${8 + i * 7.5}%`,
              top: `${15 + (i % 4) * 20}%`,
              animationDelay: `${i * 0.3}s`,
              width: i % 3 === 0 ? "4px" : "3px",
              height: i % 3 === 0 ? "4px" : "3px",
              opacity: 0.3 + (i % 4) * 0.1,
            }}
          />
        ))}

        <div className="banner-content">
          <div className="flex w-full flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
            <div className="flex-1 max-w-xl flex flex-col items-start gap-[14px]">
              <div className="banner-eyebrow-row">
                <span className="banner-index">{String(active + 1).padStart(2, "0")}</span>
                <span className="banner-divider" />
                <span className="banner-eyebrow">SSHUB Picks</span>
              </div>
              <span className="banner-badge">{slide.badge}</span>
              <h1 className="banner-headline">{slide.headline}</h1>
              <p className="banner-sub">{slide.sub}</p>
              <Link href={slide.href} className="banner-cta">
                {slide.cta}
              </Link>
            </div>
            
            {slide.imageUrl && (
              <div className="flex-1 w-full max-w-sm hidden md:flex justify-end items-center">
                <div className="relative aspect-square w-full max-w-xs rounded-2xl overflow-hidden shadow-elevated border border-border rotate-2 transition-transform duration-500 hover:rotate-0 lg:max-w-sm">
                  <Image
                    src={slide.imageUrl}
                    alt={slide.imageAlt || slide.headline}
                    fill
                    sizes="(max-width: 1200px) 40vw, 320px"
                    className="object-cover"
                    placeholder="blur"
                    blurDataURL={IMAGE_BLUR_DATA_URL}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="banner-counter">
          {active + 1} / {total} {paused ? "• Paused" : ""}
        </div>
      </div>

      {total > 1 && (
        <>
          <button type="button" aria-label="Previous banner" onClick={prev} className="banner-arrow banner-arrow-left">
            <ChevronLeft size={22} />
          </button>
          <button type="button" aria-label="Next banner" onClick={next} className="banner-arrow banner-arrow-right">
            <ChevronRight size={22} />
          </button>
          <div className="banner-dots">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => goTo(i)}
                className="banner-dot"
                style={{
                  width: i === active ? "36px" : "8px",
                  background: i === active ? "linear-gradient(90deg, #FFD580, #F5A623)" : "rgba(245,166,35,0.3)",
                  boxShadow: i === active ? "0 0 12px rgba(245,166,35,0.55)" : "none",
                }}
              />
            ))}
          </div>
        </>
      )}

      <div className="banner-progress" aria-hidden="true">
        <span className="banner-progress-fill" style={{ width: `${progress}%` }} />
      </div>
    </section>
  );
}

export default BannerSliderClient;
