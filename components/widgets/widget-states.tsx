"use client";

import { AlertCircleIcon, type LucideIcon, SearchXIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function EmptyState({
  icon: Icon = SearchXIcon,
  message,
  actionLabel,
  onAction,
}: {
  icon?: LucideIcon;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div
      className="bg-card flex flex-col items-center gap-2 rounded-xl border p-6 text-center"
      data-testid="widget-empty"
    >
      <Icon className="text-muted-foreground size-6" />
      <p className="text-muted-foreground text-sm">{message}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" variant="outline">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function ErrorState({
  message = "Something went wrong.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      className="border-destructive/50 bg-destructive/10 flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm"
      data-testid="widget-error"
    >
      <span className="flex items-center gap-2">
        <AlertCircleIcon className="size-4 shrink-0" />
        {message}
      </span>
      {onRetry && (
        <Button onClick={onRetry} size="sm" variant="outline">
          Retry
        </Button>
      )}
    </div>
  );
}
