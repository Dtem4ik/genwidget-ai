import type { DeepPartial } from "ai";

import type { SearchApartmentsInput } from "./schema";

export function ApartmentResultsSkeleton(_props: { input?: DeepPartial<SearchApartmentsInput> }) {
  return <div className="bg-muted h-24 w-full animate-pulse rounded-lg" />;
}
