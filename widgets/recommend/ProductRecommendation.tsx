"use client";

import { ArrowUpRightIcon } from "lucide-react";

import { DomainCard, iconForCategory } from "@/components/widgets/domain-card";
import { useWidgetActions } from "@/components/widgets/widget-actions";
import { Button } from "@/components/ui/button";

import type { RecommendProductInput, RecommendProductOutput } from "./schema";

const formatPrice = (price: number) => `$${price.toLocaleString("en-US")}`;

export function ProductRecommendation({
  output,
}: {
  input: RecommendProductInput;
  output: RecommendProductOutput;
}) {
  const { ask } = useWidgetActions();
  const { product, userNeed } = output;
  const Icon = iconForCategory(product.category);

  return (
    <section className="flex w-full flex-col gap-4" data-testid="recommend-results">
      {/* Hero */}
      <div className="bg-card flex flex-col gap-3 rounded-xl border p-4">
        <DomainCard icon={Icon} label={product.name} size="lg" />
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-muted-foreground text-xs">Best for: {userNeed}</p>
            <h3 className="text-lg font-semibold">{product.name}</h3>
          </div>
          <span className="bg-primary text-primary-foreground shrink-0 rounded-full px-2.5 py-1 text-sm font-semibold tabular-nums">
            {formatPrice(product.price)}
          </span>
        </div>
        <p className="text-sm">{product.reason}</p>

        {product.specs.length > 0 && (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
            {product.specs.map((spec) => (
              <div className="flex flex-col" key={spec.label}>
                <dt className="text-muted-foreground text-xs">{spec.label}</dt>
                <dd className="text-sm">{spec.value}</dd>
              </div>
            ))}
          </dl>
        )}
        <Button
          aria-label={`Why ${product.name} is the best pick`}
          className="w-fit"
          onClick={() => ask(`Explain why ${product.name} is the best pick for my need`)}
          size="sm"
          variant="outline"
        >
          Why this pick?
          <ArrowUpRightIcon className="size-3" />
        </Button>
      </div>

      {/* Alternatives */}
      {product.alternatives.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground text-sm">Cheaper alternatives</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {product.alternatives.map((alt) => (
              <div className="bg-card flex flex-col gap-2 rounded-lg border p-3" key={alt.name}>
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-medium">{alt.name}</p>
                  <p className="text-sm font-semibold tabular-nums">{formatPrice(alt.price)}</p>
                </div>
                <p className="text-muted-foreground text-xs">{alt.tradeoff}</p>
                <Button
                  aria-label={`Tell me more about ${alt.name}`}
                  className="mt-auto w-fit"
                  onClick={() => ask(`Tell me more about ${alt.name}`)}
                  size="sm"
                  variant="ghost"
                >
                  Tell me more
                  <ArrowUpRightIcon className="size-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
