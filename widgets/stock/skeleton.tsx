export function StockCardSkeleton() {
  return (
    <section
      aria-busy="true"
      className="bg-card flex w-full max-w-sm flex-col gap-3 rounded-xl border p-4"
      data-testid="stock-skeleton"
    >
      <div className="flex items-center gap-3">
        <div className="bg-muted size-12 animate-pulse rounded-lg" />
        <div className="flex flex-col gap-1">
          <div className="bg-muted h-4 w-24 animate-pulse rounded" />
          <div className="bg-muted h-3 w-12 animate-pulse rounded" />
        </div>
      </div>
      <div className="bg-muted h-7 w-32 animate-pulse rounded" />
      <div className="bg-muted h-[50px] w-full animate-pulse rounded" />
    </section>
  );
}
