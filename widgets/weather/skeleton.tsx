export function WeatherCardSkeleton() {
  return (
    <section
      aria-busy="true"
      className="bg-card flex w-full max-w-sm flex-col gap-3 rounded-xl border p-4"
      data-testid="weather-skeleton"
    >
      <div className="bg-muted h-24 w-full animate-pulse rounded-lg" />
      <div className="bg-muted h-4 w-1/3 animate-pulse rounded" />
      <div className="bg-muted h-8 w-1/2 animate-pulse rounded" />
      <div className="flex gap-4">
        <div className="bg-muted h-4 w-16 animate-pulse rounded" />
        <div className="bg-muted h-4 w-16 animate-pulse rounded" />
      </div>
    </section>
  );
}
