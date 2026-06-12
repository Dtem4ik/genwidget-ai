import type { DeepPartial } from "ai";

import type { SearchApartmentsInput } from "./schema";
import { describeFilters } from "./component";

function CardSkeleton() {
  return (
    <div className="bg-card flex flex-col gap-3 rounded-xl border p-4">
      <div className="flex items-baseline justify-between gap-2">
        <div className="bg-muted h-5 w-28 animate-pulse rounded" />
        <div className="bg-muted h-5 w-20 animate-pulse rounded" />
      </div>
      <div className="bg-muted h-4 w-3/4 animate-pulse rounded" />
      <div className="bg-muted/60 aspect-[8/3] animate-pulse rounded-lg" />
      <div className="flex gap-1.5">
        <div className="bg-muted h-5 w-16 animate-pulse rounded-md" />
        <div className="bg-muted h-5 w-14 animate-pulse rounded-md" />
      </div>
    </div>
  );
}

export function ApartmentResultsSkeleton({
  input,
}: {
  input?: DeepPartial<SearchApartmentsInput>;
}) {
  // Filters appear one by one as the model streams partial tool arguments.
  const filters = input ? describeFilters(input as SearchApartmentsInput) : [];

  return (
    <section
      aria-busy="true"
      className="flex w-full flex-col gap-3"
      data-testid="apartments-skeleton"
    >
      <header className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
        <span>Searching apartments…</span>
        {filters.map((filter) => (
          <span
            className="bg-secondary text-secondary-foreground rounded-md px-2 py-0.5 text-xs"
            key={filter}
          >
            {filter}
          </span>
        ))}
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </section>
  );
}
