import { cn } from "@/lib/utils";

export function SkeletonLoader({
  className,
  rounded = "card",
}: {
  className?: string;
  /** `card` 16px, `pill` full, `input` 10px */
  rounded?: "card" | "pill" | "input" | "none";
}) {
  const r =
    rounded === "pill"
      ? "rounded-pill"
      : rounded === "input"
        ? "rounded-input"
        : rounded === "card"
          ? "rounded-card"
          : "rounded-none";

  return (
    <div
      className={cn("skeleton-shimmer", r, className)}
      aria-hidden
    />
  );
}

/** Shop grid placeholder — matches ProductGrid cell aspect. */
export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-card border border-border bg-card p-3 shadow-card",
        className,
      )}
    >
      <SkeletonLoader className="aspect-square w-full rounded-card" rounded="card" />
      <SkeletonLoader className="h-4 w-3/4" rounded="input" />
      <SkeletonLoader className="h-4 w-1/2" rounded="input" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i}>
          <ProductCardSkeleton />
        </li>
      ))}
    </ul>
  );
}

/** Featured row placeholder — matches ProductRow card grid (glass card + pill header). */
export function FeaturedProductRowSkeleton({ cards = 10 }: { cards?: number }) {
  return (
    <div className="w-full border-b border-white/10 py-8">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-12 pb-4 sm:px-14">
        <div className="flex flex-col gap-2">
          <SkeletonLoader className="h-3 w-36 rounded-pill" rounded="pill" />
          <SkeletonLoader className="h-6 w-56 rounded-input" rounded="input" />
          <SkeletonLoader className="h-3 w-48 rounded-input" rounded="input" />
        </div>
        <SkeletonLoader className="h-9 w-24 shrink-0 rounded-pill" rounded="pill" />
      </div>
      <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-2.5 px-11 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: cards }).map((_, i) => (
          <div
            key={i}
            className="flex min-h-[280px] flex-col overflow-hidden rounded-[20px] border border-white/[0.07] bg-white/[0.03]"
          >
            <SkeletonLoader className="aspect-square w-full rounded-none bg-[rgba(245,166,35,0.06)]" rounded="none" />
            <div className="flex flex-1 flex-col gap-2 p-2.5">
              <SkeletonLoader className="h-3 w-full rounded-input" rounded="input" />
              <SkeletonLoader className="h-3 w-4/5 rounded-input" rounded="input" />
              <SkeletonLoader className="mt-auto h-4 w-2/3 rounded-input" rounded="input" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
