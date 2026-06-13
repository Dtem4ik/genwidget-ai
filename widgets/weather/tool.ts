import { tool } from "ai";

import { type GetWeatherOutput, getWeatherInput } from "./schema";

const TIMEOUT_MS = 8000;

interface GeoResult {
  results?: Array<{ name: string; country?: string; latitude: number; longitude: number }>;
}
interface ForecastResult {
  current?: {
    temperature_2m: number;
    apparent_temperature: number;
    weather_code: number;
    wind_speed_10m: number;
    relative_humidity_2m: number;
  };
}

export const getWeather = tool({
  description:
    "Get the CURRENT weather for a city. Use when the user asks about weather, temperature " +
    "or forecast. Live data from Open-Meteo — do not invent values.",
  inputSchema: getWeatherInput,
  // Live API — real fetch (geocode → current weather), not a passthrough.
  execute: async ({ city, units }): Promise<GetWeatherOutput> => {
    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`,
        { signal: AbortSignal.timeout(TIMEOUT_MS) },
      );
      const geo = (await geoRes.json()) as GeoResult;
      const place = geo.results?.[0];
      if (!place) return { error: `Couldn't find a city called "${city}".` };

      const tempUnit = units === "fahrenheit" ? "fahrenheit" : "celsius";
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}` +
          `&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m` +
          `&temperature_unit=${tempUnit}`,
        { signal: AbortSignal.timeout(TIMEOUT_MS) },
      );
      const data = (await res.json()) as ForecastResult;
      const c = data.current;
      if (!c) return { error: "Weather service returned no data." };

      return {
        city: place.country ? `${place.name}, ${place.country}` : place.name,
        temperature: Math.round(c.temperature_2m),
        feelsLike: Math.round(c.apparent_temperature),
        weatherCode: c.weather_code,
        windspeed: Math.round(c.wind_speed_10m),
        humidity: Math.round(c.relative_humidity_2m),
        units,
      };
    } catch {
      return { error: "Weather service is unavailable right now." };
    }
  },
});
