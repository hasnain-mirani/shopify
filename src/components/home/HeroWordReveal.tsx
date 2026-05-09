"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
export function HeroWordReveal({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const words = text.trim().split(/\s+/).filter(Boolean);

  const wordClass = cn(
    "heading-display inline-block bg-gradient-to-br from-white via-amber-200 to-amber-400 bg-[length:200%_auto] bg-clip-text text-transparent",
  );

  if (reduceMotion) {
    return <span className={cn(wordClass, className)}>{text}</span>;
  }

  return (
    <span className={cn("flex flex-wrap gap-x-2 gap-y-1", className)}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          className={wordClass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.45,
            ease: [0.22, 1, 0.36, 1],
            delay: Math.min(i * 0.1, 0.5),
          }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}
