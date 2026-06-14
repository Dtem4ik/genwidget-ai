"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isStaticToolUIPart } from "ai";
import { MessageSquareIcon, RefreshCwIcon } from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";

import type { ChatUIMessage } from "@/lib/ai/tools";
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
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
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

  const flush = (key: string) => {
    if (run.length === 0) return;
    const widgets = run;
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
      run.push(part as ChatToolPart);
      return;
    }
    flush(`${message.id}-w${i}`);
    if (part.type === "text") {
      blocks.push(
        message.role === "assistant" ? (
          <MessageResponse key={`${message.id}-${i}`}>{part.text}</MessageResponse>
        ) : (
          <span className="whitespace-pre-wrap" key={`${message.id}-${i}`}>
            {part.text}
          </span>
        ),
      );
    }
  });
  flush(`${message.id}-wend`);

  return <>{blocks}</>;
}

export function Chat() {
  const [rateLimited, setRateLimited] = useState(false);

  // Custom transport so we can detect the 429 (daily limit) and surface the BYOK banner.
  const transport = useMemo(
    () =>
      new DefaultChatTransport<ChatUIMessage>({
        fetch: async (input, init) => {
          const res = await fetch(input as RequestInfo, init);
          if (res.status === 429) setRateLimited(true);
          return res;
        },
      }),
    [],
  );

  const { messages, sendMessage, status, error, regenerate, stop } = useChat<ChatUIMessage>({
    transport,
  });

  const handleSubmit = (message: PromptInputMessage) => {
    const text = message.text.trim();
    if (!text) {
      return;
    }
    sendMessage({ text });
  };

  return (
    <WidgetActionsProvider ask={(text) => sendMessage({ text })}>
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
        <Conversation>
          <ConversationContent>
            {messages.length === 0 && (
              <ConversationEmptyState
                icon={<MessageSquareIcon className="size-8" />}
                title="Welcome to GenWidget AI"
                description="Ask anything — soon the answers arrive as live widgets. For now, it talks."
              />
            )}
            {messages.map((message) => {
              // Widgets need the full message width; the default bubble is w-fit.
              const hasWidget = message.parts.some(isStaticToolUIPart);
              return (
                <Message from={message.role} key={message.id}>
                  <MessageContent className={hasWidget ? "w-full" : undefined}>
                    <MessageParts message={message} />
                  </MessageContent>
                </Message>
              );
            })}
            {status === "submitted" && (
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Spinner className="size-4" />
                Thinking…
              </div>
            )}
            {error && (
              <div className="border-destructive/50 bg-destructive/10 flex items-center justify-between gap-4 rounded-lg border px-4 py-3 text-sm">
                <span>Something went wrong while generating the answer.</span>
                <Button onClick={() => regenerate()} size="sm" variant="outline">
                  <RefreshCwIcon className="size-3.5" />
                  Retry
                </Button>
              </div>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
        <div className="flex flex-col gap-2 px-4 pb-4">
          {messages.length === 0 && <SuggestedPrompts onSelect={(text) => sendMessage({ text })} />}
          {rateLimited && (
            <div className="border-primary/40 bg-primary/5 rounded-lg border px-4 py-3 text-sm">
              You&apos;ve used today&apos;s 10 free messages. Paste your own Gemini key below to
              continue ↓
            </div>
          )}
          <PromptInput onSubmit={handleSubmit}>
            <PromptInputBody>
              <PromptInputTextarea placeholder="Ask anything…" />
            </PromptInputBody>
            <PromptInputFooter>
              <div />
              <PromptInputSubmit onStop={stop} status={status} />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </WidgetActionsProvider>
  );
}
