"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isStaticToolUIPart } from "ai";
import { CopyIcon, MessageSquareIcon, RefreshCwIcon, XIcon } from "lucide-react";
import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";

import { useDemoReplay } from "@/hooks/useDemoReplay";
import type { ChatUIMessage } from "@/lib/ai/tools";
import { BYOK_STORAGE_KEY, BYOKBanner } from "@/components/chat/BYOKBanner";
import { SuggestedPrompts } from "@/components/chat/SuggestedPrompts";
import { type ChatToolPart, ToolWidget } from "@/components/widgets/registry";
import { WidgetActionsProvider } from "@/components/widgets/widget-actions";
import { WidgetGrid } from "@/components/widgets/WidgetGrid";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

/**
 * Renders a message's parts, grouping consecutive tool widgets into one WidgetGrid
 * (1 → full width, 2 → two columns, 3+ → three) so multiple results lay out side by
 * side instead of stacking. Text parts render between widget runs.
 */
export function MessageParts({ message }: { message: ChatUIMessage }) {
  const blocks: ReactNode[] = [];
  let run: ChatToolPart[] = [];
  // Key each widget run by the index it STARTS at, not the part that ends it. Appending
  // a trailing text part later must not change the key, or React remounts the WidgetGrid
  // and the widget entrance animation fires a second time.
  let runStart = 0;

  const flush = () => {
    if (run.length === 0) return;
    const widgets = run;
    const key = `${message.id}-w${runStart}`;
    run = [];
    blocks.push(
      <WidgetGrid count={widgets.length} key={key}>
        {widgets.map((part) => (
          <ToolWidget key={part.toolCallId} part={part} />
        ))}
      </WidgetGrid>,
    );
  };

  message.parts.forEach((part, i) => {
    if (isStaticToolUIPart(part)) {
      if (run.length === 0) runStart = i;
      run.push(part as ChatToolPart);
      return;
    }
    flush();
    // After flush, any pending widget run is now in `blocks`; give the reply text that
    // follows a widget a little breathing room.
    const afterWidget = blocks.length > 0;
    if (part.type === "text") {
      blocks.push(
        message.role === "assistant" ? (
          <MessageResponse className={afterWidget ? "mt-2" : undefined} key={`${message.id}-${i}`}>
            {part.text}
          </MessageResponse>
        ) : (
          <span className="whitespace-pre-wrap" key={`${message.id}-${i}`}>
            {part.text}
          </span>
        ),
      );
    }
  });
  flush();

  return <>{blocks}</>;
}

/** Flattens a message's text parts (for the copy action). */
function messageText(message: ChatUIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => (part as { text: string }).text)
    .join("\n\n");
}

export function Chat() {
  const [rateLimited, setRateLimited] = useState(false);

  const [byokKey, setByokKey] = useState<string | null>(null);
  useEffect(() => {
    // localStorage isn't available during SSR, so read it after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration read
    setByokKey(localStorage.getItem(BYOK_STORAGE_KEY));
  }, []);
  const removeByok = () => {
    localStorage.removeItem(BYOK_STORAGE_KEY);
    location.reload();
  };

  // Type-to-focus: start typing anywhere (when nothing editable is focused) and the
  // chat input grabs focus, so the keystroke lands in it — like ChatGPT/Claude.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1) return;
      const el = document.activeElement as HTMLElement | null;
      const tag = el?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el?.isContentEditable) {
        return;
      }
      const input = document.querySelector<HTMLTextAreaElement>('textarea[name="message"]');
      input?.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Custom transport: attach the visitor's BYOK key (if any) per request, and detect
  // the 429 (daily limit) to surface the BYOK banner.
  const transport = useMemo(
    () =>
      new DefaultChatTransport<ChatUIMessage>({
        headers: (): Record<string, string> => {
          const key = typeof window === "undefined" ? null : localStorage.getItem(BYOK_STORAGE_KEY);
          return key ? { "x-byok-key": key } : {};
        },
        fetch: async (input, init) => {
          const res = await fetch(input as RequestInfo, init);
          if (res.status === 429) setRateLimited(true);
          return res;
        },
      }),
    [],
  );

  const { messages, sendMessage, setMessages, status, error, regenerate, stop } =
    useChat<ChatUIMessage>({ transport });

  // Landing demo: replays a scripted scenario (no API) until the user interacts.
  const [demoPlaying, setDemoPlaying] = useState(true);
  const [isLanding, setIsLanding] = useState(true);
  const onDemoFinish = useCallback(() => setDemoPlaying(false), []);
  useDemoReplay({ play: demoPlaying, setMessages, onFinish: onDemoFinish });

  // Any real interaction clears the throwaway demo and starts a fresh conversation.
  const startRealChat = useCallback(
    (text: string) => {
      if (isLanding) {
        setIsLanding(false);
        setDemoPlaying(false);
        setMessages([]);
      }
      sendMessage({ text });
    },
    [isLanding, sendMessage, setMessages],
  );

  const handleSubmit = (message: PromptInputMessage) => {
    const text = message.text.trim();
    if (!text) {
      return;
    }
    startRealChat(text);
  };

  return (
    <WidgetActionsProvider ask={(text) => sendMessage({ text })}>
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col">
        <Conversation>
          <ConversationContent>
            {messages.length === 0 && (
              <ConversationEmptyState
                icon={<MessageSquareIcon aria-hidden className="size-8" />}
                title="Welcome to GenWidget AI"
                description="Ask anything — soon the answers arrive as live widgets. For now, it talks."
              />
            )}
            {messages.map((message) => {
              // Widgets need the full message width; the default bubble is w-fit.
              const hasWidget = message.parts.some(isStaticToolUIPart);
              // Action row only in a real conversation, not on the scripted landing demo.
              const showActions = message.role === "assistant" && !isLanding;
              return (
                <Message from={message.role} key={message.id}>
                  <MessageContent className={hasWidget ? "w-full" : undefined}>
                    <MessageParts message={message} />
                  </MessageContent>
                  {showActions && (
                    <MessageActions className="opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                      <MessageAction
                        label="Copy message"
                        onClick={() => navigator.clipboard?.writeText(messageText(message))}
                        tooltip="Copy"
                      >
                        <CopyIcon aria-hidden className="size-3.5" />
                      </MessageAction>
                      <MessageAction
                        label="Regenerate response"
                        onClick={() => regenerate()}
                        tooltip="Regenerate"
                      >
                        <RefreshCwIcon aria-hidden className="size-3.5" />
                      </MessageAction>
                    </MessageActions>
                  )}
                </Message>
              );
            })}
            {status === "submitted" && (
              <div className="text-muted-foreground flex items-center gap-2 text-sm" role="status">
                <Spinner className="size-4" />
                Thinking…
              </div>
            )}
            {error && (
              <div
                className="border-destructive/50 bg-destructive/10 flex items-center justify-between gap-4 rounded-lg border px-4 py-3 text-sm"
                role="alert"
              >
                <span>Something went wrong while generating the answer.</span>
                <Button onClick={() => regenerate()} size="sm" variant="outline">
                  <RefreshCwIcon aria-hidden className="size-3.5" />
                  Retry
                </Button>
              </div>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
        <div className="bg-background sticky bottom-0 flex flex-col gap-2 px-4 pt-2 pb-5">
          {demoPlaying && (
            <p className="text-muted-foreground text-center text-xs">
              Demo mode — type anything to start your own chat
            </p>
          )}
          {isLanding && <SuggestedPrompts onSelect={startRealChat} />}
          {rateLimited && !byokKey && <BYOKBanner />}
          {byokKey && (
            <div className="text-muted-foreground flex items-center gap-1.5 self-start text-xs">
              <span className="bg-primary/10 inline-flex items-center gap-1 rounded-full px-2 py-0.5">
                Using your key
                <button
                  aria-label="Remove your key"
                  className="focus-visible:ring-ring rounded-full focus-visible:ring-2 focus-visible:outline-none"
                  onClick={removeByok}
                  type="button"
                >
                  <XIcon aria-hidden className="size-3" />
                </button>
              </span>
            </div>
          )}
          <PromptInput onSubmit={handleSubmit}>
            <PromptInputBody>
              <PromptInputTextarea
                aria-label="Message"
                className="min-h-[64px] px-4 pt-4 pb-2"
                placeholder="Ask anything…"
              />
            </PromptInputBody>
            <PromptInputFooter>
              <div />
              <PromptInputSubmit onStop={stop} status={status} />
            </PromptInputFooter>
          </PromptInput>
          <p className="text-muted-foreground/80 text-center text-xs">
            genwidget-ai is a demo — AI can make mistakes.
          </p>
        </div>
      </div>
    </WidgetActionsProvider>
  );
}
