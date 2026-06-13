import type { DeepPartial } from "ai";
import { Fragment } from "react";

import type { CompareProductsInput } from "./schema";

export function CompareTableSkeleton({ input }: { input?: DeepPartial<CompareProductsInput> }) {
  // Match the column count to what has streamed in so far (default 3).
  const cols = Math.min(Math.max(input?.products?.length ?? 3, 2), 3);
  const columns = `minmax(76px,auto) repeat(${cols}, minmax(130px,1fr))`;

  return (
    <section aria-busy="true" className="w-full overflow-x-auto" data-testid="compare-skeleton">
      <div
        className="grid min-w-[460px] items-start gap-x-2 gap-y-2"
        style={{ gridTemplateColumns: columns }}
      >
        <div aria-hidden />
        {Array.from({ length: cols }, (_, i) => (
          <div className="flex flex-col gap-2 rounded-lg border p-2" key={i}>
            <div className="bg-muted h-24 animate-pulse rounded-lg" />
            <div className="bg-muted h-4 w-3/4 animate-pulse rounded" />
            <div className="bg-muted h-4 w-1/2 animate-pulse rounded" />
          </div>
        ))}
        {Array.from({ length: 4 }, (_, r) => (
          <Fragment key={r}>
            <div className="bg-muted my-1 h-4 w-14 animate-pulse rounded" />
            {Array.from({ length: cols }, (_, c) => (
              <div className="bg-muted my-1 h-4 animate-pulse rounded" key={c} />
            ))}
          </Fragment>
        ))}
      </div>
    </section>
  );
}
