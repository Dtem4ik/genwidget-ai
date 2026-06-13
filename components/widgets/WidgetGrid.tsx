import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

// Static class strings (not interpolated) so Tailwind doesn't purge them.
// Always 1 column on mobile; up to 2 on tablet, up to 3 on desktop.
function columnsClass(count: number): string {
  if (count <= 1) return "grid-cols-1";
  if (count === 2) return "grid-cols-1 sm:grid-cols-2";
  return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
}

/**
 * Adaptive layout shared by every list-rendering widget: column count follows the
 * number of items (1 → full width, 2 → two columns, 3+ → three), collapsing to a
 * single column on mobile. Widgets pass their own item count; they don't manage
 * grid positioning themselves.
 */
export function WidgetGrid({ count, children }: { count: number; children: ReactNode }) {
  return <div className={cn("grid gap-3", columnsClass(count))}>{children}</div>;
}
