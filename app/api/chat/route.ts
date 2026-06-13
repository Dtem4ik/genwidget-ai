import { convertToModelMessages, stepCountIs, streamText } from "ai";

import { chatModel } from "@/lib/ai/provider";
import { type ChatUIMessage, tools } from "@/lib/ai/tools";

const SYSTEM_PROMPT = `You are GenWidget AI, an assistant that answers with interactive
widgets rendered from your tool calls.

Rules:
- When the user asks about apartments or flats (e.g. "2-bedroom in Tel Aviv under $400k"),
  call showApartments and GENERATE 3-6 realistic, varied listings matching their request
  (location, rooms, budget) directly as the tool arguments.
- When the user asks to COMPARE products (e.g. "iPhone 15 Pro vs Pixel 9 vs Galaxy S25"),
  call compareProducts and generate 2-3 products with the SAME spec labels across all of
  them, pros/cons and pricing; set recommended:true on the best pick.
- After any tool call, the widget shows the result — add at most one short sentence of
  commentary; never repeat the widget's data as text.
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
