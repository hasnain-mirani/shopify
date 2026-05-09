"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, X } from "lucide-react";
import type { NotificationPayload } from "@/types/notifications";

interface NotificationToastProps {
  payload: NotificationPayload;
  onDismiss: () => void;
}

export function NotificationToast({ payload, onDismiss }: NotificationToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 400);
    }, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.96 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-20 right-4 z-[200] w-[360px] max-w-[calc(100vw-2rem)]"
        >
          <div className="relative flex gap-3 items-start rounded-2xl bg-brand-950/95 backdrop-blur-xl border border-brand-200/15 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            {/* Icon */}
            <div className="shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Bell className="h-5 w-5 text-brand-900" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="font-ui text-sm font-semibold text-white leading-tight mb-0.5">
                {payload.title}
              </p>
              <p className="font-ui text-xs text-slate-400 leading-snug line-clamp-2">
                {payload.body}
              </p>
              {payload.url && (
                <a
                  href={payload.url}
                  className="inline-block mt-1.5 font-ui text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                >
                  View details →
                </a>
              )}
            </div>

            {/* Dismiss */}
            <button
              type="button"
              onClick={() => { setVisible(false); setTimeout(onDismiss, 400); }}
              className="shrink-0 h-6 w-6 rounded-full bg-brand-800/60 hover:bg-brand-700 flex items-center justify-center transition-colors"
            >
              <X className="h-3.5 w-3.5 text-slate-300" />
            </button>

            {/* Progress bar */}
            <motion.div
              className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 5, ease: "linear" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
