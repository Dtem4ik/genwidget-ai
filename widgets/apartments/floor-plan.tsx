"use client";

import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

export type FloorPlanType = "studio" | "1br" | "2br" | "3br" | "penthouse";

/** Maps the LLM-provided room count to one of the 5 curated floor plan images. */
export function floorPlanByRooms(rooms: number): FloorPlanType {
  if (rooms <= 0) return "studio";
  if (rooms === 1) return "1br";
  if (rooms === 2) return "2br";
  if (rooms === 3) return "3br";
  return "penthouse";
}

/** The floor plan SVG on its own — used when there's room to show it inline. */
export function FloorPlanImage({ rooms, className }: { rooms: number; className?: string }) {
  const plan = floorPlanByRooms(rooms);
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static local SVG, next/image adds no value
    <img
      alt={`${plan} floor plan`}
      className={cn("bg-muted/30 w-full rounded-lg border p-3", className)}
      src={`/floorplans/${plan}.svg`}
    />
  );
}

/** Collapsible floor plan toggle — used in the compact card. */
export function FloorPlan({ rooms }: { rooms: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        aria-expanded={open}
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring flex items-center gap-1 rounded text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        {open ? "Hide floor plan" : "Show floor plan"}
        <ChevronDownIcon className={cn("size-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && <FloorPlanImage className="mt-2" rooms={rooms} />}
    </div>
  );
}
