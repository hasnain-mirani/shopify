import { ProductGridSkeleton } from "@/components/product/ProductGridSkeleton";

export default function CompareLoading() {
  return (
    <div className="container-shop min-h-[50vh] py-12">
      <div className="mb-8 h-10 w-48 animate-pulse rounded-lg bg-muted" />
      <ProductGridSkeleton count={4} />
    </div>
  );
}
