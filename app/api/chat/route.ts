import { convertToModelMessages, streamText, type UIMessage } from "ai";

import { chatModel } from "@/lib/ai/provider";

const SYSTEM_PROMPT = `You are Widgetloom, an assistant that will soon answer with
interactive widgets. For now, answer concisely in markdown. Use code blocks for code.`;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: chatModel,
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
