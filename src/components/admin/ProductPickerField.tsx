"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ExternalLink, Package, Search, X, ChevronDown } from "lucide-react";

interface ProductOption {
  id: string;
  title: string;
  handle: string;
  status: string;
  featuredImage: { url: string; altText?: string | null } | null;
}

interface ProductPickerFieldProps {
  /** Current href value (controlled by parent form field state) */
  value: string;
  /** Called when the user picks a product or clears */
  onChange: (href: string) => void;
  /** Slide index label, e.g. 0 → "Slide 1" */
  slideIndex: number;
}

export function ProductPickerField({
  value,
  onChange,
  slideIndex,
}: ProductPickerFieldProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ProductOption | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ---- Fetch products on query change ---- */
  const fetchProducts = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/products?search=${encodeURIComponent(q)}`,
        { cache: "no-store" },
      );
      const data: ProductOption[] = await res.json();
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchProducts(query), 280);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, open, fetchProducts]);

  /* ---- Open dropdown and immediately load ---- */
  const handleOpen = () => {
    setOpen(true);
    fetchProducts(query);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  /* ---- Close on outside click ---- */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ---- Select a product ---- */
  const handleSelect = (p: ProductOption) => {
    setSelected(p);
    onChange(`/products/${p.handle}`);
    setOpen(false);
    setQuery("");
  };

  /* ---- Clear product selection ---- */
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected(null);
    onChange("");
  };

  /* ---- Detect if value matches a product handle ---- */
  const isProductUrl = value.startsWith("/products/");

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium uppercase tracking-wider text-brand-600">
        Link to Product <span className="normal-case text-zinc-400 font-normal">(or type a custom URL below)</span>
      </label>

      {/* ── Product Picker Button ── */}
      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          onClick={open ? () => setOpen(false) : handleOpen}
          className="w-full flex items-center gap-2.5 rounded-xl border border-brand-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm text-left transition-colors hover:border-brand-900 dark:hover:border-zinc-400 focus:outline-none focus:border-brand-900"
        >
          {selected || isProductUrl ? (
            <>
              {/* Thumbnail */}
              {(selected?.featuredImage?.url) && (
                <span className="relative flex-shrink-0 h-8 w-8 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                  <Image
                    src={selected.featuredImage.url}
                    alt={selected.featuredImage.altText ?? selected.title}
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                </span>
              )}
              {!selected?.featuredImage?.url && (
                <span className="flex-shrink-0 h-8 w-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
                  <Package size={14} className="text-zinc-400" />
                </span>
              )}

              <span className="flex-1 min-w-0">
                <span className="block font-medium text-zinc-900 dark:text-zinc-100 truncate">
                  {selected ? selected.title : value.replace("/products/", "")}
                </span>
                <span className="block text-[11px] text-zinc-400 truncate">{value}</span>
              </span>

              {/* View product link */}
              {value && (
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex-shrink-0 text-zinc-400 hover:text-brand-600 transition-colors"
                  title="Open product in new tab"
                >
                  <ExternalLink size={14} />
                </a>
              )}

              {/* Clear */}
              <button
                type="button"
                onClick={handleClear}
                className="flex-shrink-0 text-zinc-400 hover:text-red-500 transition-colors rounded-full"
                title="Remove product link"
              >
                <X size={14} />
              </button>
            </>
          ) : (
            <>
              <Package size={15} className="text-zinc-400 flex-shrink-0" />
              <span className="flex-1 text-zinc-400">Pick a product…</span>
              <ChevronDown size={14} className={`text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`} />
            </>
          )}
        </button>

        {/* ── Dropdown ── */}
        {open && (
          <div className="absolute z-50 mt-1.5 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden">
            {/* Search input */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-zinc-100 dark:border-zinc-800">
              <Search size={14} className="text-zinc-400 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products…"
                className="flex-1 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none"
              />
              {loading && (
                <span className="flex-shrink-0 h-3.5 w-3.5 rounded-full border-2 border-brand-600 border-t-transparent animate-spin" />
              )}
            </div>

            {/* Results */}
            <ul className="max-h-64 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
              {results.length === 0 && !loading && (
                <li className="px-4 py-5 text-center text-sm text-zinc-400">
                  {query ? "No products found" : "Start typing to search…"}
                </li>
              )}
              {results.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(p)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors text-left"
                  >
                    {/* Thumbnail */}
                    <span className="relative flex-shrink-0 h-9 w-9 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                      {p.featuredImage?.url ? (
                        <Image
                          src={p.featuredImage.url}
                          alt={p.featuredImage.altText ?? p.title}
                          fill
                          sizes="36px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center">
                          <Package size={14} className="text-zinc-400" />
                        </span>
                      )}
                    </span>

                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {p.title}
                      </span>
                      <span className="block text-[11px] text-zinc-400 truncate">
                        /products/{p.handle}
                      </span>
                    </span>

                    {/* Status chip */}
                    <span
                      className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        p.status === "ACTIVE" || p.status === "active"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}
                    >
                      {p.status?.toLowerCase()}
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            {/* Footer hint */}
            <div className="px-3 py-2 border-t border-zinc-100 dark:border-zinc-800 text-[10px] text-zinc-400">
              Slide {slideIndex + 1} → selecting a product sets the CTA URL automatically
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductPickerField;
