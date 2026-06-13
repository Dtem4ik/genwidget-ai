import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { type ChatToolPart, ToolWidget } from "@/components/widgets/registry";

import fixtures from "./fixtures.json";
import type { StockData } from "./schema";

const output = fixtures as StockData;
const input = { symbol: "bitcoin", name: "Bitcoin" };

const part = (overrides: Partial<ChatToolPart>): ChatToolPart =>
  ({ type: "tool-getStockOrCrypto", toolCallId: "s1", ...overrides }) as ChatToolPart;

describe("StockCard via ToolWidget", () => {
  it("shows the skeleton while executing", () => {
    render(<ToolWidget part={part({ state: "input-available", input })} />);
    expect(screen.getByTestId("stock-skeleton")).toHaveAttribute("aria-busy", "true");
  });

  it("renders price, 24h change and a sparkline", () => {
    const { container } = render(
      <ToolWidget part={part({ state: "output-available", input, output })} />,
    );
    expect(screen.getByTestId("stock-results")).toBeInTheDocument();
    expect(screen.getByText("$63,976")).toBeInTheDocument();
    expect(screen.getByText(/\+0\.09% 24h/)).toBeInTheDocument();
    expect(container.querySelector("polyline")).toBeInTheDocument();
  });

  it("renders the error state on a tool error", () => {
    render(
      <ToolWidget
        part={part({ state: "output-available", input, output: { error: "No market data" } })}
      />,
    );
    expect(screen.getByText("No market data")).toBeInTheDocument();
  });
});
