import { cn } from "@/lib/utils";
import type { ShopifyProduct } from "@/types/shopify";
import { ProductCard } from "./ProductCard";

export interface ProductGridProps {
  products: ShopifyProduct[];
  heading?: React.ReactNode;
  /**
   * When true, the first row's images use `priority` so they're treated as LCP
   * candidates. Turn off for grids that appear below the fold.
   */
  priorityFirstRow?: boolean;
  /** Hides the heading visually but keeps it for screen readers. */
  hideHeading?: boolean;
  className?: string;
}

/**
 * Grid of ProductCards with staggered fade-up entrance.
 * Uses CSS `animate-fade-up` + per-card `animationDelay` from the card's
 * `index` prop — so the stagger keeps working inside Server Components.
 */
export function ProductGrid({
  products,
  heading,
  priorityFirstRow = false,
  hideHeading = false,
  className,
}: ProductGridProps) {
  if (products.length === 0) return null;

  return (
    <section className={cn("w-full", className)} aria-labelledby={heading ? "product-grid-heading" : undefined}>
      {heading && (
        <header className="mb-8 md:mb-10 flex items-baseline justify-between gap-4">
          <h2
            id="product-grid-heading"
            className={cn(
              "heading-display text-3xl md:text-4xl",
              hideHeading && "sr-only",
            )}
          >
            {heading}
          </h2>
        </header>
      )}

      <ul
        role="list"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
      >
        {products.map((product, i) => (
          <li key={product.id}>
            <ProductCard
              product={product}
              index={i}
              priority={priorityFirstRow && i < 4}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

export default ProductGrid;
