import { ProductGridSkeleton } from "@/components/product/ProductGridSkeleton";

export default function WishlistLoading() {
  return (
    <div className="min-h-screen bg-brand-50 pb-20">
      <div className="mx-auto max-w-[1200px] px-4 py-12 md:px-8 md:py-20">
        <div className="mb-12 h-10 w-64 animate-pulse rounded-lg bg-brand-200/50" />
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  );
}
