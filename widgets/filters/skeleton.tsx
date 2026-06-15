import { WidgetCard } from "@/components/widgets/primitives";

export function FilterChipsSkeleton() {
  // Mirrors the loaded FilterChips shell (bordered card, context line, chips + Apply row).
  return (
    <WidgetCard aria-busy="true" className="gap-3" data-testid="filters-skeleton">
      <div className="bg-muted h-4 w-40 animate-pulse rounded" />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 gap-2">
          {Array.from({ length: 3 }, (_, i) => (
            <div className="bg-muted h-7 w-24 animate-pulse rounded-full" key={i} />
          ))}
        </div>
        <div className="bg-muted h-8 w-20 animate-pulse rounded-md" />
      </div>
    </WidgetCard>
  );
}
