"use client";

import { useMemo, useState } from "react";
import { Heart } from "lucide-react";
import { AddToCartButton } from "./AddToCartButton";
import { ProductVariantSelector } from "./ProductVariantSelector";
import { useWishlistStore } from "@/store/wishlist-store";
import { cn, formatPrice, isVariantAvailable } from "@/lib/utils";
import type { Product, Variant } from "@/types";

export interface ProductPurchasePanelProps {
  product: Product;
}

/**
 * Client-side purchase controls on the PDP: variant selector + live price +
 * add-to-cart. Server component above it handles the static content (title,
 * description, images).
 */
export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const [variant, setVariant] = useState<Variant | null>(() => {
    return product.variants?.find(isVariantAvailable) ?? product.variants?.[0] ?? null;
  });

  const isInWishlist = useWishlistStore((s) => s.isInWishlist);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const wishlisted = isInWishlist(product.id);

  const currentPrice = useMemo(() => {
    if (variant) return variant.price;
    return product.priceRange.minVariantPrice;
  }, [variant, product.priceRange.minVariantPrice]);

  const currentCompare = useMemo(() => {
    if (variant?.compareAtPrice) return variant.compareAtPrice;
    if (
      product.compareAtPriceRange &&
      Number.parseFloat(product.compareAtPriceRange.minVariantPrice.amount) >
        Number.parseFloat(product.priceRange.minVariantPrice.amount)
    ) {
      return product.compareAtPriceRange.minVariantPrice;
    }
    return null;
  }, [variant, product]);

  const onSale =
    !!currentCompare &&
    Number.parseFloat(currentCompare.amount) >
      Number.parseFloat(currentPrice.amount);

  const available = variant
    ? isVariantAvailable(variant)
    : product.availableForSale;

  return (
    <div className="flex flex-col gap-8">
      {/* Price */}
      <div className="flex items-baseline gap-3 tabular-nums">
        <span
          className={
            onSale
              ? "text-2xl font-semibold text-accent"
              : "text-2xl font-semibold text-slate-100"
          }
        >
          {formatPrice(currentPrice.amount, currentPrice.currencyCode)}
        </span>
        {onSale && currentCompare && (
          <span className="text-base text-slate-400 line-through">
            {formatPrice(currentCompare.amount, currentCompare.currencyCode)}
          </span>
        )}
      </div>

      <ProductVariantSelector product={product} onChange={setVariant} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <AddToCartButton
            variantId={variant?.id ?? null}
            productTitle={product.title}
            price={Number.parseFloat(currentPrice.amount)}
            imageUrl={variant?.image?.url || product.featuredImage?.url || ""}
            availableForSale={available}
            label="Buy now"
            className={cn(
              "min-h-[52px] rounded-xl text-base font-semibold shadow-lg shadow-black/20",
              "bg-[#f5a623] text-[#0f172a] hover:bg-[#ffb32c]",
              "!bg-[#f5a623] hover:!bg-[#ffb32c]",
            )}
          />
        </div>
        <button
          type="button"
          aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
          aria-pressed={wishlisted}
          onClick={() => toggleWishlist(product)}
          className={cn(
            "flex shrink-0 h-14 w-14 items-center justify-center rounded-full border border-slate-700 bg-slate-900",
            "transition-colors duration-200 hover:bg-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-accent"
          )}
        >
          <Heart 
            className={cn(
              "h-5 w-5 transition-colors", 
              wishlisted ? "fill-red-500 text-red-500" : "text-slate-300 hover:text-white"
            )} 
          />
        </button>
      </div>

      {/* Low-stock hint */}
      {variant?.quantityAvailable != null &&
        variant.quantityAvailable > 0 &&
        variant.quantityAvailable <= 5 && (
          <p className="text-xs text-amber-300">
            Only {variant.quantityAvailable} left
          </p>
        )}
    </div>
  );
}

export default ProductPurchasePanel;
