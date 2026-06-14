import { Ratelimit } from "@upstash/ratelimit";

import { redis } from "./redis";

export const DAILY_LIMIT = 10;

// Disabled in development (local dev needs no quota / no Redis) and whenever Upstash
// isn't configured. Free Gemini tier is 500 req/day total, so we cap each IP at 10/day.
const ratelimit =
  redis && process.env.NODE_ENV !== "development"
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.fixedWindow(DAILY_LIMIT, "1 d"),
        prefix: "genwidget:rl",
        analytics: false,
      })
    : null;

export async function checkRateLimit(ip: string): Promise<{ success: boolean; remaining: number }> {
  if (!ratelimit) return { success: true, remaining: DAILY_LIMIT };
  const { success, remaining } = await ratelimit.limit(ip);
  return { success, remaining };
}
