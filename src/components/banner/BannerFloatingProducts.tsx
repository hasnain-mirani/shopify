"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { memo, useCallback, useState, type CSSProperties } from "react";

export type FloatingProductDef = {
  id: string;
  label: string;
  src: string;
  width: number;
  right: string;
  top: string;
  rotateY: number;
  rotateX: number;
  parallaxX: number;
  parallaxY: number;
  float: { y: number[]; rotate?: number[]; duration: number };
  entranceDelay: number;
};

export const DEFAULT_FLOATING_PRODUCTS: FloatingProductDef[] = [
  {
    id: "watch",
    label: "Smartwatch",
    src: "/menu/smart-watches.webp",
    width: 180,
    right: "15%",
    top: "15%",
    rotateY: -8,
    rotateX: 4,
    parallaxX: 20,
    parallaxY: 15,
    float: { y: [0, -16, 0], duration: 4 },
    entranceDelay: 0,
  },
  {
    id: "earbuds",
    label: "Earbuds",
    src: "/menu/wireless-earbuds.webp",
    width: 130,
    right: "38%",
    top: "25%",
    rotateY: 10,
    rotateX: -3,
    parallaxX: 12,
    parallaxY: 8,
    float: { y: [0, -10, 0], rotate: [-2, 2, -2], duration: 3.2 },
    entranceDelay: 0.15,
  },
  {
    id: "speaker",
    label: "Speaker",
    src: "/menu/bluetooth-speakers.webp",
    width: 140,
    right: "10%",
    top: "55%",
    rotateY: -5,
    rotateX: 6,
    parallaxX: 16,
    parallaxY: 12,
    float: { y: [0, -14, 0], duration: 5 },
    entranceDelay: 0.3,
  },
  {
    id: "charger",
    label: "Charger",
    src: "/menu/mobile-chargers.webp",
    width: 100,
    right: "52%",
    top: "50%",
    rotateY: 12,
    rotateX: -5,
    parallaxX: 10,
    parallaxY: 6,
    float: { y: [0, -8, 0], rotate: [0, 3, 0], duration: 3.8 },
    entranceDelay: 0.45,
  },
];

type Props = {
  className?: string;
  animationsActive: boolean;
  parallaxEnabled: boolean;
  isMobile: boolean;
  /** Override catalog (defaults to SSHUB preset). */
  products?: FloatingProductDef[];
  /** Change when parent slide changes to replay entrance motion. */
  animationKey?: string | number;
  /** Mobile: `hero` uses 2 wide cards; `unified` horizontal scroll ~100px. */
  mobileLayout?: "hero" | "unified";
  /** First visible card loads with priority (mobile banner LCP). */
  prioritizeLcpImage?: boolean;
};

export const BannerFloatingProducts = memo(function BannerFloatingProducts({
  className,
  animationsActive,
  parallaxEnabled,
  isMobile,
  products,
  animationKey,
  mobileLayout = "hero",
  prioritizeLcpImage = false,
}: Props) {
  const reduceMotion = useReducedMotion();
  const [move, setMove] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!parallaxEnabled || reduceMotion) return;
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      setMove({
        x: (e.clientX - cx) / cx,
        y: (e.clientY - cy) / cy,
      });
    },
    [parallaxEnabled, reduceMotion],
  );

  const handleMouseLeave = useCallback(() => {
    setMove({ x: 0, y: 0 });
  }, []);

  const pause = !animationsActive || reduceMotion === true;
  const list = products ?? DEFAULT_FLOATING_PRODUCTS;
  const visibleProducts =
    isMobile && mobileLayout === "unified"
      ? list
      : isMobile && mobileLayout === "hero"
        ? list.slice(0, 2)
        : list;
  const unifiedMobile = isMobile && mobileLayout === "unified";
  const mobileScale = isMobile ? (unifiedMobile ? 0.68 : 0.64) : 1;

  return (
    <div
      key={animationKey}
      className={[
        className,
        "pointer-events-auto touch-manipulation",
        unifiedMobile
          ? "flex w-full min-h-[108px] items-end gap-2 overflow-x-auto overflow-y-visible py-1 pb-1 [-webkit-overflow-scrolling:touch] no-scrollbar"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      role="presentation"
    >
      <style>{`
        .banner-float-card {
          transform-style: preserve-3d;
          perspective: 800px;
          filter: drop-shadow(0 20px 40px rgba(245, 166, 35, 0.35));
          transition: transform 0.4s ease, filter 0.4s ease;
          pointer-events: auto;
        }
        .banner-float-card:hover {
          transform: translateY(-12px) rotateY(8deg) scale(1.06);
          filter: drop-shadow(0 30px 60px rgba(245, 166, 35, 0.55));
        }
        .banner-float-glow {
          position: absolute;
          width: 120%;
          height: 120%;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(245, 166, 35, 0.2) 0%,
            transparent 70%
          );
          top: -10%;
          left: -10%;
          animation: banner-float-pulse 3s ease-in-out infinite;
          pointer-events: none;
          z-index: 0;
        }
        @keyframes banner-float-pulse {
          0%, 100% { opacity: 0.85; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.04); }
        }
        @media (prefers-reduced-motion: reduce) {
          .banner-float-glow { animation: none; }
        }
        .banner-float-inner {
          position: relative;
          z-index: 1;
          will-change: transform;
        }
        .banner-float-label {
          display: inline-block;
          margin-top: 8px;
          padding: 3px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 600;
          color: #f5a623;
          background: rgba(245, 166, 35, 0.1);
          border: 1px solid rgba(245, 166, 35, 0.3);
          white-space: nowrap;
        }
      `}</style>

      {visibleProducts.map((p, index) => {
        const w = Math.round(
          (unifiedMobile ? Math.min(p.width, 96) : p.width) * mobileScale,
        );
        const baseRx = `rotateX(${p.rotateX}deg)`;
        const baseRy = `rotateY(${p.rotateY}deg)`;
        const px = parallaxEnabled && !reduceMotion ? move.x * p.parallaxX : 0;
        const py = parallaxEnabled && !reduceMotion ? move.y * p.parallaxY : 0;
        const innerTransform = `translate3d(${px}px, ${py}px, 0) ${baseRy} ${baseRx}`;

        const floatTransition = pause
          ? { duration: 0.35 as const }
          : {
              duration: p.float.duration,
              repeat: Infinity,
              ease: "easeInOut" as const,
            };

        const floatAnimate =
          pause
            ? p.float.rotate !== undefined
              ? { y: 0, rotate: p.float.rotate[0] }
              : { y: 0 }
            : p.float.rotate !== undefined
              ? { y: p.float.y, rotate: p.float.rotate }
              : { y: p.float.y };

        const isLcpCard = prioritizeLcpImage && index === 0;

        const positionStyle: CSSProperties = unifiedMobile
          ? {
              position: "relative",
              width: 108,
              flex: "0 0 108px",
            }
          : isMobile
            ? {
                position: "relative",
                width: w,
                flex: "0 0 auto",
              }
            : {
                position: "absolute",
                right: p.right,
                top: p.top,
                width: w,
              };

        return (
          <motion.div
            key={p.id}
            className="flex flex-col items-center max-md:flex-none"
            style={positionStyle}
            initial={{ opacity: 0, y: 60, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 15,
              delay: p.entranceDelay,
            }}
          >
            <div className="banner-float-card flex w-full flex-col items-center">
              <motion.div
                className="flex w-full flex-col items-center"
                animate={floatAnimate}
                transition={floatTransition}
              >
                <div
                  className="banner-float-inner flex w-full flex-col items-center"
                  style={{ transform: innerTransform }}
                >
                  <div className="relative w-full" style={{ width: w, height: w }}>
                    <span className="banner-float-glow" aria-hidden />
                    <Image
                      src={p.src}
                      alt={`${p.label} - SSHUB Pakistan`}
                      width={w}
                      height={w}
                      className="relative z-[1] h-auto w-full object-contain"
                      sizes={`${w}px`}
                      priority={isLcpCard}
                      fetchPriority={isLcpCard ? "high" : undefined}
                      loading={isLcpCard ? undefined : "lazy"}
                      unoptimized={p.src.endsWith(".png")}
                    />
                  </div>
                  <span className="banner-float-label">{p.label}</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
});
