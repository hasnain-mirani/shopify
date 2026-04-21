import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ShopifyCollection } from "@/types";

export type CollectionCardData = Pick<
  ShopifyCollection,
  "id" | "handle" | "title" | "image"
>;

export interface CollectionCardProps {
  collection: CollectionCardData;
  className?: string;
  priority?: boolean;
  /** 1-based display number. Renders as "01", "02", … top-left. */
  index?: number;
  /** Override aspect-ratio. Default "4/5"; pass "3/4" or "1/1" for bento sizing. */
  aspect?: "4/5" | "3/4" | "1/1" | "16/9";
  /** Accent fallback when the collection has no image. */
  tone?: "green" | "yellow" | "orange";
}

const ASPECT_CLASS: Record<NonNullable<CollectionCardProps["aspect"]>, string> = {
  "4/5": "aspect-[4/5]",
  "3/4": "aspect-[3/4]",
  "1/1": "aspect-square",
  "16/9": "aspect-[16/9]",
};

const TONE_GRADIENT: Record<NonNullable<CollectionCardProps["tone"]>, string> = {
  green: "from-brand-700 via-brand-800 to-brand-900",
  yellow: "from-accent via-accent-dark to-[color:var(--color-accent-orange)]",
  orange:
    "from-[color:var(--color-accent-orange)] via-brand-600 to-brand-800",
};

export function CollectionCard({
  collection,
  className,
  priority,
  index,
  aspect = "4/5",
  tone = "green",
}: CollectionCardProps) {
  return (
    <Link
      href={`/collections/${collection.handle}`}
      className={cn(
        "group relative block overflow-hidden rounded-[24px] bg-brand-100",
        ASPECT_CLASS[aspect],
        className,
      )}
    >
      {collection.image ? (
        <Image
          src={collection.image.url}
          alt={collection.image.altText ?? collection.title}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
        />
      ) : (
        // No image? Fall back to a bold gradient slab so it still looks intentional.
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br",
            TONE_GRADIENT[tone],
          )}
        />
      )}

      {/* Dark vignette so copy is always legible */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-brand-900/70 via-brand-900/10 to-transparent"
      />

      {/* Shimmer sweep on hover */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background:
            "linear-gradient(120deg, transparent 40%, rgba(245,224,74,0.15) 50%, transparent 60%)",
        }}
      />

      {/* Top-left index number */}
      {typeof index === "number" && (
        <span className="absolute top-4 left-5 font-display text-white/80 text-sm tracking-wider">
          {String(index).padStart(2, "0")}
        </span>
      )}

      {/* Top-right arrow badge */}
      <span
        aria-hidden="true"
        className="absolute top-4 right-4 h-9 w-9 rounded-full glass-pill flex items-center justify-center text-white transition-transform duration-500 ease-out group-hover:-translate-y-1 group-hover:translate-x-1"
      >
        <ArrowUpRight className="h-4 w-4" />
      </span>

      {/* Bottom copy */}
      <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 text-white">
        <h3 className="font-display text-2xl md:text-3xl lg:text-4xl tracking-tight leading-[1.05]">
          {collection.title}
        </h3>
        <span className="mt-2 inline-flex items-center gap-1.5 font-ui text-[11px] uppercase tracking-[0.22em] opacity-90 group-hover:opacity-100">
          Shop now
          <span
            aria-hidden="true"
            className="inline-block h-px w-5 bg-accent transition-[width] duration-300 group-hover:w-9"
          />
        </span>
      </div>
    </Link>
  );
}

export default CollectionCard;
