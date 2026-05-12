"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Heart } from "lucide-react";
import toast from "react-hot-toast";
import { AddToCartButton } from "./AddToCartButton";
import { ProductVariantSelector } from "./ProductVariantSelector";
import { useWishlistStore } from "@/store/wishlist-store";
import { cn, formatPrice, isVariantAvailable } from "@/lib/utils";
import type { Product, Variant } from "@/types";

const GIFT_WRAP_FEE_PKR = 199;
const COMPARE_STORAGE_KEY = "sshub_compare_handles";
const COMPARE_MAX = 4;

export interface ProductPurchasePanelProps {
  product: Product;
}

function addProductToCompare(handle: string) {
  try {
    const prev = JSON.parse(
      localStorage.getItem(COMPARE_STORAGE_KEY) || "[]",
    ) as string[];
    const set = new Set([handle, ...prev]);
    const next = Array.from(set).slice(0, COMPARE_MAX);
    localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(next));
    toast.success(
      next.length >= COMPARE_MAX
        ? "Compare list full (4 items). Oldest was removed."
        : "Saved for compare — open Compare page to view.",
    );
  } catch {
    toast.error("Could not save to compare");
  }
}

/**
 * Client-side purchase controls on the PDP: variant selector + live price +
 * optional gift wrap, add-to-cart + compare + wishlist.
 */
export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const [variant, setVariant] = useState<Variant | null>(() => {
    return product.variants?.find(isVariantAvailable) ?? product.variants?.[0] ?? null;
  });
  const [giftWrap, setGiftWrap] = useState(false);

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

  const unitPrice = Number.parseFloat(currentPrice.amount);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const [showMobileSticky, setShowMobileSticky] = useState(false);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setShowMobileSticky(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "0px 0px -56px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <div className="flex flex-col gap-6">
      {/* Live price for selected variant */}
      <div className="flex flex-wrap items-baseline gap-3 tabular-nums">
        <span
          className={
            onSale
              ? "text-2xl font-semibold text-[#f5a623]"
              : "text-2xl font-semibold text-[#f8fafc]"
          }
        >
          {formatPrice(currentPrice.amount, currentPrice.currencyCode)}
        </span>
        {onSale && currentCompare && (
          <span className="text-base text-[#94a3b8] line-through">
            {formatPrice(currentCompare.amount, currentCompare.currencyCode)}
          </span>
        )}
        {giftWrap && (
          <span className="text-sm font-medium text-amber-400/90">
            + Rs {GIFT_WRAP_FEE_PKR.toLocaleString("en-PK")} gift wrap
          </span>
        )}
      </div>

      <ProductVariantSelector product={product} onChange={setVariant} />

      {/* Gift wrap — matches PDP reference; fee applied in cart line */}
      <label
        className={cn(
          "flex cursor-pointer items-stretch gap-3 rounded-xl border-2 p-3.5 transition-colors",
          giftWrap
            ? "border-[#f5a623] bg-[rgba(245,166,35,0.1)]"
            : "border-[rgba(245,166,35,0.35)] bg-[rgba(254,243,199,0.06)] hover:border-[rgba(245,166,35,0.55)]",
        )}
      >
        <input
          type="checkbox"
          checked={giftWrap}
          onChange={(e) => setGiftWrap(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 rounded border-2 border-[#f5a623] bg-transparent text-[#f5a623] focus:ring-2 focus:ring-amber-400/50"
        />
        <div className="min-w-0 flex-1">
          <div className="font-ui text-sm font-bold text-[#f8fafc]">Add Gift Wrap</div>
          <div className="font-ui mt-0.5 text-sm font-semibold text-[#f5a623]">
            Cost: Rs {GIFT_WRAP_FEE_PKR.toLocaleString("en-PK")}
          </div>
          <div className="font-ui mt-1 text-xs leading-snug text-[#94a3b8]">
            Make it Memorable — Add Gift Wrapping!
          </div>
        </div>
        <div
          className="flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-lg border border-amber-400/25 bg-gradient-to-br from-amber-100/15 to-amber-900/20 text-3xl"
          aria-hidden
        >
          🎁
        </div>
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <div className="min-w-0 flex-1 sm:flex-[1.15]">
          <AddToCartButton
            variantId={variant?.id ?? null}
            productTitle={product.title}
            price={unitPrice}
            imageUrl={variant?.image?.url || product.featuredImage?.url || ""}
            availableForSale={available}
            label="Add to Cart"
            giftWrap={giftWrap}
            giftWrapFeePkr={GIFT_WRAP_FEE_PKR}
            className={cn(
              "min-h-[52px] rounded-xl text-base font-semibold shadow-lg shadow-black/20",
              "bg-[#f5a623] text-[#0f172a] hover:bg-[#ffb32c]",
              "!bg-[#f5a623] hover:!bg-[#ffb32c]",
            )}
          />
        </div>
        <button
          type="button"
          onClick={() => addProductToCompare(product.handle)}
          className={cn(
            "min-h-[52px] shrink-0 rounded-xl px-4 font-ui text-base font-semibold text-white shadow-md transition-colors sm:flex-1",
            "bg-sky-500 hover:bg-sky-400 active:bg-sky-600",
          )}
        >
          Compare
        </button>
        <button
          type="button"
          aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
          aria-pressed={wishlisted}
          onClick={() => toggleWishlist(product)}
          className={cn(
            "flex h-[52px] w-full shrink-0 items-center justify-center rounded-xl border border-white/15 bg-[#0b1224] sm:h-auto sm:w-14 sm:rounded-xl",
            "transition-colors duration-200 hover:bg-[#111c34] outline-none focus-visible:ring-2 focus-visible:ring-[#f5a623]/50",
          )}
        >
          <Heart
            className={cn(
              "h-5 w-5 transition-colors",
              wishlisted ? "fill-red-500 text-red-500" : "text-[#94a3b8] hover:text-white",
            )}
          />
        </button>
      </div>

      <div ref={sentinelRef} className="h-px w-full shrink-0" aria-hidden />

      {variant?.quantityAvailable != null &&
        variant.quantityAvailable > 0 &&
        variant.quantityAvailable <= 5 && (
          <p className="text-xs text-[#fcd34d]">
            Only {variant.quantityAvailable} left
          </p>
        )}
      </div>

      {showMobileSticky && (
        <div
          className="fixed inset-x-0 bottom-0 z-[60] border-t border-white/10 bg-[#050a14]/95 p-3 shadow-[0_-16px_48px_rgba(0,0,0,0.55)] backdrop-blur-xl md:hidden"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <div className="mx-auto flex max-w-lg items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-slate-400">{product.title}</p>
              <p className="text-sm font-semibold tabular-nums text-white">
                {formatPrice(currentPrice.amount, currentPrice.currencyCode)}
                {giftWrap && (
                  <span className="ml-1 text-[11px] font-normal text-amber-300/90">
                    + wrap
                  </span>
                )}
              </p>
            </div>
            <AddToCartButton
              variantId={variant?.id ?? null}
              productTitle={product.title}
              price={unitPrice}
              imageUrl={variant?.image?.url || product.featuredImage?.url || ""}
              availableForSale={available}
              label="Add to Cart"
              giftWrap={giftWrap}
              giftWrapFeePkr={GIFT_WRAP_FEE_PKR}
              className={cn(
                "min-h-11 shrink-0 rounded-xl px-4 text-sm font-semibold shadow-lg shadow-black/30",
                "bg-[#f5a623] text-[#0f172a] hover:bg-[#ffb32c]",
                "!bg-[#f5a623] hover:!bg-[#ffb32c]",
              )}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default ProductPurchasePanel;
