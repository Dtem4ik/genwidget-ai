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

// GitHub social preview card (1280×640). Self-contained HTML, no app server needed.
test("shot: social-preview", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 640 });
  await page.setContent(`<!doctype html><html><body style="margin:0">
    <div style="width:1280px;height:640px;box-sizing:border-box;
      display:flex;flex-direction:column;justify-content:center;gap:28px;padding:96px;
      background:radial-gradient(900px 600px at 78% 18%, #2a2a2a 0%, #0d0d0d 60%);
      color:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <div style="font-size:30px;letter-spacing:.18em;text-transform:uppercase;color:#a1a1a1">GenWidget&nbsp;AI</div>
      <div style="font-size:74px;line-height:1.05;font-weight:700;max-width:1000px">
        AI chat that answers with live React&nbsp;widgets.</div>
      <div style="font-size:30px;color:#c4c4c4;max-width:940px">
        Streaming tool-calls render apartments, comparisons, weather &amp; stocks as real,
        interactive widgets — not text.</div>
      <div style="font-size:24px;color:#8f8f8f;margin-top:8px">
        Next.js · TypeScript · Vercel AI SDK · zod · $0/mo · pet1.dtem4ik.dev</div>
    </div></body></html>`);
  await page.locator("div").first().screenshot({ path: "docs/social-preview.png" });
});

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
