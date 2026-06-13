"use client";

import { BuildingIcon, Home } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { DomainCard } from "@/components/widgets/domain-card";
import { WidgetGrid } from "@/components/widgets/WidgetGrid";
import { EmptyState } from "@/components/widgets/widget-states";
import { useWidgetActions } from "@/components/widgets/widget-actions";
import { Button } from "@/components/ui/button";

import { FloorPlan, FloorPlanImage } from "./floor-plan";
import type { ApartmentItem, ShowApartmentsInput, ShowApartmentsOutput } from "./schema";

export const formatPrice = (price: number) => `$${price.toLocaleString("en-US")}`;

export const roomsLabel = (rooms: number) => (rooms === 0 ? "Studio" : `${rooms}-room`);

function FeatureTags({ features }: { features: string[] }) {
  if (features.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {features.map((feature) => (
        <li
          className="bg-secondary text-secondary-foreground rounded-md px-2 py-0.5 text-xs"
          key={feature}
        >
          {feature}
        </li>
      ))}
    </ul>
  );
}

function ApartmentMeta({ apartment }: { apartment: ApartmentItem }) {
  return (
    <>
      <div className="flex flex-col gap-0.5">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-[15px] font-medium">{apartment.title}</h3>
          <p className="font-semibold tabular-nums">{formatPrice(apartment.price)}</p>
        </div>
        <p className="text-muted-foreground text-[13px]">{apartment.location}</p>
      </div>
      <p className="text-muted-foreground text-[13px]">
        {roomsLabel(apartment.rooms)} · {apartment.area} m² · floor {apartment.floor}/
        {apartment.totalFloors}
      </p>
    </>
  );
}

function ApartmentActions() {
  // Action buttons loop back into the chat — wired in a later pass.
  return (
    <div className="mt-auto flex gap-2">
      <Button disabled size="sm" variant="outline">
        Details
      </Button>
      <Button disabled size="sm" variant="ghost">
        Similar
      </Button>
    </div>
  );
}

export function ApartmentCard({
  apartment,
  fullWidth = false,
}: {
  apartment: ApartmentItem;
  fullWidth?: boolean;
}) {
  // Full-width (single result): details on the left, floor plan inline on the right.
  if (fullWidth) {
    return (
      <article className="bg-card grid gap-4 rounded-xl border p-4 sm:p-5 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <ApartmentMeta apartment={apartment} />
          <FeatureTags features={apartment.features} />
          <ApartmentActions />
        </div>
        <div className="flex items-center">
          <FloorPlanImage rooms={apartment.rooms} />
        </div>
      </article>
    );
  }

  // Compact (grid of 2-3): gradient header, details, collapsible floor plan.
  return (
    <article className="bg-card flex flex-col gap-3 rounded-xl border p-4 sm:p-5">
      <DomainCard icon={Home} label={apartment.title} />
      <ApartmentMeta apartment={apartment} />
      <FloorPlan rooms={apartment.rooms} />
      <FeatureTags features={apartment.features} />
      <ApartmentActions />
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
      <WidgetGrid count={count}>
        {apartments.map((apartment, i) => {
          const key = `${apartment.title}-${i}`;
          const card = <ApartmentCard apartment={apartment} fullWidth={count === 1} />;
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
      </WidgetGrid>
    </section>
  );
}
