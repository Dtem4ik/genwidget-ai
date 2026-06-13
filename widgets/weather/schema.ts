import { z } from "zod";

export const getWeatherInput = z.object({
  city: z.string().describe("City name to get the weather for, e.g. 'Tel Aviv'"),
  units: z
    .enum(["celsius", "fahrenheit"])
    .default("celsius")
    .describe("Temperature units; default celsius unless the user asks otherwise"),
});

export type GetWeatherInput = z.infer<typeof getWeatherInput>;

export interface WeatherData {
  city: string;
  temperature: number;
  feelsLike: number;
  weatherCode: number;
  windspeed: number;
  humidity: number;
  units: "celsius" | "fahrenheit";
}

export type GetWeatherOutput = WeatherData | { error: string };
