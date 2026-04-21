import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

export interface ProductGridSkeletonProps {
  count?: number;
  showHeading?: boolean;
  className?: string;
}

/**
 * Matches `ProductGrid`'s layout so page transitions don't shift.
 * Default is 8 cards (two rows on desktop at lg:grid-cols-4).
 */
export function ProductGridSkeleton({
  count = 8,
  showHeading = false,
  className,
}: ProductGridSkeletonProps) {
  return (
    <section className={cn("w-full", className)} aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading products</span>

      {showHeading && (
        <div className="mb-8 md:mb-10">
          <Skeleton className="h-8 w-48" />
        </div>
      )}

      <ul
        role="list"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
      >
        {Array.from({ length: count }).map((_, i) => (
          <li key={i} className="flex flex-col gap-4">
            <Skeleton className="aspect-[3/4] rounded-xl w-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-16" />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default ProductGridSkeleton;
