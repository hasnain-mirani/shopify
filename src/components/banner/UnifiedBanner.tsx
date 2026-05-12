"use client";

/**
 * Stable entry path for the homepage hero. Implementation lives in
 * `FlashSaleHeroBanner.tsx` so dev caches never keep a stale association
 * with the old `next/dynamic` loader for this module id.
 */
export { default } from "./FlashSaleHeroBanner";
