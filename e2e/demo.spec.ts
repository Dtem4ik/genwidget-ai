import { expect, test } from "@playwright/test";

import { trackChatRequests } from "./mock-chat";

test.describe("landing auto-demo", () => {
  test("plays without any call to /api/chat", async ({ page }) => {
    const chat = trackChatRequests(page);
    await page.goto("/");

    // The scripted demo renders real widgets client-side (no network).
    await expect(page.getByTestId("apartments-results")).toBeVisible({ timeout: 20_000 });
    expect(chat.count(), "demo must not hit the chat API").toBe(0);
  });

  test("no horizontal overflow at 375px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto("/");
    await expect(page.getByTestId("apartments-results")).toBeVisible({ timeout: 20_000 });

    const overflow = await page.evaluate(() => {
      const el = document.documentElement;
      return el.scrollWidth - el.clientWidth;
    });
    expect(overflow, "page should not scroll horizontally on mobile").toBeLessThanOrEqual(1);
  });
});
