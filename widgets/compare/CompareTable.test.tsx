import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { WidgetActionsProvider } from "@/components/widgets/widget-actions";
import { type ChatToolPart, ToolWidget } from "@/components/widgets/registry";

import fixtures from "./fixtures.json";
import type { CompareProductsInput } from "./schema";

const output = fixtures as CompareProductsInput;

const part = (overrides: Partial<ChatToolPart>): ChatToolPart =>
  ({ type: "tool-compareProducts", toolCallId: "c1", ...overrides }) as ChatToolPart;

describe("CompareTable via ToolWidget", () => {
  it("renders the skeleton while input is streaming", () => {
    render(<ToolWidget part={part({ state: "input-streaming", input: { products: [] } })} />);
    expect(screen.getByTestId("compare-skeleton")).toHaveAttribute("aria-busy", "true");
  });

  it("renders products, aligned specs and the Best pick badge", () => {
    render(<ToolWidget part={part({ state: "output-available", input: output, output })} />);

    expect(screen.getByTestId("compare-results")).toBeInTheDocument();
    expect(screen.getByText("iPhone 15 Pro")).toBeInTheDocument();
    expect(screen.getByText("Pixel 9")).toBeInTheDocument();
    // shared spec label rendered once on the left
    expect(screen.getAllByText("Display")).toHaveLength(1);
    // recommended product shows the badge
    expect(screen.getByText("Best pick")).toBeInTheDocument();
  });

  it("exposes action buttons with aria-labels that send follow-ups", () => {
    const ask = vi.fn();
    render(
      <WidgetActionsProvider ask={ask}>
        <ToolWidget part={part({ state: "output-available", input: output, output })} />
      </WidgetActionsProvider>,
    );

    const button = screen.getByRole("button", { name: "Tell me more about Pixel 9" });
    fireEvent.click(button);
    expect(ask).toHaveBeenCalledWith(expect.stringContaining("Pixel 9"));
  });

  it("renders an error card on output-error", () => {
    render(<ToolWidget part={part({ state: "output-error", input: output, errorText: "boom" })} />);
    expect(screen.getByText("boom")).toBeInTheDocument();
  });
});
