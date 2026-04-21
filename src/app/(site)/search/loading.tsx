import { ProductGridSkeleton } from "@/components/product";
import { Skeleton } from "@/components/ui/Skeleton";

export default function SearchLoading() {
  return (
    <div className="container-shop py-10 md:py-14">
      <Skeleton className="h-3 w-20 mb-3" />
      <Skeleton className="h-9 w-72 mb-6" />
      <Skeleton className="h-12 w-full max-w-2xl rounded-full mb-10" />
      <ProductGridSkeleton count={8} />
    </div>
  );
}
