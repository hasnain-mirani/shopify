"use client";

import { useEffect, type RefObject } from "react";

/**
 * Calls `handler` when a pointer-down event occurs outside any of the given refs.
 *
 * - Listens on both `mousedown` and `touchstart` for parity across devices.
 * - Bails out while `enabled` is false, so parents can disable it without
 *   unmounting the component.
 * - Safe to pass multiple refs (e.g. a dropdown trigger + its menu).
 */
export function useOutsideClick<T extends HTMLElement = HTMLElement>(
  refs: RefObject<T | null> | Array<RefObject<T | null>>,
  handler: (event: MouseEvent | TouchEvent) => void,
  enabled: boolean = true,
): void {
  useEffect(() => {
    if (!enabled) return;
    if (typeof document === "undefined") return;

    const refList = Array.isArray(refs) ? refs : [refs];

    const listener = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) return;

      const clickedInside = refList.some(
        (ref) => ref.current && ref.current.contains(target),
      );
      if (clickedInside) return;

      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener, { passive: true });
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
    // `refs` is intentionally omitted — callers pass stable RefObjects.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handler, enabled]);
}
