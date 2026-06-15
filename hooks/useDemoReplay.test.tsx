import { renderHook } from "@testing-library/react";
import { StrictMode, type ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ChatUIMessage } from "@/lib/ai/tools";

import { useDemoReplay } from "./useDemoReplay";

const strict = ({ children }: { children: ReactNode }) => <StrictMode>{children}</StrictMode>;

describe("useDemoReplay", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("runs the scripted replay exactly once under StrictMode and finishes once", async () => {
    const setMessages = vi.fn();
    const onFinish = vi.fn();

    // StrictMode double-invokes effects — the replay must still start once and complete,
    // so the widget entrance animation fires a single time (regression guard).
    renderHook(() => useDemoReplay({ play: true, setMessages, onFinish }), { wrapper: strict });

    await vi.advanceTimersByTimeAsync(12_000);

    expect(onFinish).toHaveBeenCalledTimes(1);
    const transcript = setMessages.mock.calls.at(-1)?.[0] as ChatUIMessage[];
    // Exactly one user turn per scripted exchange — not doubled.
    expect(transcript.filter((m) => m.role === "user")).toHaveLength(2);
  });

  it("cancels the replay when play flips to false (user interaction)", async () => {
    const setMessages = vi.fn();
    const onFinish = vi.fn();

    const { rerender } = renderHook(({ play }) => useDemoReplay({ play, setMessages, onFinish }), {
      initialProps: { play: true },
    });

    await vi.advanceTimersByTimeAsync(1600); // partway into the first exchange
    rerender({ play: false });
    await vi.advanceTimersByTimeAsync(12_000);

    expect(onFinish).not.toHaveBeenCalled();
  });
});
