import { FeaturedProductRowSkeleton } from "@/components/ui/SkeletonLoader";

export default function SiteLoading() {
  return (
    <div className="min-h-[50vh] bg-background">
      <FeaturedProductRowSkeleton />
    </div>
  );
}
