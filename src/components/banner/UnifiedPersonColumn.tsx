"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import { Zap } from "lucide-react";

type Props = {
  reduceMotion: boolean;
  inView: boolean;
  /** Visual warmth shifts per slide (CSS color hints). */
  glowTint: "amber" | "warm" | "cool";
  imageUrl?: string;
  /** When true, prioritize loading (desktop hero LCP). */
  imagePriority?: boolean;
};

const GLOW: Record<Props["glowTint"], string> = {
  amber: "rgba(245,166,35,0.15)",
  warm: "rgba(251,146,60,0.14)",
  cool: "rgba(56,189,248,0.1)",
};

export function UnifiedPersonColumn({
  reduceMotion,
  inView,
  glowTint,
  imageUrl = "/images/promo-person.png",
  imagePriority = false,
}: Props) {
  const [imgFailed, setImgFailed] = useState(false);
  const orb = GLOW[glowTint];
  const likelyOpaqueRaster = /\.(jpe?g|webp)(\?.*)?$/i.test(imageUrl);

  return (
    <div
      className="relative hidden h-full min-h-[220px] w-[30%] shrink-0 overflow-visible md:flex md:items-end md:justify-center"
      style={{ background: "transparent", backgroundColor: "transparent" }}
    >
      <div
        className="pointer-events-none absolute bottom-[12%] left-1/2 z-0 h-[360px] w-[360px] -translate-x-1/2 rounded-full"
        style={{
          background: `radial-gradient(circle, ${orb}, transparent 65%)`,
        }}
      />
      <motion.div
        className="relative z-[1] -mb-px h-[700px] w-full max-w-[460px] overflow-visible md:absolute md:bottom-0 md:left-1/2 md:h-[132%] md:max-h-none md:-translate-x-1/2"
        style={{ background: "transparent", backgroundColor: "transparent" }}
        initial={reduceMotion ? undefined : { x: -60, opacity: 0 }}
        animate={
          inView && !reduceMotion
            ? { x: 0, opacity: 1 }
            : reduceMotion
              ? { x: 0, opacity: 1 }
              : { x: -60, opacity: 0 }
        }
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
      >
        {!imgFailed ? (
          <motion.div
            className="relative w-full max-w-[460px] overflow-visible"
            style={{ background: "transparent", backgroundColor: "transparent" }}
            animate={
              reduceMotion
                ? undefined
                : { y: [0, -10, 0], rotate: [0, -0.8, 0, 0.8, 0] }
            }
            transition={
              reduceMotion
                ? undefined
                : { duration: 5.6, repeat: Infinity, ease: "easeInOut" }
            }
          >
            <div
              className="relative w-full aspect-[1920/800] max-h-[min(520px,70vh)] md:max-h-[min(640px,85vh)]"
              style={{ background: "transparent" }}
            >
              <Image
                src={imageUrl}
                alt="Flash Sale - Up to 60% OFF - SSHUB Pakistan"
                fill
                priority={imagePriority}
                fetchPriority={imagePriority ? "high" : undefined}
                loading={imagePriority ? "eager" : "lazy"}
                quality={85}
                sizes="100vw"
                onError={() => setImgFailed(true)}
                style={{
                  objectFit: "contain",
                  objectPosition: "bottom center",
                  background: "transparent",
                  mixBlendMode: likelyOpaqueRaster ? "multiply" : "normal",
                }}
              />
            </div>
          </motion.div>
        ) : (
          <div className="flex h-full min-h-[300px] w-full flex-col items-center justify-end pb-4 pr-6">
            <div
              className="relative flex h-44 w-44 items-center justify-center rounded-full"
              style={{
                background: `radial-gradient(circle, ${orb}, transparent 70%)`,
                boxShadow: `0 0 48px ${orb}`,
              }}
            >
              <Zap
                className="h-[88px] w-[88px] text-[#f5a623]"
                strokeWidth={1.35}
                aria-hidden
              />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
