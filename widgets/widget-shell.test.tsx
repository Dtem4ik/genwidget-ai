import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ApartmentResults } from "./apartments/component";
import { ApartmentResultsSkeleton } from "./apartments/skeleton";
import apartmentFx from "./apartments/fixtures.json";
import { FilterChips } from "./filters/FilterChips";
import { FilterChipsSkeleton } from "./filters/skeleton";
import filtersFx from "./filters/fixtures.json";
import { ProductRecommendation } from "./recommend/ProductRecommendation";
import { ProductRecommendationSkeleton } from "./recommend/skeleton";
import recommendFx from "./recommend/fixtures.json";
import { StockCard } from "./stock/StockCard";
import { StockCardSkeleton } from "./stock/skeleton";
import stockFx from "./stock/fixtures.json";
import { WeatherCard } from "./weather/WeatherCard";
import { WeatherCardSkeleton } from "./weather/skeleton";
import weatherFx from "./weather/fixtures.json";

const outerClasses = (el: HTMLElement) => el.className.split(/\s+/);

/**
 * The skeleton and the loaded widget must share the same outer shell so there's no
 * size jump / misalignment when data swaps in (the bug this guards against).
 */
describe("skeleton ↔ loaded shell parity", () => {
  const cases = [
    {
      name: "weather",
      skeleton: <WeatherCardSkeleton />,
      loaded: (
        <WeatherCard input={{ city: "Tel Aviv", units: "celsius" }} output={weatherFx as never} />
      ),
      skeletonId: "weather-skeleton",
      loadedId: "weather-results",
      shared: ["w-full", "p-4", "sm:p-5", "rounded-xl", "border", "bg-card"],
    },
    {
      name: "stock",
      skeleton: <StockCardSkeleton />,
      loaded: (
        <StockCard input={{ symbol: "bitcoin", name: "Bitcoin" }} output={stockFx as never} />
      ),
      skeletonId: "stock-skeleton",
      loadedId: "stock-results",
      shared: ["w-full", "p-4", "sm:p-5", "rounded-xl", "border", "bg-card"],
    },
    {
      name: "filters",
      skeleton: <FilterChipsSkeleton />,
      loaded: <FilterChips input={filtersFx as never} output={filtersFx as never} />,
      skeletonId: "filters-skeleton",
      loadedId: "filters-results",
      shared: ["w-full", "p-4", "sm:p-5", "rounded-xl", "border", "bg-card"],
    },
    {
      name: "recommend",
      skeleton: <ProductRecommendationSkeleton />,
      loaded: <ProductRecommendation input={recommendFx as never} output={recommendFx as never} />,
      skeletonId: "recommend-skeleton",
      loadedId: "recommend-results",
      shared: ["w-full"],
    },
    {
      name: "apartments",
      skeleton: <ApartmentResultsSkeleton />,
      loaded: <ApartmentResults input={apartmentFx as never} output={apartmentFx as never} />,
      skeletonId: "apartments-skeleton",
      loadedId: "apartments-results",
      shared: ["w-full"],
    },
  ];

  for (const c of cases) {
    it(`${c.name}: skeleton and loaded share the outer shell`, () => {
      const sk = render(c.skeleton);
      const skCls = outerClasses(sk.getByTestId(c.skeletonId));
      sk.unmount();

      const lo = render(c.loaded);
      const loCls = outerClasses(lo.getByTestId(c.loadedId));

      for (const cls of c.shared) {
        expect(skCls, `skeleton missing ${cls}`).toContain(cls);
        expect(loCls, `loaded missing ${cls}`).toContain(cls);
      }
    });
  }
});
