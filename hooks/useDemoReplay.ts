"use client";

import { useEffect, useRef } from "react";

import type { ChatUIMessage } from "@/lib/ai/tools";
import { DEMO_SCRIPT } from "@/lib/demo/demoScript";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Replays the pre-recorded {@link DEMO_SCRIPT} into the chat on landing — no API calls.
 * Each exchange stages user → tool skeleton → tool result → reply, so visitors see the
 * streaming-widget "magic" immediately. Cancels the moment `play` flips to false (the
 * chat does this when the user interacts).
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

  useEffect(() => {
    if (!play || startedRef.current) return;
    startedRef.current = true;
    let cancelled = false;
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
      if (cancelled) return;

      for (const ex of DEMO_SCRIPT) {
        messages.push({
          id: `${ex.toolCallId}-u`,
          role: "user",
          parts: [{ type: "text", text: ex.user }],
        } as ChatUIMessage);
        render();
        await sleep(800);
        if (cancelled) return;

        const assistant: ChatUIMessage = {
          id: `${ex.toolCallId}-a`,
          role: "assistant",
          parts: [toolPart(ex, false)],
        } as ChatUIMessage;
        messages.push(assistant);
        render();
        await sleep(1300);
        if (cancelled) return;

        assistant.parts = [toolPart(ex, true)];
        render();
        await sleep(700);
        if (cancelled) return;

        assistant.parts = [
          ...assistant.parts,
          { type: "text", text: ex.reply } as ChatUIMessage["parts"][number],
        ];
        render();
        await sleep(1600);
        if (cancelled) return;
      }
      if (!cancelled) onFinish();
    })();

    return () => {
      cancelled = true;
    };
  }, [play, setMessages, onFinish]);
}
