"use client";

import { useCallback, useEffect, useState } from "react";

export function useBannerSlider(
  count: number,
  intervalMs: number,
  onAdvance?: () => void,
) {
  const [active, setActive] = useState(0);
  const [timerNonce, setTimerNonce] = useState(0);

  useEffect(() => {
    if (count <= 1) return;
    const id = window.setInterval(() => {
      setActive((a) => (a + 1) % count);
      onAdvance?.();
    }, intervalMs);
    return () => clearInterval(id);
  }, [count, intervalMs, timerNonce, onAdvance]);

  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= count) return;
      setActive((prev) => {
        if (prev === index) return prev;
        queueMicrotask(() => {
          setTimerNonce((n) => n + 1);
          onAdvance?.();
        });
        return index;
      });
    },
    [count, onAdvance],
  );

  return { active, goTo };
}
