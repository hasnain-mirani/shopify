"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const SESSION_KEY = "sshub_store_splash_v1";

/** Full-screen splash on first visit per tab session; respects reduced motion. */
export function PageLoadOverlay() {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (reduceMotion === true) return;
    try {
      if (sessionStorage.getItem(SESSION_KEY) === "1") return;
    } catch {
      /* private mode etc. */
    }
    setVisible(true);
    const id = window.setTimeout(() => {
      setVisible(false);
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* ignore */
      }
    }, 1150);
    return () => clearTimeout(id);
  }, [reduceMotion]);

  if (reduceMotion === true) return null;

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="sshub-splash"
          className="fixed inset-0 z-[220] flex flex-col items-center justify-center bg-[#0a0f1e]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] as const }}
          aria-hidden
        >
          <div className="flex flex-col items-center gap-5">
            <motion.div
              className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-accent-light to-accent-dark shadow-lg shadow-accent/30"
              animate={{ scale: [1, 1.07, 1] }}
              transition={{
                duration: 0.65,
                ease: [0.22, 1, 0.36, 1] as const,
                times: [0, 0.45, 1],
              }}
              style={{ boxShadow: "0 0 24px rgba(245,166,35,0.45)" }}
            >
              <span className="text-2xl font-black text-brand-900">⚡</span>
            </motion.div>
            <span className="font-display text-xl font-black tracking-tight bg-gradient-to-r from-brand-200 via-accent to-accent-dark bg-clip-text text-transparent">
              SSHUB.STORE
            </span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
