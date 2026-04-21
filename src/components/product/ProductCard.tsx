"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Heart, Plus, Sparkles } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { useCartStore } from "@/store/cart-store";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { cn, formatPrice, isVariantAvailable } from "@/lib/utils";
import type { ShopifyProduct, ShopifyVariant } from "@/types/shopify";

export interface ProductCardProps {
  product: ShopifyProduct;
  /** Pass true for above-the-fold cards so next/image eagerly loads. */
  priority?: boolean;
  /** Position in the grid — used for staggered entrance animation. */
  index?: number;
  className?: string;
}

const STAGGER_STEP_MS = 60;
const STAGGER_CAP_MS = 600;

/**
 * Editorial product card.
 *
 * Visual DNA:
 *   • Soft-radius image frame with a subtle ring on hover.
 *   • Secondary image crossfades in on hover (classic lookbook feint).
 *   • A "hang-tag" quick-add pill slides up from the bottom: a dark
 *     rounded pill with the label on the left and a yellow circular
 *     `+` on the right. The + rotates 90° on hover and becomes a
 *     spinner while the cart request is in flight.
 *   • Pill-shaped wishlist heart fades in on hover, top-right.
 *   • Editorial info block underneath: vendor eyebrow, serif-ish
 *     title (hover underline via `after`), price, and tiny color
 *     swatches when the product has a colour option.
 *
 * Variant picker is preserved — if the product has multiple
 * purchasable variants, clicking the pill reveals a small floating
 * menu over the image instead of adding directly.
 */
export function ProductCard({
  product,
  priority = false,
  index = 0,
  className,
}: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  const [hovered, setHovered] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const rootRef = useRef<HTMLElement>(null);
  useOutsideClick(rootRef, () => setPanelOpen(false), panelOpen);

  /* ---------------- derived product data --------------------------------- */

  const primaryImage = product.featuredImage ?? product.images[0] ?? null;
  const secondaryImage =
    product.images.find((img) => img.url !== primaryImage?.url) ?? null;

  const { min, compareMin, percentOff, onSale } = useMemo(() => {
    const minAmt = Number.parseFloat(product.priceRange.minVariantPrice.amount);
    const compareAmt = product.compareAtPriceRange
      ? Number.parseFloat(product.compareAtPriceRange.minVariantPrice.amount)
      : 0;
    const sale = compareAmt > minAmt && minAmt > 0;
    return {
      min: product.priceRange.minVariantPrice,
      compareMin: sale
        ? product.compareAtPriceRange?.minVariantPrice
        : undefined,
      percentOff: sale ? ((compareAmt - minAmt) / compareAmt) * 100 : 0,
      onSale: sale,
    };
  }, [product.priceRange, product.compareAtPriceRange]);

  const isSoldOut = !product.availableForSale;

  // Evaluate `isNew` once per mount — `Date.now()` is impure so we
  // freeze it into a stable state value.
  const [nowSnapshot] = useState(() => Date.now());
  const isNew = useMemo(() => {
    if (product.tags.some((t) => t.toLowerCase() === "new")) return true;
    if (!product.publishedAt) return false;
    const days =
      (nowSnapshot - new Date(product.publishedAt).getTime()) /
      (1000 * 60 * 60 * 24);
    return days >= 0 && days <= 30;
  }, [product.tags, product.publishedAt, nowSnapshot]);

  const purchasableVariants = useMemo(
    () => product.variants.filter(isVariantAvailable),
    [product.variants],
  );

  const hasMultipleVariants = purchasableVariants.length > 1;
  const showQuickAdd = !isSoldOut && purchasableVariants.length > 0;

  const swatches = useMemo(() => extractColorSwatches(product), [product]);
  const variantCount = product.variants.length;

  /* ---------------- actions --------------------------------------------- */

  const addVariant = async (variantId: string) => {
    setAdding(true);
    try {
      await addItem(variantId, 1);
      setPanelOpen(false);
      setJustAdded(true);
      window.setTimeout(() => setJustAdded(false), 1400);
    } finally {
      setAdding(false);
    }
  };

  const onQuickAdd = () => {
    if (!showQuickAdd) return;
    if (hasMultipleVariants) {
      setPanelOpen((open) => !open);
    } else {
      void addVariant(purchasableVariants[0].id);
    }
  };

  /* ---------------- render ---------------------------------------------- */

  const delayMs = Math.min(index * STAGGER_STEP_MS, STAGGER_CAP_MS);
  const ctaLabel = hasMultipleVariants ? "Quick add" : "Add to bag";

  return (
    <article
      ref={rootRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setPanelOpen(false);
      }}
      className={cn(
        "group relative flex flex-col animate-fade-up opacity-0",
        className,
      )}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      {/* Image + overlays — one positioning container */}
      <div className="relative">
        <Link
          href={`/products/${product.handle}`}
          aria-label={product.title}
          className={cn(
            "relative block overflow-hidden rounded-[20px] bg-brand-100 aspect-[3/4]",
            "ring-0 ring-brand-900/0 transition-[box-shadow,transform] duration-500 ease-out",
            "group-hover:shadow-[0_22px_50px_-20px_rgba(13,43,20,0.35)]",
            isSoldOut && "opacity-90",
          )}
        >
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.altText ?? product.title}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              priority={priority}
              className={cn(
                "object-cover transition-opacity duration-500 ease-out",
                secondaryImage && hovered ? "opacity-0" : "opacity-100",
              )}
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-brand-200 via-brand-100 to-brand-200" />
          )}

          {secondaryImage && (
            <Image
              src={secondaryImage.url}
              alt=""
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              aria-hidden="true"
              className={cn(
                "object-cover absolute inset-0 transition-opacity duration-500 ease-out",
                hovered ? "opacity-100" : "opacity-0",
              )}
            />
          )}

          {/* Shimmer sweep on hover — same vocabulary as CollectionCard */}
          <span
            aria-hidden="true"
            className={cn(
              "absolute inset-0 pointer-events-none",
              "before:absolute before:inset-0 before:-translate-x-full",
              "before:bg-gradient-to-r before:from-transparent before:via-white/18 before:to-transparent",
              "group-hover:before:translate-x-full before:transition-transform before:duration-[1200ms] before:ease-out",
            )}
          />

          {/* Sold-out overlay */}
          {isSoldOut && (
            <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
              <span className="font-ui text-[10px] font-semibold uppercase tracking-[0.3em] rounded-full bg-brand-900/90 text-white px-4 py-2">
                Sold out
              </span>
            </div>
          )}
        </Link>

        {/* Top-left badge stack */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start pointer-events-none z-10">
          {!isSoldOut && onSale && (
            <EditorialPill tone="sale">
              −{Math.round(percentOff)}%
            </EditorialPill>
          )}
          {!isSoldOut && isNew && (
            <EditorialPill tone="new">
              <Sparkles aria-hidden="true" className="h-3 w-3" />
              New
            </EditorialPill>
          )}
        </div>

        {/* Wishlist heart — top-right, fades in on hover (always visible on touch) */}
        <button
          type="button"
          aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
          aria-pressed={wishlisted}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setWishlisted((w) => !w);
          }}
          className={cn(
            "absolute top-3 right-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full",
            "bg-white/85 backdrop-blur-sm text-brand-900 shadow-sm ring-1 ring-black/5",
            "transition-all duration-300 ease-out",
            "hover:bg-white hover:-translate-y-0.5 hover:scale-[1.04]",
            "outline-none focus-visible:ring-2 focus-visible:ring-brand-900",
            // Fade behaviour: always visible on touch devices, animated on pointer
            "md:opacity-0 md:translate-y-1 md:group-hover:opacity-100 md:group-hover:translate-y-0",
          )}
        >
          <Heart
            className={cn(
              "h-[17px] w-[17px] transition-colors",
              wishlisted ? "fill-red-500 text-red-500" : "text-brand-900",
            )}
            aria-hidden="true"
          />
        </button>

        {/* ── Quick Add "hang-tag" pill ─────────────────────────────────
            Dark rounded rectangle that fills the bottom of the image,
            with a yellow disc pinned at its right side. The disc's icon
            morphs Plus → Spinner → Check as the request progresses. */}
        <AnimatePresence>
          {hovered && showQuickAdd && (
            <motion.div
              key="quickadd"
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-3 right-3 bottom-3 z-20"
            >
              <button
                type="button"
                onClick={onQuickAdd}
                disabled={adding}
                aria-haspopup={hasMultipleVariants ? "menu" : undefined}
                aria-expanded={hasMultipleVariants ? panelOpen : undefined}
                className={cn(
                  "group/btn relative w-full overflow-hidden",
                  "inline-flex items-center justify-between gap-3",
                  "h-12 pl-5 pr-1.5 rounded-full",
                  "bg-brand-900 text-white",
                  "shadow-[0_10px_30px_-10px_rgba(0,0,0,0.55)]",
                  "hover:bg-brand-800 transition-colors duration-200",
                  "outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  "disabled:opacity-80 disabled:cursor-wait",
                )}
              >
                {/* Diagonal shimmer sweeping across the dark pill on hover */}
                <span
                  aria-hidden="true"
                  className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full bg-gradient-to-r from-transparent via-white/12 to-transparent transition-transform duration-[1400ms] ease-out pointer-events-none"
                />
                <span className="relative font-ui text-[13px] font-semibold tracking-[0.02em]">
                  {justAdded ? "Added" : ctaLabel}
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "relative inline-flex h-9 w-9 items-center justify-center rounded-full",
                    "bg-accent text-brand-900 shadow-[0_4px_12px_rgba(245,224,74,0.45)]",
                    "transition-transform duration-500 ease-out",
                    "group-hover/btn:rotate-90",
                    (adding || justAdded) && "!rotate-0",
                  )}
                >
                  {adding ? (
                    <Spinner size="sm" />
                  ) : justAdded ? (
                    <Check className="h-[18px] w-[18px]" strokeWidth={2.75} />
                  ) : (
                    <Plus className="h-[18px] w-[18px]" strokeWidth={2.5} />
                  )}
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Variant selector — opens above the hang-tag pill */}
        <VariantPanel
          open={panelOpen && hasMultipleVariants}
          variants={purchasableVariants}
          onPick={addVariant}
          fallbackCurrency={min.currencyCode}
          disabled={adding}
        />
      </div>

      {/* ── Product info block ───────────────────────────────────────── */}
      <div className="mt-4 flex flex-col gap-1.5">
        {product.vendor && (
          <span className="font-ui text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-500">
            {product.vendor}
          </span>
        )}

        <Link
          href={`/products/${product.handle}`}
          className={cn(
            "relative inline-block self-start pr-1 max-w-full",
            "font-display text-[17px] md:text-[18px] leading-[1.15] tracking-tight",
            "text-brand-900 hover:text-brand-700 transition-colors line-clamp-1",
            "after:content-[''] after:block after:h-px after:w-0 after:bg-current after:transition-[width] after:duration-300",
            "group-hover:after:w-[calc(100%-0.25rem)]",
          )}
        >
          {product.title}
        </Link>

        <div className="flex items-center justify-between gap-3 mt-1">
          <div className="flex items-baseline gap-2 tabular-nums min-w-0">
            <span
              className={cn(
                "font-ui font-semibold text-[15px] md:text-[15.5px]",
                onSale ? "text-red-600" : "text-brand-900",
              )}
            >
              {formatPrice(min.amount, min.currencyCode)}
            </span>
            {onSale && compareMin && (
              <span className="font-ui text-brand-400 line-through text-xs">
                {formatPrice(compareMin.amount, compareMin.currencyCode)}
              </span>
            )}
          </div>

          {/* Right-side meta: colour swatches or variant count */}
          {swatches.length > 0 ? (
            <ColorDots swatches={swatches} />
          ) : variantCount > 1 ? (
            <span className="font-ui text-[10px] uppercase tracking-[0.18em] text-brand-500 shrink-0">
              {variantCount} options
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* Editorial badge pill                                                       */
/* -------------------------------------------------------------------------- */

function EditorialPill({
  tone,
  children,
}: {
  tone: "new" | "sale";
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full leading-none",
        "font-ui text-[10px] font-semibold uppercase tracking-[0.22em]",
        "shadow-[0_2px_8px_rgba(13,43,20,0.12)]",
        tone === "new" && "bg-accent text-brand-900",
        tone === "sale" && "bg-red-600 text-white tabular-nums",
      )}
    >
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Color swatches                                                             */
/* -------------------------------------------------------------------------- */

function ColorDots({ swatches }: { swatches: ColorSwatch[] }) {
  const visible = swatches.slice(0, 4);
  const extra = swatches.length - visible.length;
  return (
    <div className="flex items-center gap-1 shrink-0" aria-label={`${swatches.length} colours`}>
      {visible.map((s) => (
        <span
          key={s.name}
          title={s.name}
          className={cn(
            "h-3.5 w-3.5 rounded-full ring-1 ring-black/10",
            s.isLight && "ring-brand-300",
          )}
          style={{ backgroundColor: s.css }}
        />
      ))}
      {extra > 0 && (
        <span className="font-ui text-[10px] font-medium text-brand-500 tabular-nums ml-0.5">
          +{extra}
        </span>
      )}
    </div>
  );
}

interface ColorSwatch {
  name: string;
  css: string;
  isLight: boolean;
}

const COLOR_MAP: Record<string, string> = {
  black: "#111111",
  white: "#f7f7f2",
  ivory: "#efece0",
  cream: "#f0e9d8",
  beige: "#d8c9a8",
  sand: "#d2bfa0",
  stone: "#b6ad9c",
  tan: "#c9b38a",
  taupe: "#8b7e6a",
  brown: "#6b4226",
  tobacco: "#8b5a2b",
  chocolate: "#4a2e1c",
  grey: "#8a8a8a",
  gray: "#8a8a8a",
  charcoal: "#2a2a2a",
  silver: "#c7ccd1",
  red: "#c1272d",
  burgundy: "#6b1f28",
  wine: "#5a1a26",
  pink: "#eec7d1",
  rose: "#d98a99",
  coral: "#f07963",
  orange: "#f2a65a",
  rust: "#b8592a",
  yellow: "#f5e04a",
  mustard: "#d0a72c",
  gold: "#c9a02c",
  olive: "#6b7a2e",
  green: "#12603a",
  sage: "#b9c3a3",
  forest: "#0d3f24",
  mint: "#9fd6b8",
  teal: "#1f6d74",
  navy: "#1e3a8a",
  blue: "#3b82f6",
  denim: "#3b618a",
  sky: "#9fc5e8",
  purple: "#6b3fa0",
  lavender: "#b7a3d1",
  plum: "#5a2a58",
};

const LIGHT_COLORS = new Set([
  "white",
  "ivory",
  "cream",
  "beige",
  "sand",
  "stone",
  "tan",
  "mint",
  "sky",
  "lavender",
  "pink",
  "sage",
  "silver",
]);

function extractColorSwatches(product: ShopifyProduct): ColorSwatch[] {
  const colorOption = product.options.find((o) =>
    /^colou?r$/i.test(o.name.trim()),
  );
  if (!colorOption) return [];

  const out: ColorSwatch[] = [];
  const seen = new Set<string>();
  for (const raw of colorOption.values) {
    const value = raw.trim();
    if (!value) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;

    // Accept two lookup strategies:
    //   1. exact match  — "Navy" → navy
    //   2. first word   — "Washed Indigo Blue" → blue
    const tokens = key.split(/\s+/);
    const direct = COLOR_MAP[key];
    const tokenHit = tokens.reduceRight<string | undefined>(
      (acc, t) => acc ?? COLOR_MAP[t],
      undefined,
    );
    const css = direct ?? tokenHit;
    if (!css) continue;

    seen.add(key);
    out.push({
      name: value,
      css,
      isLight: LIGHT_COLORS.has(key) || tokens.some((t) => LIGHT_COLORS.has(t)),
    });
    if (out.length >= 6) break;
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/* Variant picker popover                                                      */
/* -------------------------------------------------------------------------- */

interface VariantPanelProps {
  open: boolean;
  variants: ShopifyVariant[];
  onPick: (variantId: string) => void;
  fallbackCurrency: string;
  disabled?: boolean;
}

function VariantPanel({
  open,
  variants,
  onPick,
  fallbackCurrency,
  disabled,
}: VariantPanelProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="variant-panel"
          initial={{ y: -6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -6, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          role="menu"
          className={cn(
            "absolute left-3 right-3 bottom-[68px] z-30",
            "rounded-2xl nav-glass-pill p-2 max-h-56 overflow-y-auto",
          )}
        >
          <div className="px-2 pt-1 pb-2 font-ui text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-500">
            Select option
          </div>
          <ul className="flex flex-col gap-0.5">
            {variants.map((v) => {
              const label =
                v.selectedOptions.length > 0
                  ? v.selectedOptions.map((o) => o.value).join(" · ")
                  : v.title;
              return (
                <li key={v.id}>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => onPick(v.id)}
                    disabled={disabled}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-xl text-sm",
                      "flex items-center justify-between gap-3",
                      "hover:bg-brand-100/80 transition-colors",
                      "disabled:opacity-60 disabled:cursor-not-allowed",
                    )}
                  >
                    <span className="truncate font-ui text-brand-900">{label}</span>
                    <span className="shrink-0 font-ui text-xs text-brand-500 tabular-nums">
                      {formatPrice(
                        v.price.amount,
                        v.price.currencyCode ?? fallbackCurrency,
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ProductCard;
