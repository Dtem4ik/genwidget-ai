import { BuildingIcon, LayoutTemplateIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { Apartment, SearchApartmentsInput, SearchApartmentsOutput } from "./schema";

export const formatPrice = (price: number) => `$${price.toLocaleString("en-US")}`;

export function describeFilters(input: SearchApartmentsInput): string[] {
  const chips: string[] = [];
  if (input.rooms !== undefined) chips.push(`${input.rooms}-room`);
  if (input.minArea !== undefined) chips.push(`from ${input.minArea} m²`);
  if (input.maxPrice !== undefined) chips.push(`under ${formatPrice(input.maxPrice)}`);
  if (input.complex !== undefined) chips.push(input.complex);
  return chips;
}

function ApartmentCard({ apartment }: { apartment: Apartment }) {
  return (
    <article className="bg-card flex flex-col gap-3 rounded-xl border p-4">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-medium">
          {apartment.rooms}-room · {apartment.area} m²
        </h3>
        <p className="font-semibold tabular-nums">{formatPrice(apartment.price)}</p>
      </div>
      <p className="text-muted-foreground text-sm">
        {apartment.complex} · {apartment.district} · floor {apartment.floor}/{apartment.totalFloors}
      </p>
      {/* Floor plan slot — SVG renderer lands in phase 3 */}
      <div className="text-muted-foreground/70 flex aspect-[8/3] items-center justify-center gap-2 rounded-lg border border-dashed text-xs">
        <LayoutTemplateIcon className="size-4" />
        Floor plan
      </div>
      {apartment.features.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {apartment.features.map((feature) => (
            <li
              className="bg-secondary text-secondary-foreground rounded-md px-2 py-0.5 text-xs"
              key={feature}
            >
              {feature}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-auto flex gap-2">
        {/* Action buttons loop back into the chat in phase 4 */}
        <Button disabled size="sm" variant="outline">
          Details
        </Button>
        <Button disabled size="sm" variant="ghost">
          Similar
        </Button>
      </div>
    </article>
  );
}

export function ApartmentResults({
  input,
  output,
}: {
  input: SearchApartmentsInput;
  output: SearchApartmentsOutput;
}) {
  const filters = describeFilters(input);

  if (output.apartments.length === 0) {
    return (
      <div className="bg-card rounded-xl border p-6 text-center" data-testid="apartments-empty">
        <BuildingIcon className="text-muted-foreground mx-auto mb-2 size-6" />
        <p className="font-medium">No apartments match</p>
        <p className="text-muted-foreground mt-1 text-sm">
          {filters.length > 0 ? `Nothing found for ${filters.join(", ")}.` : "Nothing found."} Try
          loosening a filter.
        </p>
      </div>
    );
  }

  return (
    <section className="flex w-full flex-col gap-3" data-testid="apartments-results">
      <header className="text-muted-foreground flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
        <span className="text-foreground font-medium">
          {output.total} apartment{output.total === 1 ? "" : "s"} found
        </span>
        {filters.length > 0 && <span>· {filters.join(" · ")}</span>}
        {output.total > output.apartments.length && (
          <span>· showing {output.apartments.length} cheapest</span>
        )}
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        {output.apartments.map((apartment) => (
          <ApartmentCard apartment={apartment} key={apartment.id} />
        ))}
      </div>
    </section>
  );
}
