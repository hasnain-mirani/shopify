import type { Transition, Variants } from "framer-motion";

/** Durations ≤ 600ms per design spec */
export const DURATION = {
  page: 0.35,
  scroll: 0.5,
  stagger: 0.08,
  fast: 0.25,
} as const;

export const EASE_OUT: [number, number, number, number] = [0, 0, 0.2, 1];

export const pageTransition: Transition = {
  duration: DURATION.page,
  ease: "easeOut",
};

export const scrollRevealTransition: Transition = {
  duration: DURATION.scroll,
  ease: "easeOut",
};

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const scrollRevealVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

export const viewportOnce = {
  once: true as const,
  margin: "-80px" as const,
};

export function motionSafeTransition(
  reduceMotion: boolean | null,
  t: Transition,
): Transition {
  if (reduceMotion) return { duration: 0 };
  return t;
}
