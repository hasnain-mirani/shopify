"use client";

import { motion } from "framer-motion";

type Props = {
  count: number;
  active: number;
  intervalMs: number;
  progressEpoch: number;
  onSelect: (index: number) => void;
  /** Unified banner: muted inactive ticks. */
  variant?: "default" | "unified";
};

export function BannerControls({
  count,
  active,
  intervalMs,
  progressEpoch,
  onSelect,
  variant = "default",
}: Props) {
  if (count <= 1) return null;

  const sec = Math.max(0.3, intervalMs / 1000);
  const inactiveBg =
    variant === "unified" ? "bg-[rgba(255,255,255,0.15)]" : "bg-white/20";

  return (
    <div className="pointer-events-auto flex items-center justify-center gap-2 md:gap-2.5">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`Go to slide ${i + 1}`}
          onClick={() => onSelect(i)}
          className={`relative h-0.5 w-14 shrink-0 cursor-pointer overflow-hidden rounded-full border-0 p-0 ${inactiveBg}`}
          style={{
            transform: `scaleX(${i === active ? 1 : 20 / 56})`,
            transformOrigin: "center",
            transition: "transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {i === active ? (
            <motion.span
              key={`fill-${active}-${progressEpoch}`}
              className="absolute inset-y-0 left-0 right-0 origin-left bg-[#f5a623]"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: sec, ease: "linear" }}
            />
          ) : null}
        </button>
      ))}
    </div>
  );
}
