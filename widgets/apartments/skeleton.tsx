import type { DeepPartial } from "ai";

import { WidgetGrid } from "@/components/widgets/WidgetGrid";

import type { ShowApartmentsInput } from "./schema";

function CardSkeleton() {
  // Mirrors the real ApartmentCard layout slot-for-slot so nothing shifts or resizes
  // when the photo loads and the data swaps in.
  return (
    <div className="bg-card flex flex-col gap-3 rounded-xl border p-4 sm:p-5">
      {/* Photo — same h-40 as the real photo */}
      <div className="bg-muted h-40 w-full animate-pulse rounded-lg" />
      <div className="flex flex-col gap-0.5">
        {/* title + price */}
        <div className="flex items-baseline justify-between gap-2">
          <div className="bg-muted h-5 w-40 animate-pulse rounded" />
          <div className="bg-muted h-5 w-20 animate-pulse rounded" />
        </div>
        {/* location */}
        <div className="bg-muted h-4 w-1/2 animate-pulse rounded" />
      </div>
      {/* rooms · area · floor */}
      <div className="bg-muted h-4 w-2/3 animate-pulse rounded" />
      {/* "Show floor plan" toggle */}
      <div className="bg-muted h-5 w-32 animate-pulse rounded" />
      {/* feature chips */}
      <div className="flex gap-1.5">
        <div className="bg-muted h-5 w-16 animate-pulse rounded-md" />
        <div className="bg-muted h-5 w-14 animate-pulse rounded-md" />
      </div>
      {/* action buttons */}
      <div className="mt-auto flex gap-2">
        <div className="bg-muted h-8 w-20 animate-pulse rounded-md" />
        <div className="bg-muted h-8 w-20 animate-pulse rounded-md" />
      </div>
    </div>
  );
}

export function ApartmentResultsSkeleton({ input }: { input?: DeepPartial<ShowApartmentsInput> }) {
  // While the model streams its arguments, the apartments array fills in. Match the
  // skeleton card count to what has arrived so far (default 2) to limit layout shift.
  const streamedCount = input?.apartments?.length ?? 0;
  const cardCount = Math.min(Math.max(streamedCount, 2), 6);

  return (
    <section
      aria-busy="true"
      className="flex w-full flex-col gap-3"
      data-testid="apartments-skeleton"
    >
      <header className="text-muted-foreground text-sm">Finding apartments…</header>
      {/* Use the same WidgetGrid as the loaded results so the column count matches
          (3 skeletons → 3 columns on desktop, not 2 + 1). */}
      <WidgetGrid count={cardCount}>
        {Array.from({ length: cardCount }, (_, i) => (
          <CardSkeleton key={i} />
        ))}
      </WidgetGrid>
    </section>
  );
}
