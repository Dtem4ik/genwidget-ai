import { expect, test } from "@playwright/test";

import { apartmentStream, E2E_APARTMENT_TITLE, mockChatStream } from "./mock-chat";

test.describe("real chat (mocked LLM)", () => {
  test("typing a prompt clears the demo and renders the widget", async ({ page }) => {
    await mockChatStream(page, apartmentStream);
    await page.goto("/");

    const input = page.getByRole("textbox", { name: "Message" });
    await expect(input).toBeVisible();
    await input.fill("Show me apartments in Tel Aviv");
    await input.press("Enter");

    await expect(page.getByText(E2E_APARTMENT_TITLE)).toBeVisible({ timeout: 15_000 });
  });

  test("clicking a suggested prompt sends it and renders the widget", async ({ page }) => {
    await mockChatStream(page, apartmentStream);
    await page.goto("/");

    await page.getByRole("button", { name: "Show me 2BR apartments in Florentin" }).click();

    await expect(page.getByText(E2E_APARTMENT_TITLE)).toBeVisible({ timeout: 15_000 });
  });

  test("type-to-focus: typing focuses the chat input", async ({ page }) => {
    await page.goto("/");
    const input = page.getByRole("textbox", { name: "Message" });
    // Nothing editable focused → a printable keystroke should focus the chat input.
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur?.());
    await expect(input).not.toBeFocused();
    await page.keyboard.press("h");
    await expect(input).toBeFocused();
  });
});
