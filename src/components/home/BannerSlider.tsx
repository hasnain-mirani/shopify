import { getBannerSliderConfig } from "@/lib/banner-slider-config";
import { getProductByHandle } from "@/lib/catalog";
import { BannerSliderClient } from "./BannerSliderClient";

export async function BannerSlider() {
  const config = await getBannerSliderConfig();
  if (!config.enabled || config.slides.length === 0) return null;

  const slidesWithImages = await Promise.all(
    config.slides.map(async (slide) => {
      let imageUrl = null;
      let imageAlt = null;

      if (slide.href.startsWith("/products/")) {
        const handle = slide.href.replace("/products/", "");
        try {
          const product = await getProductByHandle(handle);
          if (product?.featuredImage?.url) {
            imageUrl = product.featuredImage.url;
            imageAlt = product.featuredImage.altText || product.title;
          }
        } catch (e) {
          // Ignore API errors for missing products
        }
      }

      return {
        ...slide,
        imageUrl,
        imageAlt,
      };
    })
  );

  return (
    <>
      <BannerSliderClient slides={slidesWithImages} autoPlayMs={config.autoPlayMs} />
      <style>{`
        .banner-slider-root {
          position: relative;
          width: 100%;
          overflow: hidden;
          user-select: none;
          border-radius: 18px;
          border: 1px solid rgba(148,163,184,0.18);
          box-shadow: 0 18px 46px rgba(2,6,23,0.35);
        }
        .banner-slide {
          position: relative;
          width: 100%;
          min-height: 340px;
          display: flex;
          align-items: center;
          padding: 52px 0 62px;
          overflow: hidden;
          animation: bannerFadeIn 0.5s ease both;
        }
        @media (min-width: 768px) {
          .banner-slide { min-height: 430px; }
        }
        @keyframes bannerFadeIn {
          from { opacity: 0.4; transform: scale(1.015); }
          to   { opacity: 1;   transform: scale(1); }
        }
        .banner-content {
          position: relative;
          z-index: 10;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 72px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 14px;
        }
        @media (max-width: 640px) {
          .banner-content { padding: 0 52px 0 20px; }
        }
        .banner-eyebrow-row {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 4px;
        }
        .banner-index {
          font-family: var(--font-outfit, sans-serif);
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.82);
          font-weight: 700;
        }
        .banner-divider {
          width: 34px;
          height: 1px;
          background: rgba(245,158,11,0.8);
        }
        .banner-eyebrow {
          font-family: var(--font-outfit, sans-serif);
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.62);
          font-weight: 600;
        }
        .banner-badge {
          display: inline-flex;
          align-items: center;
          padding: 5px 14px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          background: rgba(15,23,42,0.52);
          color: #fcd34d;
          border: 1px solid rgba(252,211,77,0.35);
          box-shadow: 0 8px 22px rgba(2,6,23,0.35);
        }
        .banner-headline {
          font-family: var(--font-playfair, serif);
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 900;
          color: #ffffff;
          line-height: 1.05;
          letter-spacing: -0.01em;
          text-shadow: 0 4px 24px rgba(0,0,0,0.5);
          margin: 0;
        }
        .banner-sub {
          font-family: var(--font-dm-sans, sans-serif);
          font-size: clamp(0.9rem, 1.5vw, 1.08rem);
          color: rgba(226,232,240,0.92);
          max-width: 560px;
          line-height: 1.6;
          margin: 0;
        }
        .banner-cta {
          display: inline-flex;
          align-items: center;
          padding: 12px 28px;
          border-radius: 999px;
          background: linear-gradient(135deg, #fcd34d, #f59e0b);
          color: #020617;
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 0.04em;
          text-decoration: none;
          box-shadow: 0 8px 24px rgba(245,158,11,0.35);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          margin-top: 4px;
        }
        .banner-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 32px rgba(245,166,35,0.5);
        }
        .banner-particle {
          position: absolute;
          border-radius: 50%;
          background: #F5A623;
          pointer-events: none;
          animation: bannerParticleFloat 6s ease-in-out infinite;
        }
        @keyframes bannerParticleFloat {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.3; }
          50%       { transform: translateY(-18px) scale(1.1); opacity: 0.6; }
        }
        .banner-counter {
          position: absolute;
          bottom: 60px;
          right: 20px;
          background: rgba(2,6,23,0.55);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(148,163,184,0.26);
          border-radius: 999px;
          padding: 3px 10px;
          font-family: var(--font-outfit, sans-serif);
          font-size: 11px;
          font-weight: 600;
          color: rgba(226,232,240,0.78);
          z-index: 10;
        }
        .banner-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 20;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(10,15,30,0.55);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(255,255,255,0.12);
          color: #f8fafc;
          cursor: pointer;
          transition: background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
        }
        .banner-arrow:hover {
          background: rgba(10,15,30,0.78);
          border-color: rgba(245,166,35,0.55);
          box-shadow: 0 0 20px rgba(245,166,35,0.25);
        }
        .banner-arrow-left  { left: 12px; }
        .banner-arrow-right { right: 12px; }
        .banner-dots {
          position: absolute;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 6px;
          align-items: center;
          z-index: 20;
        }
        .banner-dot {
          height: 8px;
          min-height: 8px;
          border-radius: 999px;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: width 0.35s cubic-bezier(0.22,1,0.36,1), background 0.25s ease, box-shadow 0.25s ease;
        }
        .banner-progress {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 3px;
          background: rgba(148,163,184,0.24);
          z-index: 25;
        }
        .banner-progress-fill {
          display: block;
          height: 100%;
          background: linear-gradient(90deg, #fcd34d, #f59e0b);
          transition: width 0.35s ease;
        }
      `}</style>
    </>
  );
}
