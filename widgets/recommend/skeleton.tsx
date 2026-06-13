export function ProductRecommendationSkeleton() {
  return (
    <section
      aria-busy="true"
      className="flex w-full flex-col gap-4"
      data-testid="recommend-skeleton"
    >
      <div className="bg-card flex flex-col gap-3 rounded-xl border p-4">
        <div className="bg-muted h-[120px] w-full animate-pulse rounded-lg" />
        <div className="bg-muted h-6 w-1/2 animate-pulse rounded" />
        <div className="bg-muted h-4 w-full animate-pulse rounded" />
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }, (_, i) => (
            <div className="bg-muted h-8 animate-pulse rounded" key={i} />
          ))}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="bg-muted h-16 animate-pulse rounded-lg" />
        <div className="bg-muted h-16 animate-pulse rounded-lg" />
      </div>
    </section>
  );
}
