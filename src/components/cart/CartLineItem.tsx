"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import toast from "react-hot-toast";
import { cn, formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import type { CartItem } from "@/types";

export interface CartLineItemProps {
  line: CartItem;
  onNavigate?: () => void;
}

export function CartLineItem({ line, onNavigate }: CartLineItemProps) {
  const updateItem = useCartStore((s) => s.updateItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);

  const { id, quantity, product_title, variant_title, price, image_url } = line;

  // Hide the default "Default Title" variant label
  const variantLabel = useMemo(() => {
    if (!variant_title || variant_title === "Default Title") return null;
    return variant_title;
  }, [variant_title]);

  const lineTotal = price * quantity;

  // Generate a handle from the product title for the link
  const handle = product_title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  return (
    <li className="flex gap-4 py-5 border-b border-brand-200 last:border-0">
      <Link
        href={`/products/${handle}`}
        onClick={onNavigate}
        className="relative block h-[60px] w-[60px] shrink-0 overflow-hidden rounded-lg bg-brand-100"
      >
        {image_url ? (
          <Image
            src={image_url}
            alt={product_title}
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
              href={`/products/${handle}`}
              onClick={onNavigate}
              className="block font-medium text-sm text-brand-900 hover:text-brand-600 transition-colors truncate"
            >
              {product_title}
            </Link>
            {variantLabel && (
              <p className="text-xs text-brand-500 mt-0.5 truncate">{variantLabel}</p>
            )}
          </div>

          <button
            type="button"
            aria-label={`Remove ${product_title} from cart`}
            onClick={() => {
              const snapshot = { ...line };
              removeItem(id);
              toast(
                (t) => (
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-900">
                    <span>Removed from bag</span>
                    <button
                      type="button"
                      className="font-semibold text-amber-700 underline-offset-2 hover:underline"
                      onClick={() => {
                        void addItem(
                          snapshot.variant_id,
                          snapshot.product_title,
                          snapshot.price,
                          snapshot.image_url,
                          snapshot.quantity,
                        );
                        toast.dismiss(t.id);
                      }}
                    >
                      Undo
                    </button>
                  </div>
                ),
                { duration: 5000, id: `removed-${id}` },
              );
            }}
            disabled={isLoading}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-brand-500 hover:text-brand-900 hover:bg-brand-100 transition-colors disabled:opacity-50"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-auto flex items-end justify-between pt-2">
          <QuantityStepper
            value={quantity}
            disabled={isLoading}
            onChange={(next) => updateItem(id, next)}
          />

          <div className="text-right">
            <div className="text-sm font-medium text-brand-900">
              {formatPrice(String(lineTotal), "PKR")}
            </div>
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
        className="min-h-11 min-w-11 inline-flex items-center justify-center text-brand-700 hover:text-brand-900 hover:bg-brand-50 disabled:text-brand-300 disabled:cursor-not-allowed rounded-l-full transition-colors"
      >
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>
      <span
        aria-live="polite"
        className="min-h-11 min-w-11 inline-flex items-center justify-center text-sm font-medium tabular-nums"
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={inc}
        disabled={disabled || value >= max}
        className="min-h-11 min-w-11 inline-flex items-center justify-center text-brand-700 hover:text-brand-900 hover:bg-brand-50 disabled:text-brand-300 disabled:cursor-not-allowed rounded-r-full transition-colors"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export default CartLineItem;
