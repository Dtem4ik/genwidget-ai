import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { type ChatToolPart, ToolWidget } from "@/components/widgets/registry";

import fixtures from "./fixtures.json";
import type { ApartmentItem } from "./schema";

const apartments = fixtures.apartments as ApartmentItem[];

const part = (overrides: Partial<ChatToolPart>): ChatToolPart =>
  ({
    type: "tool-showApartments",
    toolCallId: "call-1",
    ...overrides,
  }) as ChatToolPart;

describe("ApartmentResults via ToolWidget", () => {
  it("renders the skeleton while input is streaming", () => {
    render(<ToolWidget part={part({ state: "input-streaming", input: { apartments: [] } })} />);

    const skeleton = screen.getByTestId("apartments-skeleton");
    expect(skeleton).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("Finding apartments…")).toBeInTheDocument();
  });

  it("renders generated apartment cards when output is available", () => {
    render(
      <ToolWidget
        part={part({
          state: "output-available",
          input: { apartments },
          output: { apartments },
        })}
      />,
    );

    expect(screen.getByTestId("apartments-results")).toBeInTheDocument();
    expect(screen.getByText("2 apartments")).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(apartments.length);
    expect(screen.getByText("Bright 2-room near Rothschild Blvd")).toBeInTheDocument();
    expect(screen.getByText("$385,000")).toBeInTheDocument();
    expect(screen.getByText(/Studio/)).toBeInTheDocument();
  });

  it("renders the error card when the tool errors", () => {
    render(
      <ToolWidget
        part={part({ state: "output-error", input: { apartments: [] }, errorText: "boom" })}
      />,
    );

    expect(screen.getByText("boom")).toBeInTheDocument();
  });
});
