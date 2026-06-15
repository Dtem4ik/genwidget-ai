import { expect, test } from "@playwright/test";

import { mockChatRateLimited } from "./mock-chat";

test.describe("daily rate limit", () => {
  test("a 429 surfaces the bring-your-own-key banner", async ({ page }) => {
    await mockChatRateLimited(page);
    await page.goto("/");

    const input = page.getByRole("textbox", { name: "Message" });
    await expect(input).toBeVisible();
    await input.fill("Weather in Tel Aviv");
    await input.press("Enter");

    await expect(page.getByText(/free messages/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByLabel("Google AI Studio API key")).toBeVisible();
  });
});
