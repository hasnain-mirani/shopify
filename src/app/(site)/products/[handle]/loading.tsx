import { Skeleton } from "@/components/ui/Skeleton";

export default function ProductLoading() {
  return (
    <div className="container-shop pt-10 pb-20">
      <Skeleton className="h-3 w-48 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        <div className="flex flex-col gap-4">
          <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-7 w-32" />
          <div className="flex flex-col gap-3 pt-4">
            <Skeleton className="h-4 w-16" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-14 rounded-full" />
              <Skeleton className="h-10 w-14 rounded-full" />
              <Skeleton className="h-10 w-14 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-12 w-full rounded-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
}
