import { ProductGridSkeleton } from "@/components/ui/SkeletonLoader";

export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card py-16 md:py-24">
        <div className="container-shop">
          <div className="skeleton-shimmer mb-6 h-4 max-w-xs rounded-input" />
          <div className="skeleton-shimmer mb-4 h-12 max-w-lg rounded-input md:h-16" />
          <div className="skeleton-shimmer h-4 max-w-md rounded-input" />
        </div>
      </div>
      <div className="container-shop py-12">
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  );
}
