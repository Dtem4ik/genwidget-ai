import { LayoutTemplateIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import { ListingPhoto } from "./listing-photo";
import type { ApartmentItem, ShowApartmentsInput, ShowApartmentsOutput } from "./schema";

export const formatPrice = (price: number) => `$${price.toLocaleString("en-US")}`;

export const roomsLabel = (rooms: number) => (rooms === 0 ? "Studio" : `${rooms}-room`);

export function ApartmentCard({
  apartment,
  index = 0,
}: {
  apartment: ApartmentItem;
  index?: number;
}) {
  return (
    <article className="bg-card flex flex-col gap-3 rounded-xl border p-4">
      <ListingPhoto alt={apartment.title} lock={index + 1} query={apartment.imageQuery} />
      <div className="flex flex-col gap-0.5">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-medium">{apartment.title}</h3>
          <p className="font-semibold tabular-nums">{formatPrice(apartment.price)}</p>
        </div>
        <p className="text-muted-foreground text-sm">{apartment.location}</p>
      </div>
      <p className="text-muted-foreground text-sm">
        {roomsLabel(apartment.rooms)} · {apartment.area} m² · floor {apartment.floor}/
        {apartment.totalFloors}
      </p>
      {/* Floor plan slot — image renderer lands in C3 of this phase */}
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
  output,
}: {
  input: ShowApartmentsInput;
  output: ShowApartmentsOutput;
}) {
  const { apartments } = output;
  const count = apartments.length;

  return (
    <section className="flex w-full flex-col gap-3" data-testid="apartments-results">
      <header className="text-muted-foreground text-sm">
        <span className="text-foreground font-medium">
          {count} apartment{count === 1 ? "" : "s"}
        </span>
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        {apartments.map((apartment, i) => (
          <ApartmentCard apartment={apartment} index={i} key={`${apartment.title}-${i}`} />
        ))}
      </div>
    </section>
  );
}
