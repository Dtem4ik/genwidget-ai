import { Box, Car, Home, Laptop, type LucideIcon, Smartphone } from "lucide-react";

import { cn } from "@/lib/utils";

// Substring → icon. Order doesn't matter; first match wins.
const CATEGORY_ICONS: Array<[string, LucideIcon]> = [
  ["apartment", Home],
  ["real estate", Home],
  ["home", Home],
  ["house", Home],
  ["phone", Smartphone],
  ["mobile", Smartphone],
  ["laptop", Laptop],
  ["computer", Laptop],
  ["car", Car],
  ["vehicle", Car],
];

/** Picks a domain-appropriate Lucide icon from a free-text category. */
export function iconForCategory(category?: string): LucideIcon {
  if (!category) return Box;
  const key = category.toLowerCase();
  return CATEGORY_ICONS.find(([word]) => key.includes(word))?.[1] ?? Box;
}

const SIZE: Record<"sm" | "md" | "lg", string> = {
  sm: "h-24",
  md: "h-40",
  lg: "h-[120px]",
};

/**
 * Stands in for a product/listing photo. We deliberately do NOT use random stock
 * photos (they mislead — see ADR-004): a theme-aware gradient with the domain icon
 * is honest and reads cleanly in both themes. Uses Tailwind `/opacity` on the
 * `primary` token (our tokens are oklch, so `hsl(var(--primary)/…)` would not work).
 */
export function DomainCard({
  icon: Icon,
  label,
  size = "md",
  className,
}: {
  icon: LucideIcon;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <div
      aria-label={label}
      className={cn(
        "from-primary/[0.06] to-primary/15 flex w-full items-center justify-center rounded-lg bg-gradient-to-br",
        SIZE[size],
        className,
      )}
      role="img"
    >
      {/* 36px on compact cards, 48px on full-width */}
      <Icon
        className={cn("text-primary/50", size === "sm" ? "size-9" : "size-12")}
        strokeWidth={1.5}
      />
    </div>
  );
}
