import { afterEach, describe, expect, it, vi } from "vitest";

// The module decides at import time whether Redis is configured, so we set env +
// reset modules per case. No real Upstash call is ever made.
afterEach(() => {
  vi.resetModules();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("checkRateLimit", () => {
  it("allows (no-op) when Upstash isn't configured", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
    const { checkRateLimit, DAILY_LIMIT } = await import("./rate-limit");
    const res = await checkRateLimit("1.2.3.4");
    expect(res.success).toBe(true);
    expect(res.remaining).toBe(DAILY_LIMIT);
  });

  it("is disabled in development even with creds (local dev needs no quota)", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://example.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "token");
    const { checkRateLimit } = await import("./rate-limit");
    const res = await checkRateLimit("1.2.3.4");
    expect(res.success).toBe(true);
  });

  it("enforces the limit in production via the Ratelimit client", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://example.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "token");
    const limit = vi
      .fn()
      .mockResolvedValueOnce({ success: true, remaining: 9 })
      .mockResolvedValueOnce({ success: false, remaining: 0 });
    vi.doMock("@upstash/redis", () => ({ Redis: class {} }));
    vi.doMock("@upstash/ratelimit", () => ({
      Ratelimit: Object.assign(
        class {
          limit = limit;
        },
        { fixedWindow: () => ({}) },
      ),
    }));

    const { checkRateLimit } = await import("./rate-limit");
    expect((await checkRateLimit("ip")).success).toBe(true);
    expect((await checkRateLimit("ip")).success).toBe(false);
    expect(limit).toHaveBeenCalledTimes(2);
  });
});
