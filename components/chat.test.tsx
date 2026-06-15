import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ChatUIMessage } from "@/lib/ai/tools";
import { WidgetActionsProvider } from "@/components/widgets/widget-actions";

import { MessageParts } from "./chat";
import weatherFx from "@/widgets/weather/fixtures.json";

const weatherPart = (id: string) =>
  ({
    type: "tool-getWeather",
    toolCallId: id,
    state: "output-available",
    input: { city: "Tel Aviv", units: "celsius" },
    output: weatherFx,
  }) as const;

const message = (count: number): ChatUIMessage =>
  ({
    id: "m1",
    role: "assistant",
    parts: Array.from({ length: count }, (_, i) => weatherPart(`call-${i}`)),
  }) as unknown as ChatUIMessage;

const renderParts = (count: number) => {
  const { container } = render(
    <WidgetActionsProvider ask={() => {}}>
      <MessageParts message={message(count)} />
    </WidgetActionsProvider>,
  );
  return container;
};

describe("MessageParts grouping", () => {
  it("groups consecutive tool widgets into a single grid", () => {
    const c = renderParts(2);
    const grids = c.querySelectorAll(".grid");
    expect(grids).toHaveLength(1);
    expect(c.querySelectorAll('[data-testid="weather-results"]')).toHaveLength(2);
  });

  it("a single widget renders full width (grid-cols-1, no sm:grid-cols-2)", () => {
    const grid = renderParts(1).querySelector(".grid")!;
    expect(grid.className).toContain("grid-cols-1");
    expect(grid.className).not.toContain("sm:grid-cols-2");
  });

  it("two widgets get a two-column grid", () => {
    const grid = renderParts(2).querySelector(".grid")!;
    expect(grid.className).toContain("sm:grid-cols-2");
  });

  it("three widgets get a three-column grid", () => {
    const grid = renderParts(3).querySelector(".grid")!;
    expect(grid.className).toContain("lg:grid-cols-3");
  });

  it("renders trailing reply text after a widget in a single grid", () => {
    const message = {
      id: "m2",
      role: "assistant",
      parts: [weatherPart("call-0"), { type: "text", text: "Here you go." }],
    } as unknown as ChatUIMessage;
    const { container, getByText } = render(
      <WidgetActionsProvider ask={() => {}}>
        <MessageParts message={message} />
      </WidgetActionsProvider>,
    );
    // One widget grid, plus the reply text below it (no second grid / remount).
    expect(container.querySelectorAll(".grid")).toHaveLength(1);
    expect(getByText("Here you go.")).toBeTruthy();
  });
});
