"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { motionSafeTransition, pageTransition, pageVariants } from "@/lib/motion";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        variants={pageVariants}
        initial={reduceMotion ? "animate" : "initial"}
        animate="animate"
        exit={reduceMotion ? "animate" : "exit"}
        transition={motionSafeTransition(reduceMotion ?? false, pageTransition)}
        className="flex flex-1 flex-col"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
