import { WidgetCard } from "@/components/widgets/primitives";

export function StockCardSkeleton() {
  // Mirrors the loaded StockCard shell (full width, header row, price + sparkline row).
  return (
    <WidgetCard aria-busy="true" className="gap-4" data-testid="stock-skeleton">
      <div className="flex items-center gap-3">
        <div className="bg-muted size-12 animate-pulse rounded-lg" />
        <div className="flex flex-col gap-1">
          <div className="bg-muted h-4 w-24 animate-pulse rounded" />
          <div className="bg-muted h-3 w-12 animate-pulse rounded" />
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
        <div className="flex flex-col gap-2 sm:w-2/5">
          <div className="bg-muted h-7 w-32 animate-pulse rounded" />
          <div className="bg-muted h-5 w-24 animate-pulse rounded-full" />
        </div>
        <div className="bg-muted h-[50px] flex-1 animate-pulse rounded" />
      </div>
    </WidgetCard>
  );
}
