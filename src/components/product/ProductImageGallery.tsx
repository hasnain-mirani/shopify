"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ShopifyImage } from "@/types";

export interface ProductImageGalleryProps {
  images: ShopifyImage[];
  productTitle: string;
  className?: string;
}

/**
 * PDP image gallery: large main image with a zoom-on-hover effect, plus a
 * thumbnail strip. Works with any number of images (gracefully hides the
 * thumbnail strip when there's only one).
 */
export function ProductImageGallery({
  images,
  productTitle,
  className,
}: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex] ?? images[0];

  if (!active) {
    return (
      <div
        className={cn(
          "aspect-[3/4] w-full rounded-2xl bg-brand-100",
          className,
        )}
        aria-label="No image available"
      />
    );
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div
        className={cn(
          "group relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-brand-100",
        )}
      >
        <Image
          key={active.url}
          src={active.url}
          alt={active.altText ?? productTitle}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority={activeIndex === 0}
          className={cn(
            "object-cover transition-transform duration-500 ease-out",
            "group-hover:scale-105",
          )}
        />
      </div>

      {images.length > 1 && (
        <ul className="grid grid-cols-5 gap-2">
          {images.slice(0, 10).map((img, i) => {
            const isActive = i === activeIndex;
            return (
              <li key={img.url}>
                <button
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  aria-label={`View image ${i + 1} of ${images.length}`}
                  aria-current={isActive}
                  className={cn(
                    "relative block aspect-square w-full overflow-hidden rounded-lg bg-brand-100",
                    "outline-none transition-all duration-200",
                    "ring-1 ring-transparent",
                    isActive
                      ? "ring-brand-900 ring-offset-2 ring-offset-surface"
                      : "hover:ring-brand-300",
                  )}
                >
                  <Image
                    src={img.url}
                    alt=""
                    aria-hidden="true"
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default ProductImageGallery;
