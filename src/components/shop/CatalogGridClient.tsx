"use client";

import { useEffect, useRef, useState } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductCardSkeleton } from "@/components/ui/SkeletonLoader";
import type { Product } from "@/types";

const CHUNK = 12;

/**
 * Progressive reveal + intersection observer. Works with the full filtered
 * list from the shop page (price/tag filters stay server + client as today).
 */
export function CatalogGridClient({
  products,
  priorityFirstRow = true,
}: {
  products: Product[];
  priorityFirstRow?: boolean;
}) {
  const [visible, setVisible] = useState(() => Math.min(CHUNK * 2, products.length));
  const [busy, setBusy] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setVisible(Math.min(CHUNK * 2, products.length));
  }, [products]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || visible >= products.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((e) => e.isIntersecting);
        if (!hit) return;
        setBusy(true);
        window.requestAnimationFrame(() => {
          setVisible((v) => Math.min(v + CHUNK, products.length));
          setBusy(false);
        });
      },
      { rootMargin: "96px", threshold: 0 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [visible, products.length]);

  const slice = products.slice(0, visible);

  return (
    <div className="w-full">
      <ul
        role="list"
        className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4"
      >
        {slice.map((product, i) => (
          <li key={product.id}>
            <ProductCard
              product={product}
              index={i}
              priority={priorityFirstRow && i < 4}
            />
          </li>
        ))}
      </ul>

      {busy && visible < products.length ? (
        <ul
          className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4"
          aria-hidden
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={`sk-${i}`}>
              <ProductCardSkeleton />
            </li>
          ))}
        </ul>
      ) : null}

      {visible < products.length ? (
        <div ref={sentinelRef} className="h-8 w-full" aria-hidden />
      ) : null}

      {visible >= products.length && products.length > CHUNK ? (
        <p className="mt-8 text-center font-ui text-sm text-muted-foreground">
          You&apos;ve reached the end of the list.
        </p>
      ) : null}
    </div>
  );
}
