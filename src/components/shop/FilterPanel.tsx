"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, PackageCheck, SlidersHorizontal, X } from "lucide-react";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { cn } from "@/lib/utils";

export interface FilterPanelProps {
  /** Currency code used for the min/max input placeholders. */
  currencyCode?: string;
  /** Known min/max of the currently-visible catalog, used as placeholders. */
  priceBounds?: { min: number; max: number };
}

/**
 * Rich filter popover for the shop toolbar.
 *
 * Handled filters:
 *   • `min` / `max`  — price range (client-side filter in the page,
 *                     since Shopify's Storefront API doesn't expose a
 *                     reliable `variants.price` query operator).
 *   • `instock`      — availability toggle (added to the Shopify
 *                     `query` string as `available_for_sale:true`).
 *
 * Trigger: pill button with a badge showing the count of active
 * filters. Popover: nav-glass frosted card with a small grid.
 */
export function FilterPanel({
  currencyCode = "USD",
  priceBounds,
}: FilterPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  useOutsideClick(rootRef, () => setOpen(false), open);

  // Controlled-but-optimistic local copy; committed on "Apply".
  const initialMin = searchParams.get("min") ?? "";
  const initialMax = searchParams.get("max") ?? "";
  const initialInStock = searchParams.get("instock") === "1";

  const [minInput, setMinInput] = useState(initialMin);
  const [maxInput, setMaxInput] = useState(initialMax);
  const [inStock, setInStock] = useState(initialInStock);

  const activeCount =
    (initialMin ? 1 : 0) + (initialMax ? 1 : 0) + (initialInStock ? 1 : 0);

  // Localized currency symbol for the placeholders — no decimals.
  let symbol = "";
  try {
    const parts = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).formatToParts(0);
    symbol = parts.find((p) => p.type === "currency")?.value ?? "";
  } catch {
    symbol = "$";
  }

  const commit = (patch: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    }
    startTransition(() => {
      const qs = params.toString();
      router.replace(qs ? `?${qs}` : "?", { scroll: false });
    });
  };

  const handleApply = (e?: FormEvent) => {
    e?.preventDefault();
    commit({
      min: minInput.trim() || null,
      max: maxInput.trim() || null,
      instock: inStock ? "1" : null,
    });
    setOpen(false);
  };

  const handleClear = () => {
    setMinInput("");
    setMaxInput("");
    setInStock(false);
    commit({ min: null, max: null, instock: null });
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        data-pending={pending}
        className={cn(
          "group inline-flex items-center gap-2 h-10 pl-3.5 pr-3 rounded-full",
          "bg-white/80 backdrop-blur-sm border border-brand-200/70",
          "hover:border-brand-900/30 text-brand-900 font-ui text-[13px] font-semibold",
          "transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-900",
          "data-[pending=true]:opacity-60",
          activeCount > 0 && "border-brand-900/30",
        )}
      >
        <SlidersHorizontal className="h-3.5 w-3.5 text-brand-700" aria-hidden="true" />
        <span>Filters</span>
        {activeCount > 0 && (
          <span
            aria-label={`${activeCount} active filters`}
            className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-accent text-brand-900 text-[11px] font-semibold tabular-nums leading-none"
          >
            {activeCount}
          </span>
        )}
        <ChevronDown
          className={cn(
            "h-4 w-4 text-brand-700 transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="filters-popover"
            role="dialog"
            aria-label="Filter products"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "absolute top-full right-0 mt-2 z-40",
              "w-[min(92vw,340px)] rounded-2xl nav-glass-pill p-4",
            )}
          >
            <form onSubmit={handleApply} className="flex flex-col gap-5">
              {/* Header rail */}
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 font-ui text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-800">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-accent-dark" aria-hidden="true" />
                  Refine
                </span>
                <button
                  type="button"
                  aria-label="Close filters"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full text-brand-500 hover:text-brand-900 hover:bg-brand-100/80 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Price range */}
              <fieldset className="flex flex-col gap-2">
                <legend className="font-ui text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-500 mb-1">
                  Price
                </legend>
                <div className="grid grid-cols-2 gap-2">
                  <PriceInput
                    label="Min"
                    symbol={symbol}
                    value={minInput}
                    onChange={setMinInput}
                    placeholder={priceBounds ? String(Math.floor(priceBounds.min)) : "0"}
                  />
                  <PriceInput
                    label="Max"
                    symbol={symbol}
                    value={maxInput}
                    onChange={setMaxInput}
                    placeholder={priceBounds ? String(Math.ceil(priceBounds.max)) : "5000"}
                  />
                </div>
                {priceBounds && (
                  <span className="font-ui text-[10px] uppercase tracking-[0.2em] text-brand-400">
                    Catalog range {symbol}
                    {Math.floor(priceBounds.min)} – {symbol}
                    {Math.ceil(priceBounds.max)}
                  </span>
                )}
              </fieldset>

              {/* Availability toggle */}
              <fieldset>
                <legend className="sr-only">Availability</legend>
                <label
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 cursor-pointer",
                    "bg-white/60 hover:bg-white transition-colors border",
                    inStock ? "border-accent/60" : "border-brand-200/70",
                  )}
                >
                  <span className="flex items-center gap-2.5">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "inline-flex h-7 w-7 items-center justify-center rounded-full",
                        inStock ? "bg-accent text-brand-900" : "bg-brand-100 text-brand-500",
                      )}
                    >
                      <PackageCheck className="h-4 w-4" />
                    </span>
                    <span className="flex flex-col leading-tight">
                      <span className="font-ui text-[13px] font-semibold text-brand-900">
                        In stock only
                      </span>
                      <span className="font-ui text-[11px] text-brand-500">
                        Hide sold-out pieces
                      </span>
                    </span>
                  </span>
                  <Toggle
                    checked={inStock}
                    onChange={setInStock}
                    label="In stock only"
                  />
                </label>
              </fieldset>

              {/* Footer actions */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={activeCount === 0 && !minInput && !maxInput && !inStock}
                  className="font-ui text-[12px] font-semibold uppercase tracking-[0.18em] text-brand-500 hover:text-brand-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Clear all
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand-900 text-white pl-4 pr-3 h-9 font-ui text-[12px] font-semibold uppercase tracking-[0.18em] hover:bg-brand-800 transition-colors"
                >
                  Apply
                  <span
                    aria-hidden="true"
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent text-brand-900 text-[10px]"
                  >
                    →
                  </span>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Small building blocks                                                       */
/* -------------------------------------------------------------------------- */

function PriceInput({
  label,
  symbol,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  symbol: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const id = `price-${label.toLowerCase()}`;
  return (
    <div className="relative">
      <label
        htmlFor={id}
        className="absolute top-1 left-3 font-ui text-[9px] font-semibold uppercase tracking-[0.2em] text-brand-500"
      >
        {label}
      </label>
      <span
        aria-hidden="true"
        className="absolute left-3 bottom-2 font-ui text-sm text-brand-500 tabular-nums"
      >
        {symbol}
      </span>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={0}
        step={1}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "peer w-full h-14 rounded-xl bg-white/60 border border-brand-200/70 outline-none",
          "pt-5 pb-2 pl-7 pr-3 font-ui text-sm font-semibold text-brand-900 tabular-nums",
          "focus:border-brand-900/40 focus:bg-white transition-colors",
          "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
        )}
      />
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex items-center h-6 w-11 rounded-full transition-colors outline-none shrink-0",
        "focus-visible:ring-2 focus-visible:ring-brand-900",
        checked ? "bg-brand-900" : "bg-brand-300",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-0.5 inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
          checked ? "translate-x-[22px] bg-accent" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

export default FilterPanel;
