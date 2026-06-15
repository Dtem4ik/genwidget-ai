"use client";

import {
  CloudIcon,
  CloudRainIcon,
  CloudSnowIcon,
  DropletsIcon,
  type LucideIcon,
  SunIcon,
  WindIcon,
  ZapIcon,
} from "lucide-react";

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

/** WMO weather-code → matching icon. */
export function weatherIcon(code: number): LucideIcon {
  if (code === 0) return SunIcon;
  if (code <= 48) return CloudIcon;
  if (code <= 67) return CloudRainIcon;
  if (code <= 77) return CloudSnowIcon;
  if (code <= 82) return CloudRainIcon;
  return ZapIcon;
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
      className="bg-card flex w-full flex-col gap-4 rounded-xl border p-4 sm:p-5"
      data-testid="weather-results"
    >
      <DomainCard icon={weatherIcon(output.weatherCode)} label={`Weather in ${output.city}`} />
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-muted-foreground text-[13px]">{output.city}</p>
        <span className="text-5xl font-medium leading-none tabular-nums">
          {output.temperature}
          {unit}
        </span>
        <p className="text-[15px]">{weatherLabel(output.weatherCode)}</p>
        <p className="text-muted-foreground text-xs">
          Feels like {output.feelsLike}
          {unit}
        </p>
      </div>
      <div className="text-muted-foreground flex justify-center gap-8 text-[13px]">
        <span className="flex items-center gap-1.5">
          <WindIcon aria-hidden className="size-4" />
          <span>
            <span className="sr-only">Wind </span>
            {output.windspeed} km/h
          </span>
        </span>
        <span className="flex items-center gap-1.5">
          <DropletsIcon aria-hidden className="size-4" />
          <span>
            <span className="sr-only">Humidity </span>
            {output.humidity}%
          </span>
        </span>
      </div>
      <a
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded text-center text-[10px] focus-visible:ring-2 focus-visible:outline-none"
        href="https://open-meteo.com/"
        rel="noreferrer"
        target="_blank"
      >
        Powered by Open-Meteo
      </a>
    </section>
  );
}
