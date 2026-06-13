"use client";

import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";

import { ErrorState } from "@/components/widgets/widget-states";
import { useWidgetActions } from "@/components/widgets/widget-actions";
import { cn } from "@/lib/utils";

import type { GetStockOrCryptoInput, GetStockOrCryptoOutput } from "./schema";

const formatPrice = (n: number) =>
  n >= 1
    ? `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`
    : `$${n.toLocaleString("en-US", { maximumFractionDigits: 6 })}`;

/** Normalizes the series into a 200×50 SVG polyline. */
export function Sparkline({ values, up }: { values: number[]; up: boolean }) {
  const w = 200;
  const h = 50;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values
    .map((v, i) => {
      const x = values.length === 1 ? 0 : (i / (values.length - 1)) * w;
      const y = h - ((v - min) / span) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg
      className="w-full"
      height={h}
      preserveAspectRatio="none"
      role="img"
      viewBox={`0 0 ${w} ${h}`}
    >
      <polyline
        className={up ? "stroke-emerald-500" : "stroke-red-500"}
        fill="none"
        points={points}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </svg>
  );
}

export function StockCard({
  input,
  output,
}: {
  input: GetStockOrCryptoInput;
  output: GetStockOrCryptoOutput;
}) {
  const { ask } = useWidgetActions();

  if ("error" in output) {
    return <ErrorState message={output.error} onRetry={() => ask(`${input.name} price`)} />;
  }

  const up = output.change24h >= 0;
  const TrendIcon = up ? TrendingUpIcon : TrendingDownIcon;

  const changePill = (
    <span
      className={cn(
        "w-fit rounded-full px-2 py-0.5 text-xs font-medium tabular-nums",
        up
          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
          : "bg-red-500/15 text-red-600 dark:text-red-400",
      )}
    >
      {up ? "+" : ""}
      {output.changePercent.toFixed(2)}% 24h
    </span>
  );

  return (
    <section
      className="bg-card flex w-full flex-col gap-4 rounded-xl border p-4 sm:p-5"
      data-testid="stock-results"
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-lg",
            up ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500",
          )}
        >
          <TrendIcon className="size-6" />
        </div>
        <div>
          <p className="text-[15px] font-medium">{output.name}</p>
          <p className="text-muted-foreground text-xs uppercase">{output.symbol}</p>
        </div>
      </div>

      {/* Price on the left, sparkline filling the rest. Stacks on mobile. */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
        <div className="flex flex-col gap-1 sm:w-2/5">
          <span className="text-2xl font-semibold tabular-nums">{formatPrice(output.price)}</span>
          {changePill}
        </div>
        <div className="flex-1">
          <Sparkline up={up} values={output.sparkline} />
        </div>
      </div>

      <p className="text-muted-foreground/70 text-[10px]">
        Source: {output.source === "crypto" ? "CoinGecko" : "Yahoo Finance"} · 7-day trend
      </p>
    </section>
  );
}
