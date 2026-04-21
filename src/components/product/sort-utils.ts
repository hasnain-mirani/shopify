/**
 * Pure helpers for URL ⇄ Shopify sort-param translation.
 *
 * Kept in a plain (non-"use client") module so both server components
 * (shop page) and client components (SortDropdown) can import them.
 */

export type SortValue =
  | "BEST_SELLING"
  | "CREATED_AT_DESC"
  | "PRICE_ASC"
  | "PRICE_DESC"
  | "TITLE_ASC";

export interface SortOption {
  label: string;
  value: SortValue;
}

export const SORT_OPTIONS: SortOption[] = [
  { label: "Best selling", value: "BEST_SELLING" },
  { label: "Newest", value: "CREATED_AT_DESC" },
  { label: "Price: Low to High", value: "PRICE_ASC" },
  { label: "Price: High to Low", value: "PRICE_DESC" },
  { label: "Alphabetical", value: "TITLE_ASC" },
];

/**
 * Map our compact "ui sort" value to the real Storefront API
 * `sortKey` + `reverse` parameters.
 */
export function decodeSort(value: string | undefined): {
  sortKey: string;
  reverse: boolean;
} {
  switch (value) {
    case "CREATED_AT_DESC":
      return { sortKey: "CREATED_AT", reverse: true };
    case "PRICE_ASC":
      return { sortKey: "PRICE", reverse: false };
    case "PRICE_DESC":
      return { sortKey: "PRICE", reverse: true };
    case "TITLE_ASC":
      return { sortKey: "TITLE", reverse: false };
    case "BEST_SELLING":
    default:
      return { sortKey: "BEST_SELLING", reverse: false };
  }
}
