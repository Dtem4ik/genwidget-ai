"use client";

import { CloudIcon, DropletsIcon, WindIcon } from "lucide-react";

import { DomainCard } from "@/components/widgets/domain-card";
import { ErrorState } from "@/components/widgets/widget-states";
import { useWidgetActions } from "@/components/widgets/widget-actions";

import type { GetWeatherInput, GetWeatherOutput } from "./schema";

/** Minimal WMO weather-code → label map. */
export function weatherLabel(code: number): string {
  if (code === 0) return "Clear sky";
  if (code <= 3) return "Partly cloudy";
  if (code <= 48) return "Fog";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Rain showers";
  if (code <= 99) return "Thunderstorm";
  return "—";
}

export function WeatherCard({
  input,
  output,
}: {
  input: GetWeatherInput;
  output: GetWeatherOutput;
}) {
  const { ask } = useWidgetActions();

  if ("error" in output) {
    return <ErrorState message={output.error} onRetry={() => ask(`Weather in ${input.city}`)} />;
  }

  const unit = output.units === "fahrenheit" ? "°F" : "°C";

  return (
    <section
      className="bg-card flex w-full max-w-sm flex-col gap-3 rounded-xl border p-4"
      data-testid="weather-results"
    >
      <DomainCard icon={CloudIcon} label={`Weather in ${output.city}`} size="sm" />
      <div>
        <p className="text-muted-foreground text-sm">{output.city}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-[32px] font-medium tabular-nums leading-none">
            {output.temperature}
            {unit}
          </span>
          <span className="text-muted-foreground text-sm">{weatherLabel(output.weatherCode)}</span>
        </div>
        <p className="text-muted-foreground text-xs">
          Feels like {output.feelsLike}
          {unit}
        </p>
      </div>
      <div className="text-muted-foreground flex gap-4 text-sm">
        <span className="flex items-center gap-1">
          <WindIcon className="size-4" /> {output.windspeed} km/h
        </span>
        <span className="flex items-center gap-1">
          <DropletsIcon className="size-4" /> {output.humidity}%
        </span>
      </div>
      <a
        className="text-muted-foreground/70 hover:text-muted-foreground text-[10px]"
        href="https://open-meteo.com/"
        rel="noreferrer"
        target="_blank"
      >
        Powered by Open-Meteo
      </a>
    </section>
  );
}
