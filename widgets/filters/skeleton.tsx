export function FilterChipsSkeleton() {
  return (
    <section aria-busy="true" className="flex w-full flex-col gap-2" data-testid="filters-skeleton">
      <div className="bg-muted h-4 w-40 animate-pulse rounded" />
      <div className="flex gap-2">
        {Array.from({ length: 3 }, (_, i) => (
          <div className="bg-muted h-7 w-24 animate-pulse rounded-full" key={i} />
        ))}
      </div>
    </section>
  );
}
