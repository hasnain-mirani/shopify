"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { DURATION, EASE_OUT, motionSafeTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function AnimatedCard({
  children,
  className,
  index = 0,
}: {
  children: ReactNode;
  className?: string;
  index?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn(className)}
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={motionSafeTransition(reduceMotion ?? false, {
        duration: DURATION.scroll,
        ease: EASE_OUT,
        delay: Math.min(index * DURATION.stagger, 0.48),
      })}
    >
      {children}
    </motion.div>
  );
}
