"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

const COMPARE_STORAGE_KEY = "sshub_compare_handles";

export default function ComparePage() {
  const [handles, setHandles] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = localStorage.getItem(COMPARE_STORAGE_KEY);
        const list = raw ? (JSON.parse(raw) as string[]) : [];
        const clean = Array.from(new Set(list.filter((h) => typeof h === "string" && h.trim()))).slice(0, 4);
        if (cancelled) return;
        setHandles(clean);
        const loaded: Product[] = [];
        for (const handle of clean) {
          try {
            const p = await api.products.getByHandle(handle);
            if (p?.id) loaded.push(p);
          } catch {
            /* skip missing */
          }
        }
        if (!cancelled) setProducts(loaded);
      } catch {
        if (!cancelled) setHandles([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-brand-50 pb-20">
      <div className="mx-auto max-w-[1200px] px-4 py-12 md:px-8 md:py-16">
        <h1 className="font-display text-3xl font-bold tracking-tight text-brand-900 md:text-4xl">
          Compare products
        </h1>
        <p className="mt-2 max-w-xl text-brand-600">
          Items you add from a product page appear here (up to four).{" "}
          <Link href="/shop" className="font-semibold text-brand-900 underline-offset-2 hover:underline">
            Browse the shop
          </Link>
        </p>

        {loading ? (
          <p className="mt-10 text-brand-600">Loading…</p>
        ) : handles.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-brand-200 bg-white p-10 text-center shadow-sm">
            <p className="text-brand-700">No products saved for compare yet.</p>
            <Link
              href="/shop"
              className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-brand-900 px-8 font-ui font-semibold text-white"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
              <li key={p.id} className="rounded-2xl border border-brand-200 bg-white p-4 shadow-sm">
                <Link href={`/products/${p.handle}`} className="font-semibold text-brand-900 hover:underline">
                  {p.title}
                </Link>
                <p className="mt-2 text-sm text-brand-600">
                  {formatPrice(
                    p.priceRange.minVariantPrice.amount,
                    p.priceRange.minVariantPrice.currencyCode,
                  )}
                </p>
              </li>
            ))}
          </ul>
        )}

        {!loading && handles.length > 0 && products.length < handles.length && (
          <p className="mt-6 text-sm text-amber-800">
            Some saved handles could not be loaded. They may have been removed from the catalog.
          </p>
        )}
      </div>
    </div>
  );
}
