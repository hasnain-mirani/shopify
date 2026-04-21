import { ProductGridSkeleton } from "@/components/product";
import { Skeleton } from "@/components/ui/Skeleton";

export default function CollectionLoading() {
  return (
    <>
      <Skeleton className="h-[45vh] min-h-[280px] max-h-[460px] w-full rounded-none" />
      <div className="container-shop py-10 md:py-14">
        <Skeleton className="h-3 w-24 mb-8" />
        <ProductGridSkeleton count={12} />
      </div>
    </>
  );
}
