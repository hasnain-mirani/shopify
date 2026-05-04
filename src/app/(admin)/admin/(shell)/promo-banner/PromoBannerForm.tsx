"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Check, ExternalLink, Megaphone, Search } from "lucide-react";
import { AdminCard } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn, formatPrice } from "@/lib/utils";
import type { PromoBannerConfig } from "@/lib/promo-banner";
import {
  savePromoBannerAction,
  type PromoBannerFormState,
} from "./actions";

const MAX_SELECTED = 12;

export interface PromoFormProduct {
  id: string;
  title: string;
  handle: string;
  status: "ACTIVE" | "ARCHIVED" | "DRAFT";
  vendor: string | null;
  image: { url: string; alt: string } | null;
  price: { amount: string; currency: string };
}

interface Props {
  initial: PromoBannerConfig;
  products: PromoFormProduct[];
}

const initialState: PromoBannerFormState = {};

export function PromoBannerForm({ initial, products }: Props) {
  const [state, formAction, pending] = useActionState(
    savePromoBannerAction,
    initialState,
  );

  const [enabled, setEnabled] = useState(initial.enabled);
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(initial.productHandles),
  );
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (state.ok) {
      toast.success("Promo banner saved");
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state.ok, state.error]);

  const fe = state.fieldErrors ?? {};

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.handle.toLowerCase().includes(q) ||
        (p.vendor ?? "").toLowerCase().includes(q),
    );
  }, [products, query]);

  const toggle = (handle: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(handle)) {
        next.delete(handle);
      } else {
        if (next.size >= MAX_SELECTED) {
          toast.error(`You can feature at most ${MAX_SELECTED} products.`);
          return prev;
        }
        next.add(handle);
      }
      return next;
    });
  };

  const selectedArr = useMemo(() => Array.from(selected), [selected]);
  const lookup = useMemo(() => {
    const m = new Map<string, PromoFormProduct>();
    for (const p of products) m.set(p.handle, p);
    return m;
  }, [products]);

  return (
    <form action={formAction} className="grid gap-6 xl:grid-cols-3">
      {/* Hidden handles mirror the selection set so the server action gets them. */}
      {selectedArr.map((h) => (
        <input key={h} type="hidden" name="productHandles" value={h} />
      ))}

      {/* ─────────── Left column: banner copy + product picker ─────────── */}
      <div className="space-y-6 xl:col-span-2">
        <AdminCard className="p-6 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                <Megaphone size={12} />
                Banner copy
              </div>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                This text renders above the featured products on the
                storefront.
              </p>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-3 select-none">
              <input
                type="checkbox"
                name="enabled"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className="relative h-6 w-11 rounded-full bg-zinc-300 transition-colors peer-checked:bg-brand-900 dark:bg-zinc-700 dark:peer-checked:bg-zinc-100"
              >
                <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
              </span>
              <span className="text-sm font-medium">
                {enabled ? "Live on store" : "Hidden"}
              </span>
            </label>
          </div>

          <Input
            name="headline"
            label="Headline"
            defaultValue={initial.headline}
            placeholder="Bundle & glow"
            required
            variant="outline"
            error={fe.headline}
          />

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="promo-subheadline"
              className="text-xs font-medium uppercase tracking-wider text-brand-600"
            >
              Subheadline
            </label>
            <textarea
              id="promo-subheadline"
              name="subheadline"
              rows={3}
              defaultValue={initial.subheadline}
              placeholder="Pick a phone case and a home piece — save 15% on any set."
              className="rounded-xl border border-brand-300 focus:border-brand-900 bg-white px-4 py-3 text-sm outline-none transition-colors dark:bg-zinc-900 dark:border-zinc-700 dark:focus:border-zinc-100"
            />
            {fe.subheadline && (
              <p className="text-xs text-red-600">{fe.subheadline}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              name="ctaLabel"
              label="CTA label"
              defaultValue={initial.ctaLabel}
              placeholder="Shop the bundle"
              required
              variant="outline"
              error={fe.ctaLabel}
            />
            <Input
              name="ctaHref"
              label="CTA link"
              defaultValue={initial.ctaHref}
              placeholder="/collections/bundle-deals"
              required
              variant="outline"
              error={fe.ctaHref}
              hint="A storefront path like /collections/... or a full URL."
            />
          </div>
        </AdminCard>

        <AdminCard className="overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-zinc-200 bg-zinc-50 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900/60 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Feature products</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {selected.size} of {MAX_SELECTED} selected · the first four
                render in the banner.
              </p>
              {fe.productHandles && (
                <p className="mt-1 text-xs text-red-600">
                  {fe.productHandles}
                </p>
              )}
            </div>
            <div className="relative w-full sm:w-64">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products…"
                className="w-full rounded-full border border-zinc-200 bg-white py-2 pl-8 pr-3 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-100"
              />
            </div>
          </div>

          {products.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm font-medium">
                No products in your store yet.
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Create a product first, then come back here to feature it.
              </p>
              <Link
                href="/admin/products/new"
                className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100"
              >
                New product →
              </Link>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-sm text-zinc-500">
              No products match &ldquo;{query}&rdquo;.
            </div>
          ) : (
            <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filtered.map((p) => {
                const isSelected = selected.has(p.handle);
                return (
                  <li key={p.id}>
                    <label
                      className={cn(
                        "group flex cursor-pointer items-center gap-4 px-5 py-3 transition-colors",
                        isSelected
                          ? "bg-brand-50/60 dark:bg-zinc-800/40"
                          : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                          isSelected
                            ? "border-brand-900 bg-brand-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                            : "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900",
                        )}
                      >
                        {isSelected && <Check size={14} strokeWidth={3} />}
                      </span>
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={isSelected}
                        onChange={() => toggle(p.handle)}
                      />
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
                        {p.image && (
                          <Image
                            src={p.image.url}
                            alt={p.image.alt}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium">
                            {p.title}
                          </span>
                          <StatusBadge kind="productStatus" value={p.status} />
                        </div>
                        <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                          /{p.handle}
                          {p.vendor ? ` · ${p.vendor}` : ""}
                        </div>
                      </div>
                      <span className="text-sm font-medium tabular-nums">
                        {formatPrice(p.price.amount, p.price.currency)}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </AdminCard>
      </div>

      {/* ─────────── Right column: preview + save ─────────── */}
      <div className="space-y-6">
        <AdminCard className="p-6">
          <p className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
            Preview
          </p>
          <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-br from-brand-50 via-white to-brand-100 p-5 dark:border-zinc-800 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800">
            {!enabled && (
              <p className="mb-3 inline-block rounded-full bg-zinc-900/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                Hidden from storefront
              </p>
            )}
            <p className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {initial.headline || "Bundle & glow"}
            </p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {initial.subheadline || "Pair any two — save 15%."}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {selectedArr.slice(0, 4).map((h) => {
                const p = lookup.get(h);
                if (!p) return null;
                return (
                  <div
                    key={h}
                    className="relative aspect-square overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800"
                    title={p.title}
                  >
                    {p.image && (
                      <Image
                        src={p.image.url}
                        alt={p.image.alt}
                        fill
                        sizes="100px"
                        className="object-cover"
                      />
                    )}
                  </div>
                );
              })}
              {selectedArr.length === 0 && (
                <p className="col-span-2 rounded-lg border border-dashed border-zinc-300 p-4 text-center text-xs text-zinc-500 dark:border-zinc-700">
                  Pick products to see them here.
                </p>
              )}
            </div>
            <div className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-zinc-900 dark:text-zinc-100">
              {initial.ctaLabel || "Shop the bundle"} →
            </div>
          </div>
        </AdminCard>

        <AdminCard className="p-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Last saved</span>
            <span>
              {initial.updatedAt && initial.updatedAt !== new Date(0).toISOString()
                ? new Date(initial.updatedAt).toLocaleString()
                : "Never"}
            </span>
          </div>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={pending}
            className="w-full"
          >
            {pending ? "Saving…" : "Save banner"}
          </Button>
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            View storefront
            <ExternalLink size={12} />
          </Link>
        </AdminCard>
      </div>
    </form>
  );
}

export default PromoBannerForm;
