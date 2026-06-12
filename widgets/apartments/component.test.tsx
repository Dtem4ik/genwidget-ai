import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { type ChatToolPart, ToolWidget } from "@/components/widgets/registry";

import fixtures from "./fixtures.json";
import type { Apartment } from "./schema";

const apartments = fixtures.apartments as Apartment[];

const part = (overrides: Partial<ChatToolPart>): ChatToolPart =>
  ({
    type: "tool-searchApartments",
    toolCallId: "call-1",
    ...overrides,
  }) as ChatToolPart;

describe("ApartmentResults via ToolWidget", () => {
  it("renders the skeleton with streamed filter chips while input is streaming", () => {
    render(
      <ToolWidget
        part={part({ state: "input-streaming", input: { rooms: 2, maxPrice: 200000 } })}
      />,
    );

    const skeleton = screen.getByTestId("apartments-skeleton");
    expect(skeleton).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("Searching apartments…")).toBeInTheDocument();
    expect(screen.getByText("2-room")).toBeInTheDocument();
    expect(screen.getByText("under $200,000")).toBeInTheDocument();
  });

  it("renders apartment cards with prices and totals when output is available", () => {
    render(
      <ToolWidget
        part={part({
          state: "output-available",
          input: { rooms: 2 },
          output: { apartments, total: 11 },
        })}
      />,
    );

    expect(screen.getByTestId("apartments-results")).toBeInTheDocument();
    expect(screen.getByText("11 apartments found")).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(apartments.length);
    expect(screen.getByText("$133,500")).toBeInTheDocument();
    expect(screen.getByText(/Northbay Park · Green Quarter · floor 12\/14/)).toBeInTheDocument();
  });

  it("renders the empty state for zero results", () => {
    render(
      <ToolWidget
        part={part({
          state: "output-available",
          input: { rooms: 4, maxPrice: 1000 },
          output: { apartments: [], total: 0 },
        })}
      />,
    );

    expect(screen.getByTestId("apartments-empty")).toBeInTheDocument();
    expect(screen.getByText(/Try loosening a filter/)).toBeInTheDocument();
  });

  it("renders the error card when the tool errors", () => {
    render(
      <ToolWidget
        part={part({ state: "output-error", input: { rooms: 2 }, errorText: "catalog exploded" })}
      />,
    );

    expect(screen.getByText("catalog exploded")).toBeInTheDocument();
  });
});
