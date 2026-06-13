import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { WidgetActionsProvider } from "@/components/widgets/widget-actions";
import { type ChatToolPart, ToolWidget } from "@/components/widgets/registry";

import fixtures from "./fixtures.json";
import type { SetFiltersInput } from "./schema";

const output = fixtures as SetFiltersInput;

const part = (overrides: Partial<ChatToolPart>): ChatToolPart =>
  ({ type: "tool-setFilters", toolCallId: "f1", ...overrides }) as ChatToolPart;

const renderChips = (ask = vi.fn()) => {
  render(
    <WidgetActionsProvider ask={ask}>
      <ToolWidget part={part({ state: "output-available", input: output, output })} />
    </WidgetActionsProvider>,
  );
  return ask;
};

describe("FilterChips", () => {
  it("renders chips from the tool args, active by default", () => {
    renderChips();
    expect(screen.getByRole("button", { name: "Roomier (80m²+)" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByText("Refining apartment search")).toBeInTheDocument();
  });

  it("toggles a chip's active state on click", () => {
    renderChips();
    const chip = screen.getByRole("button", { name: "Roomier (80m²+)" });
    fireEvent.click(chip);
    expect(chip).toHaveAttribute("aria-pressed", "false");
  });

  it("Apply sends the active filters back into the chat", () => {
    const ask = renderChips();
    fireEvent.click(screen.getByRole("button", { name: /^Apply/ }));
    expect(ask).toHaveBeenCalledWith(expect.stringContaining("Roomier (80m²+)"));
  });
});
