import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/**
 * The outer shell shared by self-contained card widgets (weather, stock, filters).
 * Centralizing the shell keeps the skeleton↔card parity classes
 * (`w-full p-4 sm:p-5 rounded-xl border bg-card`) in one place, so a loaded card and
 * its skeleton can never drift apart. Callers add their own `gap-*` and `data-testid`.
 */
export function WidgetCard({ className, ...props }: ComponentProps<"section">) {
  return (
    <section
      className={cn("bg-card flex w-full flex-col rounded-xl border p-4 sm:p-5", className)}
      {...props}
    />
  );
}

export interface Spec {
  label: string;
  value: string;
}

/**
 * Renders a `{ label, value }[]` spec list as a definition list. Spec maps are always
 * arrays of `{ label, value }` (not `z.record`) because Gemini function-calling rejects
 * JSON-schema `additionalProperties`. Returns null when empty so callers can drop the
 * surrounding conditional.
 */
export function SpecList({ specs, className }: { specs: Spec[]; className?: string }) {
  if (specs.length === 0) return null;
  return (
    <dl className={cn("grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3", className)}>
      {specs.map((spec) => (
        <div className="flex flex-col" key={spec.label}>
          <dt className="text-muted-foreground text-xs">{spec.label}</dt>
          <dd className="text-[13px]">{spec.value}</dd>
        </div>
      ))}
    </dl>
  );
}
