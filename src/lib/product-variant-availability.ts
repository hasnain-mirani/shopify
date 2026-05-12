import { isVariantAvailable } from "@/lib/utils";
import type { Product } from "@/types";

/**
 * Whether picking `value` for `optionName` (keeping other `current` picks) can
 * resolve to at least one in-stock variant.
 */
export function canSelectVariantCombination(
  product: Product,
  current: Record<string, string>,
  optionName: string,
  value: string,
): boolean {
  const candidate = { ...current, [optionName]: value };
  return (
    product.variants?.some((v) => {
      if (!isVariantAvailable(v)) return false;
      return v.selectedOptions.every((opt) => candidate[opt.name] === opt.value);
    }) ?? false
  );
}
