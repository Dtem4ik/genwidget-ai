import type { Page, Route } from "@playwright/test";

/**
 * Deterministic mock of `POST /api/chat`. We never hit the real LLM in e2e — the
 * free tier is flaky and rate-limited, and CI must be reproducible (ADR-006).
 *
 * The body is the AI SDK v6 UI message stream protocol: SSE `data: <json>` lines,
 * terminated by `data: [DONE]`. The chunk types and field names are taken verbatim
 * from `node_modules/ai` (uiMessageChunkSchema), so `useChat` parses them into a
 * message with a tool part that the widget registry renders.
 */

type Chunk = Record<string, unknown>;

const UI_STREAM_HEADERS = {
  "content-type": "text/event-stream",
  "cache-control": "no-cache",
  "x-vercel-ai-ui-message-stream": "v1",
};

function sse(chunks: Chunk[]): string {
  return chunks.map((c) => `data: ${JSON.stringify(c)}\n\n`).join("") + "data: [DONE]\n\n";
}

/** Builds a single-tool assistant turn: input → output → optional text reply. */
export function toolStream(opts: {
  toolName: string;
  toolCallId: string;
  input: unknown;
  output: unknown;
  reply?: string;
}): string {
  const { toolName, toolCallId, input, output, reply } = opts;
  return sse([
    { type: "start" },
    { type: "start-step" },
    { type: "tool-input-available", toolCallId, toolName, input },
    { type: "tool-output-available", toolCallId, output },
    ...(reply
      ? [
          { type: "text-start", id: "txt-1" },
          { type: "text-delta", id: "txt-1", delta: reply },
          { type: "text-end", id: "txt-1" },
        ]
      : []),
    { type: "finish-step" },
    { type: "finish" },
  ]);
}

/** A single, recognizable apartment result used across the happy-path specs. */
export const E2E_APARTMENT_TITLE = "E2E Test Apartment";

export const apartmentStream = toolStream({
  toolName: "showApartments",
  toolCallId: "e2e-apartments",
  input: { apartments: [] },
  output: {
    apartments: [
      {
        title: E2E_APARTMENT_TITLE,
        location: "Florentin, Tel Aviv",
        rooms: 2,
        area: 60,
        floor: 3,
        totalFloors: 6,
        price: 400000,
        features: ["balcony", "renovated"],
        imageQuery: "tel aviv apartment",
      },
    ],
  },
  reply: "Here is a match.",
});

/** Routes /api/chat to a fixed UI-message stream (HTTP 200). */
export async function mockChatStream(page: Page, body: string): Promise<void> {
  await page.route("**/api/chat", async (route: Route) => {
    await route.fulfill({ status: 200, headers: UI_STREAM_HEADERS, body });
  });
}

/** Routes /api/chat to a 429 (daily limit reached) so the BYOK banner surfaces. */
export async function mockChatRateLimited(page: Page): Promise<void> {
  await page.route("**/api/chat", async (route: Route) => {
    await route.fulfill({
      status: 429,
      contentType: "application/json",
      body: JSON.stringify({ error: "Daily limit reached" }),
    });
  });
}

/** Records every request that actually reached /api/chat (to assert the demo is offline). */
export function trackChatRequests(page: Page): { count: () => number } {
  let count = 0;
  page.on("request", (req) => {
    if (req.url().includes("/api/chat")) count += 1;
  });
  return { count: () => count };
}
