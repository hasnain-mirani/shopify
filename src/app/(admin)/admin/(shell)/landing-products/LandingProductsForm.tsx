"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { Check, Search, X, GripVertical, LayoutGrid } from "lucide-react";
import { AdminCard } from "@/components/admin/AdminShell";
import type { LandingProductsConfig } from "@/lib/landing-products";
import { saveLandingProductsAction, type LandingProductsFormState } from "./actions";
import { cn } from "@/lib/utils";

interface ProductOption {
  id: string;
  title: string;
  handle: string;
  status: string;
  vendor: string;
  image: { url: string; alt: string } | null;
  price: { amount: string; currency: string };
}

interface Props {
  initial: LandingProductsConfig;
  products: ProductOption[];
}

const INITIAL_STATE: LandingProductsFormState = {};

export function LandingProductsForm({ initial, products }: Props) {
  const [state, action, pending] = useActionState(saveLandingProductsAction, INITIAL_STATE);
  const saved = state.saved ?? initial;

  const [selected, setSelected] = useState<string[]>(saved.productHandles);
  const [search, setSearch] = useState("");

  const toggle = (handle: string) => {
    setSelected((prev) => {
      if (prev.includes(handle)) return prev.filter((h) => h !== handle);
      if (prev.length >= 8) return prev; // max 8
      return [...prev, handle];
    });
  };

  const remove = (handle: string) => setSelected((prev) => prev.filter((h) => h !== handle));

  const filtered = products.filter((p) =>
    search
      ? p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.handle.toLowerCase().includes(search.toLowerCase()) ||
        p.vendor.toLowerCase().includes(search.toLowerCase())
      : true,
  );

  return (
    <form action={action} className="space-y-8">
      {/* Hidden inputs for selected handles */}
      {selected.map((h) => (
        <input key={h} type="hidden" name="productHandles" value={h} />
      ))}

      {/* Success / error banner */}
      {state.ok === true && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300">
          <Check size={16} />
          Landing page products saved successfully. Home page cache revalidated.
        </div>
      )}
      {state.ok === false && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800 dark:bg-red-950/30 dark:border-red-800 dark:text-red-300">
          {state.error}
        </div>
      )}

      {/* Section copy overrides */}
      <AdminCard>
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="font-semibold text-base">Section Labels</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Override the heading and sub-copy for the "Featured Products" section on the home page.
          </p>
        </div>
        <div className="px-5 py-5 space-y-4">
          <div>
            <label htmlFor="sectionHeading" className="block text-xs font-medium uppercase tracking-wider text-zinc-500 mb-1.5">
              Section Heading
            </label>
            <input
              id="sectionHeading"
              name="sectionHeading"
              type="text"
              defaultValue={saved.sectionHeading}
              maxLength={80}
              placeholder='e.g. "Featured Products"'
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:ring-zinc-400"
            />
            {state.fieldErrors?.sectionHeading && (
              <p className="mt-1 text-xs text-red-600">{state.fieldErrors.sectionHeading}</p>
            )}
          </div>
          <div>
            <label htmlFor="sectionSubcopy" className="block text-xs font-medium uppercase tracking-wider text-zinc-500 mb-1.5">
              Sub-copy
            </label>
            <textarea
              id="sectionSubcopy"
              name="sectionSubcopy"
              rows={2}
              defaultValue={saved.sectionSubcopy}
              maxLength={240}
              placeholder="Short description shown below the heading…"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:ring-zinc-400 resize-none"
            />
          </div>
        </div>
      </AdminCard>

      {/* Selected products preview */}
      <AdminCard>
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold text-base">
              Selected Products
              <span className="ml-2 text-xs font-normal text-zinc-500">
                {selected.length} / 8
              </span>
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              These products will appear in the "Featured Products" grid on the home page (max 8).
            </p>
          </div>
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => setSelected([])}
              className="text-xs text-zinc-500 hover:text-red-600 transition-colors shrink-0"
            >
              Clear all
            </button>
          )}
        </div>

        {selected.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <LayoutGrid size={32} className="mx-auto text-zinc-300 mb-3" />
            <p className="text-sm text-zinc-500">No products selected yet.</p>
            <p className="text-xs text-zinc-400 mt-1">Pick up to 8 products from the list below.</p>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {selected.map((handle, idx) => {
              const product = products.find((p) => p.handle === handle);
              if (!product) return null;
              return (
                <li key={handle} className="flex items-center gap-3 px-5 py-3">
                  <span className="text-zinc-300 shrink-0">
                    <GripVertical size={16} />
                  </span>
                  <span className="w-5 h-5 text-xs text-zinc-400 text-center shrink-0">
                    {idx + 1}
                  </span>
                  {product.image ? (
                    <Image
                      src={product.image.url}
                      alt={product.image.alt}
                      width={36}
                      height={36}
                      className="rounded-md object-cover shrink-0 border border-zinc-100"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-md bg-zinc-100 shrink-0 flex items-center justify-center text-zinc-400 text-xs font-bold">
                      {product.title.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.title}</p>
                    <p className="text-xs text-zinc-400 truncate">{product.handle}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(handle)}
                    aria-label={`Remove ${product.title}`}
                    className="p-1 rounded text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </AdminCard>

      {/* Product picker */}
      <AdminCard>
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="font-semibold text-base">Product Library</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Click any product to add or remove it from the featured grid.
          </p>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by title, handle, or vendor…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:ring-zinc-400"
            />
          </div>
        </div>

        {/* Product grid */}
        <div className="p-5">
          {filtered.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-8">No products match your search.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered.map((product) => {
                const isSelected = selected.includes(product.handle);
                const isDisabled = !isSelected && selected.length >= 8;
                return (
                  <button
                    key={product.handle}
                    type="button"
                    onClick={() => toggle(product.handle)}
                    disabled={isDisabled}
                    title={isDisabled ? "Maximum 8 products selected" : undefined}
                    className={cn(
                      "relative group flex flex-col rounded-xl border-2 overflow-hidden text-left transition-all duration-200",
                      isSelected
                        ? "border-zinc-900 dark:border-zinc-100 shadow-md"
                        : isDisabled
                          ? "border-zinc-100 dark:border-zinc-800 opacity-50 cursor-not-allowed"
                          : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500",
                    )}
                  >
                    {/* Check badge */}
                    {isSelected && (
                      <span className="absolute top-2 right-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 dark:bg-zinc-100">
                        <Check size={11} className="text-white dark:text-zinc-900" />
                      </span>
                    )}

                    {/* Image */}
                    <div className="aspect-square bg-zinc-50 dark:bg-zinc-800 overflow-hidden">
                      {product.image ? (
                        <Image
                          src={product.image.url}
                          alt={product.image.alt}
                          width={200}
                          height={200}
                          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-300 text-3xl font-bold">
                          {product.title.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-2.5 flex-1 bg-white dark:bg-zinc-900">
                      <p className="text-xs font-semibold leading-tight line-clamp-2 text-zinc-900 dark:text-zinc-100">
                        {product.title}
                      </p>
                      <p className="text-xs text-zinc-400 mt-0.5 truncate">{product.vendor}</p>
                      <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mt-1">
                        {parseFloat(product.price.amount).toFixed(2)} {product.price.currency}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </AdminCard>

      {/* Save button */}
      <div className="flex justify-end gap-3 pb-8">
        <button
          type="button"
          onClick={() => setSelected(saved.productHandles)}
          className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-zinc-900 px-5 py-2 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

export default LandingProductsForm;
