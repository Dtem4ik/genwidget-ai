import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { WidgetActionsProvider } from "@/components/widgets/widget-actions";
import { type ChatToolPart, ToolWidget } from "@/components/widgets/registry";

import fixtures from "./fixtures.json";
import type { RecommendProductInput } from "./schema";

const output = fixtures as RecommendProductInput;

const part = (overrides: Partial<ChatToolPart>): ChatToolPart =>
  ({ type: "tool-recommendProduct", toolCallId: "r1", ...overrides }) as ChatToolPart;

describe("ProductRecommendation via ToolWidget", () => {
  it("renders the skeleton while input is streaming", () => {
    render(<ToolWidget part={part({ state: "input-streaming", input: {} })} />);
    expect(screen.getByTestId("recommend-skeleton")).toHaveAttribute("aria-busy", "true");
  });

  it("renders the pick, specs and cheaper alternatives", () => {
    render(<ToolWidget part={part({ state: "output-available", input: output, output })} />);

    expect(screen.getByTestId("recommend-results")).toBeInTheDocument();
    expect(screen.getByText("MacBook Air 15 (M3)")).toBeInTheDocument();
    expect(screen.getByText("$1,299")).toBeInTheDocument();
    expect(screen.getByText("Acer Swift Go 14")).toBeInTheDocument();
    expect(screen.getByText("ThinkPad E14")).toBeInTheDocument();
  });

  it("exposes action buttons with aria-labels that send follow-ups", () => {
    const ask = vi.fn();
    render(
      <WidgetActionsProvider ask={ask}>
        <ToolWidget part={part({ state: "output-available", input: output, output })} />
      </WidgetActionsProvider>,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Why MacBook Air 15 \(M3\) is the best pick/i }),
    );
    expect(ask).toHaveBeenCalledWith(expect.stringContaining("MacBook Air 15 (M3)"));
  });

  it("renders an error card on output-error", () => {
    render(<ToolWidget part={part({ state: "output-error", input: output, errorText: "nope" })} />);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });
});
