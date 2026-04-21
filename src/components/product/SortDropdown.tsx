"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownUp, Check, ChevronDown } from "lucide-react";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { cn } from "@/lib/utils";
import { SORT_OPTIONS, type SortValue } from "./sort-utils";

export interface SortDropdownProps {
  paramKey?: string;
}

/**
 * Custom sort popover — replaces the native `<select>` so we can
 * match the rest of the UI (pill trigger, frosted menu, animated
 * check-mark on the active row). Keyboard-accessible via the trigger
 * button + standard ArrowUp/ArrowDown on the radio items.
 */
export function SortDropdown({ paramKey = "sort" }: SortDropdownProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  useOutsideClick(rootRef, () => setOpen(false), open);

  const current = (searchParams.get(paramKey) ?? "BEST_SELLING") as SortValue;
  const currentLabel =
    SORT_OPTIONS.find((o) => o.value === current)?.label ?? "Best selling";

  const apply = (next: SortValue) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "BEST_SELLING") params.delete(paramKey);
    else params.set(paramKey, next);

    startTransition(() => {
      const qs = params.toString();
      router.replace(qs ? `?${qs}` : "?", { scroll: false });
    });
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        data-pending={pending}
        className={cn(
          "group inline-flex items-center gap-2.5 rounded-full",
          "pl-4 pr-3 h-10 min-w-[180px] cursor-pointer outline-none",
          "bg-white/80 backdrop-blur-sm border border-brand-200/70",
          "hover:border-brand-900/30 transition-colors",
          "focus-visible:ring-2 focus-visible:ring-brand-900",
          "data-[pending=true]:opacity-60",
        )}
      >
        <ArrowDownUp
          className="h-3.5 w-3.5 text-brand-500 shrink-0"
          aria-hidden="true"
        />
        <span className="flex items-baseline gap-1.5 leading-none min-w-0 flex-1">
          <span className="font-ui text-[10px] uppercase tracking-[0.22em] text-brand-500">
            Sort
          </span>
          <span className="font-ui text-[13px] font-semibold text-brand-900 truncate">
            {currentLabel}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-brand-700 shrink-0 transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            key="sort-menu"
            role="listbox"
            aria-label="Sort products"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "absolute top-full right-0 mt-2 z-40 min-w-[220px]",
              "rounded-2xl nav-glass-pill p-1.5 outline-none",
            )}
          >
            {SORT_OPTIONS.map((opt) => {
              const active = opt.value === current;
              return (
                <li key={opt.value} role="none">
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => apply(opt.value)}
                    className={cn(
                      "group/row w-full flex items-center justify-between gap-4",
                      "rounded-xl px-3 py-2 font-ui text-[13px] text-left",
                      "transition-colors outline-none",
                      active
                        ? "bg-accent/30 text-brand-900 font-semibold"
                        : "text-brand-700 hover:bg-brand-100/80 hover:text-brand-900",
                    )}
                  >
                    <span>{opt.label}</span>
                    {active && (
                      <span
                        aria-hidden="true"
                        className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent text-brand-900"
                      >
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SortDropdown;
