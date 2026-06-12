import { convertToModelMessages, stepCountIs, streamText } from "ai";

import { chatModel } from "@/lib/ai/provider";
import { type ChatUIMessage, tools } from "@/lib/ai/tools";

const SYSTEM_PROMPT = `You are GenWidget AI, an assistant that answers with interactive
widgets rendered from your tool calls.

Rules:
- When the user asks about apartments or flats (e.g. "2-bedroom under $200k"),
  call searchApartments. The widget shows the results — after the tool call, add at
  most one short sentence of commentary; never repeat listing details as text.
- If a tool returns zero results, say so briefly and suggest loosening one filter.
- For everything else, answer concisely in markdown. Use code blocks for code.`;

export async function POST(req: Request) {
  const { messages }: { messages: ChatUIMessage[] } = await req.json();

  const result = streamText({
    model: chatModel,
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    tools,
    stopWhen: stepCountIs(3),
  });

  return result.toUIMessageStreamResponse();
}
