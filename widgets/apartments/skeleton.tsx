import type { DeepPartial } from "ai";

import type { ShowApartmentsInput } from "./schema";

function CardSkeleton() {
  return (
    <div className="bg-card flex flex-col gap-3 rounded-xl border p-4">
      {/* Photo slot — same h-40 as the real photo, so cards don't resize on load */}
      <div className="bg-muted h-40 w-full animate-pulse rounded-lg" />
      <div className="flex items-baseline justify-between gap-2">
        <div className="bg-muted h-5 w-40 animate-pulse rounded" />
        <div className="bg-muted h-5 w-20 animate-pulse rounded" />
      </div>
      <div className="bg-muted h-4 w-1/2 animate-pulse rounded" />
      <div className="bg-muted/60 aspect-[8/3] animate-pulse rounded-lg" />
      <div className="flex gap-1.5">
        <div className="bg-muted h-5 w-16 animate-pulse rounded-md" />
        <div className="bg-muted h-5 w-14 animate-pulse rounded-md" />
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
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: cardCount }, (_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}
