"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import type { ShopifyCartLine } from "@/types/shopify";

export interface CartLineItemProps {
  line: ShopifyCartLine;
  onNavigate?: () => void;
}

export function CartLineItem({ line, onNavigate }: CartLineItemProps) {
  const updateItem = useCartStore((s) => s.updateItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const isLoading = useCartStore((s) => s.isLoading);

  const { merchandise, quantity, cost } = line;
  const { product } = merchandise;

  const image = merchandise.image ?? product.featuredImage ?? null;

  // Compare-at price per-unit is on the merchandise; the cart `cost` also
  // exposes `compareAtAmountPerQuantity`. Prefer the cart-level one when
  // present since Shopify can apply automatic discounts there.
  const hasCompare =
    !!cost.compareAtAmountPerQuantity &&
    Number.parseFloat(cost.compareAtAmountPerQuantity.amount) >
      Number.parseFloat(cost.amountPerQuantity?.amount ?? "0");

  // Hide the default "Default Title" variant label Shopify uses when a
  // product has no options.
  const variantLabel = useMemo(() => {
    if (!merchandise.title || merchandise.title === "Default Title") return null;
    return merchandise.title;
  }, [merchandise.title]);

  const lineTotal = cost.totalAmount;
  const compareLineTotal = cost.compareAtAmountPerQuantity
    ? {
        amount: (
          Number.parseFloat(cost.compareAtAmountPerQuantity.amount) * quantity
        ).toFixed(2),
        currencyCode: cost.compareAtAmountPerQuantity.currencyCode,
      }
    : null;

  return (
    <li className="flex gap-4 py-5 border-b border-brand-200 last:border-0">
      <Link
        href={`/products/${product.handle}`}
        onClick={onNavigate}
        className="relative block h-[60px] w-[60px] shrink-0 overflow-hidden rounded-lg bg-brand-100"
      >
        {image ? (
          <Image
            src={image.url}
            alt={image.altText ?? product.title}
            width={120}
            height={120}
            sizes="60px"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-brand-100" />
        )}
      </Link>

      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={`/products/${product.handle}`}
              onClick={onNavigate}
              className="block font-medium text-sm text-brand-900 hover:text-brand-600 transition-colors truncate"
            >
              {product.title}
            </Link>
            {variantLabel && (
              <p className="text-xs text-brand-500 mt-0.5 truncate">{variantLabel}</p>
            )}
          </div>

          <button
            type="button"
            aria-label={`Remove ${product.title} from cart`}
            onClick={() => removeItem(line.id)}
            disabled={isLoading}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-brand-500 hover:text-brand-900 hover:bg-brand-100 transition-colors disabled:opacity-50"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-auto flex items-end justify-between pt-2">
          <QuantityStepper
            value={quantity}
            disabled={isLoading}
            onChange={(next) => updateItem(line.id, next)}
          />

          <div className="text-right">
            <div className="text-sm font-medium text-brand-900">
              {formatPrice(lineTotal.amount, lineTotal.currencyCode)}
            </div>
            {hasCompare && compareLineTotal && (
              <div className="text-xs text-brand-400 line-through">
                {formatPrice(
                  compareLineTotal.amount,
                  compareLineTotal.currencyCode,
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

/* -------------------------------------------------------------------------- */

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  min?: number;
  max?: number;
}

function QuantityStepper({
  value,
  onChange,
  disabled = false,
  min = 0,
  max = 99,
}: QuantityStepperProps) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-brand-300 bg-white",
        "divide-x divide-brand-200",
        disabled && "opacity-60",
      )}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={dec}
        disabled={disabled || value <= min}
        className="h-8 w-8 inline-flex items-center justify-center text-brand-700 hover:text-brand-900 disabled:text-brand-300 disabled:cursor-not-allowed rounded-l-full"
      >
        <Minus className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      <span
        aria-live="polite"
        className="h-8 w-8 inline-flex items-center justify-center text-xs font-medium tabular-nums"
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={inc}
        disabled={disabled || value >= max}
        className="h-8 w-8 inline-flex items-center justify-center text-brand-700 hover:text-brand-900 disabled:text-brand-300 disabled:cursor-not-allowed rounded-r-full"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}

export default CartLineItem;
