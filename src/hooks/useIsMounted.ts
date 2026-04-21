"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Returns `false` on the first SSR render and `true` after hydration.
 *
 * Use this instead of the common `useState + useEffect(() => setMounted(true))`
 * pattern — `useSyncExternalStore` lets us express it purely, without setting
 * state inside an effect, which the React 19 lint rule now flags.
 */
export function useIsMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
