import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type {
  ShopifyProduct,
  ShopifySelectedOption,
  ShopifyVariant,
} from "@/types/shopify";

/**
 * Merge Tailwind class names intelligently — later classes win, conflicting
 * utilities are deduped (e.g. `px-4 px-8` collapses to `px-8`).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a price using Intl.NumberFormat.
 *
 * Accepts either a string (Shopify's native format) or number.
 * Returns a graceful fallback if the currency code is invalid.
 */
export function formatPrice(
  amount: string | number,
  currencyCode: string = "USD",
  locale: string = "en-US",
): string {
  const value =
    typeof amount === "number" ? amount : Number.parseFloat(amount);
  const safe = Number.isFinite(value) ? value : 0;

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      currencyDisplay: "symbol",
    }).format(safe);
  } catch {
    return `${safe.toFixed(2)} ${currencyCode}`;
  }
}

/**
 * Truncate a string to `max` characters and append an ellipsis.
 * Returns the original string when it's already short enough.
 */
export function truncate(input: string, max: number, ellipsis = "…"): string {
  if (!input) return "";
  if (input.length <= max) return input;
  return input.slice(0, Math.max(0, max - ellipsis.length)).trimEnd() + ellipsis;
}

/**
 * Find a product variant whose selectedOptions exactly match the requested
 * set. Returns the variant id (Shopify GID) or `undefined` when no match.
 *
 * Matches regardless of option order, case-insensitive on values.
 */
export function getVariantId(
  product: Pick<ShopifyProduct, "variants">,
  selectedOptions: ShopifySelectedOption[] | Record<string, string>,
): string | undefined {
  const desired = Array.isArray(selectedOptions)
    ? selectedOptions
    : Object.entries(selectedOptions).map(([name, value]) => ({ name, value }));

  if (desired.length === 0) {
    return product.variants[0]?.id;
  }

  const match = product.variants.find((variant) => {
    if (variant.selectedOptions.length !== desired.length) return false;
    return desired.every((want) =>
      variant.selectedOptions.some(
        (opt) =>
          opt.name === want.name &&
          opt.value.toLowerCase() === want.value.toLowerCase(),
      ),
    );
  });

  return match?.id;
}

/**
 * Whether a variant is purchasable right now. Treats `availableForSale: true`
 * combined with a positive `quantityAvailable` (when present) as available.
 */
export function isVariantAvailable(
  variant: Pick<ShopifyVariant, "availableForSale" | "quantityAvailable"> | null | undefined,
): boolean {
  if (!variant) return false;
  if (!variant.availableForSale) return false;
  if (typeof variant.quantityAvailable === "number") {
    return variant.quantityAvailable > 0;
  }
  return true;
}
