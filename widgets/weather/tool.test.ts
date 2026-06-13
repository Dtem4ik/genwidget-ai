import { afterEach, describe, expect, it, vi } from "vitest";

import { getWeather } from "./tool";

const run = (input: { city: string; units?: "celsius" | "fahrenheit" }) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- test invokes the tool's execute directly
  (getWeather as any).execute({ units: "celsius", ...input }, {});

const jsonResponse = (body: unknown) => ({ json: async () => body }) as Response;

afterEach(() => vi.unstubAllGlobals());

describe("getWeather.execute", () => {
  it("geocodes then returns parsed current weather", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          results: [{ name: "Tel Aviv", country: "Israel", latitude: 32, longitude: 34 }],
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          current: {
            temperature_2m: 24.6,
            apparent_temperature: 26.7,
            weather_code: 2,
            wind_speed_10m: 5.2,
            relative_humidity_2m: 71,
          },
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const result = await run({ city: "Tel Aviv" });
    expect(result).toMatchObject({
      city: "Tel Aviv, Israel",
      temperature: 25,
      feelsLike: 27,
      humidity: 71,
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("returns an error when the city is not found", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(jsonResponse({ results: [] })));
    const result = await run({ city: "zzzfakecity" });
    expect(result).toEqual({ error: expect.stringContaining("zzzfakecity") });
  });

  it("returns an error when the API throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    const result = await run({ city: "Tel Aviv" });
    expect(result).toEqual({ error: expect.any(String) });
  });
});
