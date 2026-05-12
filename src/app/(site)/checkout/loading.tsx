import { SkeletonLoader } from "@/components/ui/SkeletonLoader";

export default function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-6 lg:px-12">
        <SkeletonLoader className="h-10 w-40 rounded-lg" rounded="input" />
        <SkeletonLoader className="hidden h-9 w-48 rounded-full sm:block" rounded="pill" />
      </header>
      <div className="mx-auto flex max-w-7xl flex-col-reverse gap-8 px-6 py-10 lg:flex-row lg:px-12 lg:py-16">
        <div className="mx-auto w-full max-w-xl flex-1 space-y-6 rounded-3xl border border-white/10 bg-white/[0.03] p-8 lg:mx-0">
          <SkeletonLoader className="h-2 w-full rounded-pill" rounded="pill" />
          <div className="flex gap-2">
            <SkeletonLoader className="h-8 flex-1 rounded-full" rounded="pill" />
            <SkeletonLoader className="h-8 flex-1 rounded-full" rounded="pill" />
            <SkeletonLoader className="h-8 flex-1 rounded-full" rounded="pill" />
          </div>
          <SkeletonLoader className="h-24 w-full rounded-xl" rounded="card" />
          <SkeletonLoader className="h-24 w-full rounded-xl" rounded="card" />
          <SkeletonLoader className="h-12 w-full rounded-xl" rounded="card" />
        </div>
        <div className="w-full border-l border-transparent lg:w-[45%] lg:border-white/10 lg:pl-12">
          <div className="mx-auto max-w-md space-y-4 lg:mx-0">
            <SkeletonLoader className="h-28 w-full rounded-2xl" rounded="card" />
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonLoader key={i} className="h-20 w-full rounded-2xl" rounded="card" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
