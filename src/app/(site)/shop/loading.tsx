import { ProductGridSkeleton } from "@/components/product";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Matches the new shop page rhythm: hero band → sticky toolbar rail
 * → full grid. Keeping the skeleton close to the real layout
 * prevents layout shift when the data lands.
 */
export default function ShopLoading() {
  return (
    <>
      {/* Hero band */}
      <section className="container-shop pt-10 pb-8 md:pt-14 md:pb-12">
        <div className="flex items-center justify-between gap-4 mb-6 md:mb-8">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 lg:gap-10">
          <div className="max-w-2xl flex flex-col gap-4">
            <Skeleton className="h-12 md:h-16 w-4/5" />
            <Skeleton className="h-12 md:h-16 w-3/5" />
            <Skeleton className="h-4 w-full max-w-md mt-2" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-28 rounded-full" />
            <Skeleton className="h-8 w-28 rounded-full" />
            <Skeleton className="h-8 w-40 rounded-full" />
          </div>
        </div>
      </section>

      {/* Toolbar rail */}
      <section className="border-y border-brand-200/60 bg-brand-50/85">
        <div className="container-shop flex items-center gap-4 py-3">
          <div className="flex-1 flex gap-2 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-full shrink-0" />
            ))}
          </div>
          <Skeleton className="h-10 w-44 rounded-full shrink-0" />
        </div>
      </section>

      {/* Grid */}
      <section className="container-shop pt-8 pb-16 md:pt-12 md:pb-24">
        <div className="flex items-baseline justify-between gap-4 mb-6 md:mb-8">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
        <ProductGridSkeleton count={12} />
      </section>
    </>
  );
}
