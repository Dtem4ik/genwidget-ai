import type { DeepPartial, ToolUIPart } from "ai";
import { getStaticToolName } from "ai";
import type { ComponentType } from "react";

import { ErrorState } from "@/components/widgets/widget-states";
import type { ChatTools } from "@/lib/ai/tools";
import { ApartmentResults } from "@/widgets/apartments/component";
import { ApartmentResultsSkeleton } from "@/widgets/apartments/skeleton";
import { CompareTable } from "@/widgets/compare/CompareTable";
import { CompareTableSkeleton } from "@/widgets/compare/skeleton";
import { ProductRecommendation } from "@/widgets/recommend/ProductRecommendation";
import { ProductRecommendationSkeleton } from "@/widgets/recommend/skeleton";
import { FilterChips } from "@/widgets/filters/FilterChips";
import { FilterChipsSkeleton } from "@/widgets/filters/skeleton";
import { StockCard } from "@/widgets/stock/StockCard";
import { StockCardSkeleton } from "@/widgets/stock/skeleton";
import { WeatherCard } from "@/widgets/weather/WeatherCard";
import { WeatherCardSkeleton } from "@/widgets/weather/skeleton";

/**
 * A widget pack binds one tool to its UI:
 * - Skeleton renders while tool input is still streaming (partial args)
 * - Component renders the tool output once it is available
 *
 * Adding a new widget = one folder under widgets/ + one entry in `registry`.
 * See docs/adding-a-widget.md.
 */
export interface WidgetPack<Input, Output> {
  Component: ComponentType<{ input: Input; output: Output }>;
  Skeleton: ComponentType<{ input?: DeepPartial<Input> }>;
}

type Registry = {
  [Name in keyof ChatTools]: WidgetPack<ChatTools[Name]["input"], ChatTools[Name]["output"]>;
};

const registry: Registry = {
  showApartments: {
    Component: ApartmentResults,
    Skeleton: ApartmentResultsSkeleton,
  },
  compareProducts: {
    Component: CompareTable,
    Skeleton: CompareTableSkeleton,
  },
  recommendProduct: {
    Component: ProductRecommendation,
    Skeleton: ProductRecommendationSkeleton,
  },
  getWeather: {
    Component: WeatherCard,
    Skeleton: WeatherCardSkeleton,
  },
  getStockOrCrypto: {
    Component: StockCard,
    Skeleton: StockCardSkeleton,
  },
  setFilters: {
    Component: FilterChips,
    Skeleton: FilterChipsSkeleton,
  },
};

export type ChatToolPart = ToolUIPart<ChatTools>;

/** Renders the right widget for a tool part based on its streaming state. */
export function ToolWidget({ part }: { part: ChatToolPart }) {
  const name = getStaticToolName(part) as keyof ChatTools;
  // The registry guarantees Input/Output match the tool name, but TypeScript
  // cannot carry that correlation through a keyed lookup — narrow once here.
  const pack = registry[name] as unknown as WidgetPack<unknown, unknown>;

  switch (part.state) {
    case "input-streaming":
    case "input-available":
      return <pack.Skeleton input={part.input} />;
    case "output-available":
      return <pack.Component input={part.input} output={part.output} />;
    case "output-error":
      return <ErrorState message={part.errorText ?? "The widget failed to load."} />;
    default:
      return null;
  }
}
