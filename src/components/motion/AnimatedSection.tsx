"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import {
  motionSafeTransition,
  scrollRevealTransition,
  scrollRevealVariants,
  viewportOnce,
} from "@/lib/motion";
import { cn } from "@/lib/utils";

export function AnimatedSection({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  /** Extra delay in seconds (stagger). */
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn(className)}
      variants={scrollRevealVariants}
      initial={reduceMotion ? "visible" : "hidden"}
      whileInView={reduceMotion ? undefined : "visible"}
      viewport={viewportOnce}
      transition={motionSafeTransition(reduceMotion ?? false, {
        ...scrollRevealTransition,
        delay,
      })}
    >
      {children}
    </motion.div>
  );
}
