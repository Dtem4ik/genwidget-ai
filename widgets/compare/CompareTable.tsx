"use client";

import { ArrowUpRightIcon, CheckIcon } from "lucide-react";
import { Fragment } from "react";

import { DomainCard, iconForCategory } from "@/components/widgets/domain-card";
import { useWidgetActions } from "@/components/widgets/widget-actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { CompareProduct, CompareProductsInput, CompareProductsOutput } from "./schema";

const formatPrice = (price: number) => `$${price.toLocaleString("en-US")}`;

/** Union of spec labels across products, in first-seen order, so rows align. */
function specLabels(products: CompareProduct[]): string[] {
  const labels: string[] = [];
  for (const product of products) {
    for (const spec of product.specs) {
      if (!labels.includes(spec.label)) labels.push(spec.label);
    }
  }
  return labels;
}

const valueOf = (product: CompareProduct, label: string) =>
  product.specs.find((s) => s.label === label)?.value;

function ProductHeader({ product }: { product: CompareProduct }) {
  const Icon = iconForCategory(product.category);
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg p-2",
        product.recommended ? "border-primary border-2" : "border",
      )}
    >
      {product.recommended && (
        <span className="bg-primary text-primary-foreground w-fit rounded-full px-2 py-0.5 text-[10px] font-medium">
          Best pick
        </span>
      )}
      <DomainCard icon={Icon} label={product.name} size="sm" />
      <div className="flex flex-col">
        <p className="text-sm leading-tight font-medium">{product.name}</p>
        <p className="text-sm font-semibold tabular-nums">{formatPrice(product.price)}</p>
      </div>
    </div>
  );
}

const tint = (recommended?: boolean) => cn("px-2 py-1.5", recommended && "bg-primary/[0.05]");

export function CompareTable({
  output,
}: {
  input: CompareProductsInput;
  output: CompareProductsOutput;
}) {
  const { ask } = useWidgetActions();
  const { products, question } = output;
  const labels = specLabels(products);
  const columns = `minmax(76px,auto) repeat(${products.length}, minmax(130px,1fr))`;

  return (
    <section className="flex w-full flex-col gap-2" data-testid="compare-results">
      {question && <p className="text-muted-foreground text-sm">{question}</p>}
      <div className="overflow-x-auto">
        <div
          className="grid min-w-[460px] items-start gap-x-2"
          style={{ gridTemplateColumns: columns }}
        >
          {/* header row */}
          <div aria-hidden />
          {products.map((product, i) => (
            <ProductHeader key={i} product={product} />
          ))}

          {/* spec rows */}
          {labels.map((label) => (
            <Fragment key={label}>
              <div className="text-muted-foreground self-center py-1.5 text-xs">{label}</div>
              {products.map((product, i) => (
                <div
                  className={cn("self-stretch text-sm tabular-nums", tint(product.recommended))}
                  key={i}
                >
                  {valueOf(product, label) ?? "—"}
                </div>
              ))}
            </Fragment>
          ))}

          {/* pros */}
          <div className="text-muted-foreground self-start pt-3 text-xs">Pros</div>
          {products.map((product, i) => (
            <ul className={cn("flex flex-col gap-1 pt-3", tint(product.recommended))} key={i}>
              {product.pros.map((pro) => (
                <li className="flex items-start gap-1 text-xs" key={pro}>
                  <CheckIcon className="mt-0.5 size-3 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  {pro}
                </li>
              ))}
            </ul>
          ))}

          {/* cons */}
          <div className="text-muted-foreground self-start pt-2 text-xs">Cons</div>
          {products.map((product, i) => (
            <ul
              className={cn(
                "text-muted-foreground flex flex-col gap-1 pt-2",
                tint(product.recommended),
              )}
              key={i}
            >
              {product.cons.map((con) => (
                <li className="flex items-start gap-1 text-xs" key={con}>
                  <span className="mt-1.5 size-1 shrink-0 rounded-full bg-current" />
                  {con}
                </li>
              ))}
            </ul>
          ))}

          {/* actions — each button sends a follow-up into the chat (UI → AI → UI) */}
          <div aria-hidden className="pt-3" />
          {products.map((product, i) => (
            <div className={cn("flex flex-col gap-1.5 pt-3", tint(product.recommended))} key={i}>
              <Button
                aria-label={`Tell me more about ${product.name}`}
                onClick={() =>
                  ask(`Tell me more about ${product.name} — where to buy, warranty, alternatives`)
                }
                size="sm"
                variant="outline"
              >
                Tell me more
                <ArrowUpRightIcon className="size-3" />
              </Button>
              <Button
                aria-label={`Compare ${product.name} with something cheaper`}
                onClick={() =>
                  ask(
                    `Compare ${product.name} with cheaper alternatives under $${Math.round(
                      product.price * 0.7,
                    )}`,
                  )
                }
                size="sm"
                variant="ghost"
              >
                Something cheaper
                <ArrowUpRightIcon className="size-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
