"use client";

import { useChat } from "@ai-sdk/react";
import { isStaticToolUIPart } from "ai";
import { MessageSquareIcon, RefreshCwIcon } from "lucide-react";

import type { ChatUIMessage } from "@/lib/ai/tools";
import { ToolWidget } from "@/components/widgets/registry";

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

export function Chat() {
  const { messages, sendMessage, status, error, regenerate, stop } = useChat<ChatUIMessage>();

  const handleSubmit = (message: PromptInputMessage) => {
    const text = message.text.trim();
    if (!text) {
      return;
    }
    sendMessage({ text });
  };

  return (
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
          {messages.map((message) => (
            <Message from={message.role} key={message.id}>
              <MessageContent>
                {message.parts.map((part, i) => {
                  if (part.type === "text") {
                    return message.role === "assistant" ? (
                      <MessageResponse key={`${message.id}-${i}`}>{part.text}</MessageResponse>
                    ) : (
                      <span className="whitespace-pre-wrap" key={`${message.id}-${i}`}>
                        {part.text}
                      </span>
                    );
                  }
                  if (isStaticToolUIPart(part)) {
                    return <ToolWidget key={part.toolCallId} part={part} />;
                  }
                  return null;
                })}
              </MessageContent>
            </Message>
          ))}
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
      <div className="px-4 pb-4">
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
  );
}
