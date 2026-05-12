"use client";

import { useEffect, useMemo, useState } from "react";
import { canSelectVariantCombination } from "@/lib/product-variant-availability";
import { cn, getVariantId, isVariantAvailable } from "@/lib/utils";
import type { Product, Variant } from "@/types";

export interface ProductVariantSelectorProps {
  product: Product;
  /** Receives the variant id whenever the complete option set matches one. */
  onChange?: (variant: Variant | null) => void;
  className?: string;
}

/**
 * Groups product options (Size, Color, …) into row-per-option button groups.
 *
 * - Uses `product.options` for the canonical option order.
 * - Computes, for each option value, whether picking it would resolve to any
 *   available variant given the other currently-picked options — values that
 *   can't be combined into a buyable variant are marked disabled with a
 *   strike-through. This mirrors how Shopify's own storefront presents it.
 */
export function ProductVariantSelector({
  product,
  onChange,
  className,
}: ProductVariantSelectorProps) {
  // Seed with the first purchasable variant's options (fallback to first variant).
  const initial = useMemo(() => {
    const seed = product.variants?.find(isVariantAvailable) ?? product.variants?.[0];
    const record: Record<string, string> = {};
    seed?.selectedOptions.forEach((o) => {
      record[o.name] = o.value;
    });
    return record;
  }, [product.variants]);

  const [selected, setSelected] = useState<Record<string, string>>(initial);

  // "Reset state when a prop changes" pattern (see React docs):
  // track the current product id alongside `selected` and re-seed during
  // render when the prop changes. This is the React-approved way to derive
  // state from props without an effect.
  const [prevProductId, setPrevProductId] = useState(product.id);
  if (product.id !== prevProductId) {
    setPrevProductId(product.id);
    setSelected(initial);
  }

  // Emit the resolved variant (if all options chosen combine to something).
  useEffect(() => {
    let id = getVariantId(product, selected);
    if (!id && product.variants?.length === 1) {
      id = product.variants[0].id;
    }
    const variant = id ? (product.variants?.find((v) => v.id === id) ?? null) : null;
    onChange?.(variant);
  }, [selected, product, onChange]);

  if (!product.options || product.options.length === 0) return null;

  const pick = (name: string, value: string) =>
    setSelected((prev) => ({ ...prev, [name]: value }));

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      {product.options.map((option) => {
        // Shopify creates a synthetic "Title" option with value "Default Title"
        // for single-variant products; hide it so the UI stays clean.
        if (option.name === "Title" && option.values.length === 1) return null;

        return (
          <div key={option.id} className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#94a3b8]">
                {option.name}
              </span>
              <span className="text-xs font-medium text-[#f5a623]">{selected[option.name]}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {option.values.map((value) => {
                const isActive = selected[option.name] === value;
                const availableWithPick = canSelectVariantCombination(
                  product,
                  selected,
                  option.name,
                  value,
                );

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => pick(option.name, value)}
                    aria-pressed={isActive}
                    disabled={!availableWithPick && !isActive}
                    className={cn(
                      "inline-flex items-center justify-center min-w-[3rem] h-10 px-4",
                      "rounded-full text-sm font-medium transition-all duration-150",
                      "border",
                      isActive
                        ? "border-[#f5a623] bg-[rgba(245,166,35,0.12)] text-[#f8fafc] shadow-[inset_0_0_0_1px_rgba(245,166,35,0.25)]"
                        : "border-white/20 bg-[rgba(2,6,23,0.35)] text-[#e2e8f0] hover:border-[#f5a623]/55 hover:text-white",
                      !availableWithPick &&
                        !isActive &&
                        "opacity-45 line-through cursor-not-allowed hover:border-white/15 hover:text-[#94a3b8]",
                    )}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ProductVariantSelector;
