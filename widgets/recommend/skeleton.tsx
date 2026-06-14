export function ProductRecommendationSkeleton() {
  // Mirrors the loaded hero shell (gradient left, headline right, specs grid, alternatives).
  return (
    <section
      aria-busy="true"
      className="flex w-full flex-col gap-4"
      data-testid="recommend-skeleton"
    >
      <div className="bg-card flex flex-col gap-4 rounded-xl border p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
          <div className="bg-muted h-32 animate-pulse rounded-lg sm:w-40 sm:shrink-0" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="bg-muted h-4 w-1/3 animate-pulse rounded" />
            <div className="bg-muted h-6 w-2/3 animate-pulse rounded" />
            <div className="bg-muted h-4 w-full animate-pulse rounded" />
            <div className="bg-muted mt-auto h-8 w-28 animate-pulse rounded-md" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 border-t pt-3 sm:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div className="bg-muted h-8 animate-pulse rounded" key={i} />
          ))}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="bg-muted h-20 animate-pulse rounded-lg" />
        <div className="bg-muted h-20 animate-pulse rounded-lg" />
      </div>
    </section>
  );
}
