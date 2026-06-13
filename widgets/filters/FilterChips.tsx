"use client";

import { SlidersHorizontalIcon } from "lucide-react";
import { useState } from "react";

import { useWidgetActions } from "@/components/widgets/widget-actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { Filter, SetFiltersInput, SetFiltersOutput } from "./schema";

export function FilterChips({ output }: { input: SetFiltersInput; output: SetFiltersOutput }) {
  const { ask } = useWidgetActions();
  // Local state seeded from the model-provided filters — AI sets it, user adjusts it.
  const [filters, setFilters] = useState<Filter[]>(output.filters);

  const toggle = (key: string) =>
    setFilters((prev) => prev.map((f) => (f.key === key ? { ...f, active: !f.active } : f)));

  const apply = () => {
    const active = filters.filter((f) => f.active);
    if (active.length === 0) return;
    ask(`Search with filters: ${active.map((f) => f.label).join(", ")}`);
  };

  const activeCount = filters.filter((f) => f.active).length;

  return (
    <section
      className="bg-card flex w-full flex-col gap-3 rounded-xl border p-4 sm:p-5"
      data-testid="filters-results"
    >
      <p className="text-muted-foreground flex items-center gap-1.5 text-[13px]">
        <SlidersHorizontalIcon className="size-4" />
        {output.context}
      </p>
      {/* Chips fill the row; Apply sits on the right (stacks on mobile). */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 gap-2 overflow-x-auto pb-1">
          {filters.map((f) => (
            <button
              aria-pressed={f.active}
              className={cn(
                "focus-visible:ring-ring shrink-0 rounded-full border px-3 py-1 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none",
                f.active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "text-muted-foreground hover:bg-muted",
              )}
              key={f.key}
              onClick={() => toggle(f.key)}
              type="button"
            >
              {f.label}
            </button>
          ))}
        </div>
        <Button className="w-fit shrink-0" disabled={activeCount === 0} onClick={apply} size="sm">
          Apply {activeCount > 0 ? `(${activeCount})` : ""}
        </Button>
      </div>
    </section>
  );
}
