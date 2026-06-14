import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
});

describe("cache", () => {
  it("matches suggested prompts case- and whitespace-insensitively", async () => {
    const { isCacheablePrompt } = await import("./cache");
    expect(isCacheablePrompt("  Show me 2-bedroom apartments in Tel Aviv ")).toBe(true);
    expect(isCacheablePrompt("weather in tel aviv")).toBe(false);
  });

  it("no-ops when Redis is not configured", async () => {
    vi.doMock("./redis", () => ({ redis: null }));
    const { getCachedStream, setCachedStream } = await import("./cache");
    expect(await getCachedStream("show me 2-bedroom apartments in tel aviv")).toBeNull();
    await expect(
      setCachedStream("show me 2-bedroom apartments in tel aviv", "x"),
    ).resolves.toBeUndefined();
  });

  it("reads/writes via Redis for cacheable prompts only", async () => {
    const get = vi.fn().mockResolvedValue("STREAM");
    const set = vi.fn().mockResolvedValue("OK");
    vi.doMock("./redis", () => ({ redis: { get, set } }));
    const { getCachedStream, setCachedStream } = await import("./cache");

    const prompt = "compare iphone 15 pro vs pixel 9 vs galaxy s25";
    expect(await getCachedStream(prompt)).toBe("STREAM");
    expect(get).toHaveBeenCalledOnce();

    await setCachedStream(prompt, "BODY");
    expect(set).toHaveBeenCalledWith(expect.stringContaining("genwidget:cache:"), "BODY", {
      ex: 86400,
    });

    // A non-cacheable prompt must never touch Redis.
    get.mockClear();
    expect(await getCachedStream("what's the weather in tel aviv")).toBeNull();
    expect(get).not.toHaveBeenCalled();
  });
});
