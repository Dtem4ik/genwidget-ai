import { redis } from "./redis";

// Only the LLM-generated suggested prompts are cached — never live data (weather/stock).
export const CACHED_PROMPTS = [
  "show me 2-bedroom apartments in tel aviv",
  "compare iphone 15 pro vs pixel 9 vs galaxy s25",
  "best laptop for a developer under $1500",
];

const TTL_SECONDS = 60 * 60 * 24; // 24h
const normalize = (text: string) => text.trim().toLowerCase();
const cacheKey = (text: string) => `genwidget:cache:${normalize(text)}`;

export const isCacheablePrompt = (text: string) => CACHED_PROMPTS.includes(normalize(text));

/** Returns the cached UI message stream (raw SSE body) for an exact suggested prompt. */
export async function getCachedStream(text: string): Promise<string | null> {
  if (!redis || !isCacheablePrompt(text)) return null;
  return (await redis.get<string>(cacheKey(text))) ?? null;
}

export async function setCachedStream(text: string, body: string): Promise<void> {
  if (!redis || !isCacheablePrompt(text) || !body) return;
  await redis.set(cacheKey(text), body, { ex: TTL_SECONDS });
}
