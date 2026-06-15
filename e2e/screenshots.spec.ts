import { expect, test } from "@playwright/test";

import apartmentsFx from "@/widgets/apartments/fixtures.json";
import compareFx from "@/widgets/compare/fixtures.json";
import filtersFx from "@/widgets/filters/fixtures.json";
import recommendFx from "@/widgets/recommend/fixtures.json";
import stockFx from "@/widgets/stock/fixtures.json";
import weatherFx from "@/widgets/weather/fixtures.json";

import { mockChatStream, toolStream } from "./mock-chat";

/**
 * Dev tool, NOT part of CI. Generates README/docs screenshots of every widget in both
 * themes (and mobile for the wide ones) by driving the app with the same mocked
 * `/api/chat` stream the e2e suite uses — no live LLM. Run with `pnpm screenshots`.
 * Skipped on a normal `pnpm e2e` run so it never blocks CI.
 */
test.skip(!process.env.SCREENSHOTS, "run via `pnpm screenshots`");

const apt = apartmentsFx as { apartments: unknown[] };

interface Scene {
  name: string;
  toolName: string;
  output: unknown;
  testid: string;
  mobile?: boolean;
}

const SCENES: Scene[] = [
  { name: "apartments", toolName: "showApartments", output: apt, testid: "apartments-results", mobile: true }, // prettier-ignore
  { name: "apartments-single", toolName: "showApartments", output: { apartments: apt.apartments.slice(0, 1) }, testid: "apartments-results" }, // prettier-ignore
  { name: "compare", toolName: "compareProducts", output: compareFx, testid: "compare-results", mobile: true }, // prettier-ignore
  { name: "recommend", toolName: "recommendProduct", output: recommendFx, testid: "recommend-results" }, // prettier-ignore
  { name: "weather", toolName: "getWeather", output: weatherFx, testid: "weather-results" },
  { name: "stock", toolName: "getStockOrCrypto", output: stockFx, testid: "stock-results" },
  { name: "filters", toolName: "setFilters", output: filtersFx, testid: "filters-results" },
];

async function shoot(
  page: import("@playwright/test").Page,
  scene: Scene,
  theme: "light" | "dark",
  suffix = "",
) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript((t) => localStorage.setItem("theme", t), theme);
  await mockChatStream(
    page,
    toolStream({
      toolName: scene.toolName,
      toolCallId: `shot-${scene.name}`,
      input: {},
      output: scene.output,
    }),
  );
  await page.goto("/");
  const input = page.getByRole("textbox", { name: "Message" });
  await input.fill(`show ${scene.name}`);
  await input.press("Enter");
  const el = page.getByTestId(scene.testid);
  await expect(el).toBeVisible({ timeout: 15_000 });
  await el.screenshot({ path: `docs/screenshots/${scene.name}-${theme}${suffix}.png` });
}

for (const scene of SCENES) {
  for (const theme of ["light", "dark"] as const) {
    test(`shot: ${scene.name} ${theme}`, async ({ page }) => {
      await shoot(page, scene, theme);
    });

    if (scene.mobile) {
      test(`shot: ${scene.name} ${theme} mobile`, async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 800 });
        await shoot(page, scene, theme, "-mobile");
      });
    }
  }
}
