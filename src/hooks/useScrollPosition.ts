"use client";

import { useCallback, useSyncExternalStore } from "react";

const emptySnapshot = 0;

/**
 * Returns the current window scroll position. Built on top of
 * `useSyncExternalStore` so it's safe to call during SSR, correctly
 * tearing-proof across concurrent renders, and idiomatic for React 19.
 *
 * Internally we throttle with `requestAnimationFrame` and only notify
 * subscribers when the delta from the last notified value exceeds the
 * threshold — this keeps re-render count low on fast scrolls.
 *
 * @param threshold Minimum pixel delta between notifications.
 *                  Set higher (e.g. 16) if you only need "near top / scrolled".
 */
export function useScrollPosition(threshold = 1): number {
  const subscribe = useCallback(
    (notify: () => void) => {
      if (typeof window === "undefined") return () => {};

      let frame = 0;
      let lastNotified = window.scrollY;

      const onScroll = () => {
        if (frame) return;
        frame = window.requestAnimationFrame(() => {
          frame = 0;
          const next = window.scrollY;
          if (Math.abs(next - lastNotified) >= threshold) {
            lastNotified = next;
            notify();
          }
        });
      };

      window.addEventListener("scroll", onScroll, { passive: true });
      return () => {
        window.removeEventListener("scroll", onScroll);
        if (frame) window.cancelAnimationFrame(frame);
      };
    },
    [threshold],
  );

  return useSyncExternalStore(
    subscribe,
    () => (typeof window === "undefined" ? 0 : window.scrollY),
    () => emptySnapshot,
  );
}
