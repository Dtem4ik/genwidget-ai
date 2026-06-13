import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { type ChatToolPart, ToolWidget } from "@/components/widgets/registry";

import fixtures from "./fixtures.json";
import type { WeatherData } from "./schema";

const output = fixtures as WeatherData;

const part = (overrides: Partial<ChatToolPart>): ChatToolPart =>
  ({ type: "tool-getWeather", toolCallId: "w1", ...overrides }) as ChatToolPart;

const input = { city: "Tel Aviv", units: "celsius" as const };

describe("WeatherCard via ToolWidget", () => {
  it("shows the skeleton while the tool is executing", () => {
    render(<ToolWidget part={part({ state: "input-available", input })} />);
    expect(screen.getByTestId("weather-skeleton")).toHaveAttribute("aria-busy", "true");
  });

  it("renders live weather data with attribution", () => {
    render(<ToolWidget part={part({ state: "output-available", input, output })} />);
    expect(screen.getByTestId("weather-results")).toBeInTheDocument();
    expect(screen.getByText("25°C")).toBeInTheDocument();
    expect(screen.getByText("Partly cloudy")).toBeInTheDocument();
    expect(screen.getByText("Powered by Open-Meteo")).toBeInTheDocument();
  });

  it("renders the error state when the tool returns an error", () => {
    render(
      <ToolWidget
        part={part({ state: "output-available", input, output: { error: "City not found" } })}
      />,
    );
    expect(screen.getByTestId("widget-error")).toBeInTheDocument();
    expect(screen.getByText("City not found")).toBeInTheDocument();
  });
});
