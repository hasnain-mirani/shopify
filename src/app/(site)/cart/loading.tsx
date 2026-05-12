export default function CartLoading() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-8 md:py-14">
        <div className="mb-10 h-10 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
          <div className="space-y-0 divide-y divide-border rounded-3xl border border-border bg-card p-4 md:p-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4 py-5 first:pt-2">
                <div className="h-[60px] w-[60px] shrink-0 animate-pulse rounded-lg bg-muted" />
                <div className="min-w-0 flex-1 space-y-2 pt-1">
                  <div className="h-4 w-3/4 max-w-xs animate-pulse rounded bg-muted" />
                  <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                  <div className="mt-4 flex justify-between">
                    <div className="h-9 w-28 animate-pulse rounded-full bg-muted" />
                    <div className="h-5 w-16 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="h-72 animate-pulse rounded-3xl bg-muted lg:sticky lg:top-24" />
        </div>
      </div>
    </div>
  );
}
