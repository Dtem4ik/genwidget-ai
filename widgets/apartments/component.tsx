"use client";

import { BuildingIcon, Home } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { DomainCard } from "@/components/widgets/domain-card";
import { EmptyState } from "@/components/widgets/widget-states";
import { useWidgetActions } from "@/components/widgets/widget-actions";
import { Button } from "@/components/ui/button";

import { FloorPlan } from "./floor-plan";
import type { ApartmentItem, ShowApartmentsInput, ShowApartmentsOutput } from "./schema";

export const formatPrice = (price: number) => `$${price.toLocaleString("en-US")}`;

export const roomsLabel = (rooms: number) => (rooms === 0 ? "Studio" : `${rooms}-room`);

export function ApartmentCard({ apartment }: { apartment: ApartmentItem }) {
  return (
    <article className="bg-card flex flex-col gap-3 rounded-xl border p-4">
      <DomainCard icon={Home} label={apartment.title} />
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
      <FloorPlan rooms={apartment.rooms} />
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
  const { ask } = useWidgetActions();
  const { apartments } = output;
  const count = apartments.length;
  const reduceMotion = useReducedMotion();

  if (count === 0) {
    return (
      <EmptyState
        actionLabel="Broaden the search"
        icon={BuildingIcon}
        message="No matching apartments. Try a wider budget or a different area."
        onAction={() => ask("Show apartments with a wider budget and any location")}
      />
    );
  }

  return (
    <section className="flex w-full flex-col gap-3" data-testid="apartments-results">
      <header className="text-muted-foreground text-sm">
        <span className="text-foreground font-medium">
          {count} apartment{count === 1 ? "" : "s"}
        </span>
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        {apartments.map((apartment, i) => {
          const key = `${apartment.title}-${i}`;
          const card = <ApartmentCard apartment={apartment} />;
          // Staggered entrance as cards mount (output-available). Skipped entirely
          // when the user prefers reduced motion.
          return reduceMotion ? (
            <div key={key}>{card}</div>
          ) : (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 16 }}
              key={key}
              transition={{ duration: 0.3, delay: i * 0.08, ease: "easeOut" }}
            >
              {card}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
