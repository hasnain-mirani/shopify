"use client";

import { useMemo, useState } from "react";
import { AddToCartButton } from "./AddToCartButton";
import { ProductVariantSelector } from "./ProductVariantSelector";
import { formatPrice, isVariantAvailable } from "@/lib/utils";
import type { ShopifyProduct, ShopifyVariant } from "@/types";

export interface ProductPurchasePanelProps {
  product: ShopifyProduct;
}

/**
 * Client-side purchase controls on the PDP: variant selector + live price +
 * add-to-cart. Server component above it handles the static content (title,
 * description, images).
 */
export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const [variant, setVariant] = useState<ShopifyVariant | null>(() => {
    return product.variants.find(isVariantAvailable) ?? product.variants[0] ?? null;
  });

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
              ? "text-2xl font-medium text-red-600"
              : "text-2xl font-medium text-brand-900"
          }
        >
          {formatPrice(currentPrice.amount, currentPrice.currencyCode)}
        </span>
        {onSale && currentCompare && (
          <span className="text-base text-brand-400 line-through">
            {formatPrice(currentCompare.amount, currentCompare.currencyCode)}
          </span>
        )}
      </div>

      <ProductVariantSelector product={product} onChange={setVariant} />

      <AddToCartButton
        variantId={variant?.id ?? null}
        availableForSale={available}
      />

      {/* Low-stock hint */}
      {variant?.quantityAvailable != null &&
        variant.quantityAvailable > 0 &&
        variant.quantityAvailable <= 5 && (
          <p className="text-xs text-red-600">
            Only {variant.quantityAvailable} left
          </p>
        )}
    </div>
  );
}

export default ProductPurchasePanel;
