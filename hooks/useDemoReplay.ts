"use client";

import { useEffect, useRef } from "react";

import type { ChatUIMessage } from "@/lib/ai/tools";
import { DEMO_SCRIPT } from "@/lib/demo/demoScript";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Replays the pre-recorded {@link DEMO_SCRIPT} into the chat on landing — no API calls.
 * Each exchange stages user → tool skeleton → tool result → reply, so visitors see the
 * streaming-widget "magic" immediately.
 *
 * Runs exactly once: cancellation is keyed off the `play` flag (the chat flips it to
 * false on the first user interaction), NOT off the effect cleanup — so React StrictMode's
 * dev-only mount/unmount/remount doesn't kill the replay before it starts. The widget
 * entrance animation therefore fires a single time.
 */
export function useDemoReplay({
  play,
  setMessages,
  onFinish,
}: {
  play: boolean;
  setMessages: (messages: ChatUIMessage[]) => void;
  onFinish: () => void;
}) {
  const startedRef = useRef(false);
  const cancelledRef = useRef(false);

  // A real interaction (play → false) cancels the in-flight replay.
  useEffect(() => {
    if (!play) cancelledRef.current = true;
  }, [play]);

  useEffect(() => {
    if (!play || startedRef.current) return;
    startedRef.current = true;
    const messages: ChatUIMessage[] = [];
    const render = () => setMessages([...messages]);

    const toolPart = (ex: (typeof DEMO_SCRIPT)[number], done: boolean) =>
      ({
        type: `tool-${ex.toolName}`,
        toolCallId: ex.toolCallId,
        state: done ? "output-available" : "input-available",
        input: ex.input,
        ...(done ? { output: ex.output } : {}),
      }) as unknown as ChatUIMessage["parts"][number];

    (async () => {
      await sleep(1500);
      if (cancelledRef.current) return;

      for (const ex of DEMO_SCRIPT) {
        messages.push({
          id: `${ex.toolCallId}-u`,
          role: "user",
          parts: [{ type: "text", text: ex.user }],
        } as ChatUIMessage);
        render();
        await sleep(800);
        if (cancelledRef.current) return;

        const assistant: ChatUIMessage = {
          id: `${ex.toolCallId}-a`,
          role: "assistant",
          parts: [toolPart(ex, false)],
        } as ChatUIMessage;
        messages.push(assistant);
        render();
        await sleep(1300);
        if (cancelledRef.current) return;

        assistant.parts = [toolPart(ex, true)];
        render();
        await sleep(700);
        if (cancelledRef.current) return;

        assistant.parts = [
          ...assistant.parts,
          { type: "text", text: ex.reply } as ChatUIMessage["parts"][number],
        ];
        render();
        await sleep(1600);
        if (cancelledRef.current) return;
      }
      if (!cancelledRef.current) onFinish();
    })();
    // Intentionally no cancel-on-cleanup: see the docblock (StrictMode tolerance).
    // setMessages/onFinish are stable, so this still runs exactly once.
  }, [play, setMessages, onFinish]);
}
