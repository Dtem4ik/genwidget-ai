export function WeatherCardSkeleton() {
  // Mirrors the loaded WeatherCard shell (full width, gradient band, centered block).
  return (
    <section
      aria-busy="true"
      className="bg-card flex w-full flex-col gap-4 rounded-xl border p-4 sm:p-5"
      data-testid="weather-skeleton"
    >
      {/* Same h-40 band as the DomainCard header */}
      <div className="bg-muted h-40 w-full animate-pulse rounded-lg" />
      <div className="flex flex-col items-center gap-2">
        <div className="bg-muted h-4 w-24 animate-pulse rounded" />
        <div className="bg-muted h-10 w-28 animate-pulse rounded" />
        <div className="bg-muted h-4 w-20 animate-pulse rounded" />
      </div>
      <div className="flex justify-center gap-8">
        <div className="bg-muted h-4 w-16 animate-pulse rounded" />
        <div className="bg-muted h-4 w-16 animate-pulse rounded" />
      </div>
    </section>
  );
}
