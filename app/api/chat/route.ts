import { convertToModelMessages, stepCountIs, streamText, UI_MESSAGE_STREAM_HEADERS } from "ai";
import { after } from "next/server";

import { getChatModel } from "@/lib/ai/provider";
import { type ChatUIMessage, tools } from "@/lib/ai/tools";
import { getCachedStream, isCacheablePrompt, setCachedStream } from "@/lib/cache";
import { checkRateLimit } from "@/lib/rate-limit";

const clientIp = (req: Request) =>
  req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "127.0.0.1";

// Visitor's own Google AI Studio key (kept only in their browser). Never logged.
const byokKey = (req: Request) => {
  const key = req.headers.get("x-byok-key")?.trim();
  return key && key.startsWith("AIza") ? key : undefined;
};

const lastUserText = (messages: ChatUIMessage[]) => {
  const last = messages.filter((m) => m.role === "user").at(-1);
  const part = last?.parts.find((p) => p.type === "text");
  return part && "text" in part ? part.text : "";
};

const SYSTEM_PROMPT = `You are GenWidget AI, an assistant that answers with interactive
widgets rendered from your tool calls.

Rules:
- When the user asks about apartments or flats (e.g. "2-bedroom in Tel Aviv under $400k"),
  call showApartments and GENERATE 3-6 realistic, varied listings matching their request
  (location, rooms, budget) directly as the tool arguments.
- When the user asks to COMPARE products (e.g. "iPhone 15 Pro vs Pixel 9 vs Galaxy S25"),
  call compareProducts and generate 2-3 products with the SAME spec labels across all of
  them, pros/cons and pricing; set recommended:true on the best pick.
- When the user asks for the BEST/recommended single product for a need (e.g. "best laptop
  under $1500 for a developer"), call recommendProduct with the pick and 2 cheaper
  alternatives (each with its tradeoff).
- When the user asks about WEATHER/temperature for a place, call getWeather with the city.
- When the user asks about a PRICE or how an asset is doing (crypto or stock), call
  getStockOrCrypto: for crypto pass the CoinGecko id (e.g. 'bitcoin'), for stocks the
  ticker (e.g. 'AAPL'), plus a human name.
- When the user gives a VAGUE refinement (e.g. "something roomier and cheaper"), call
  setFilters to turn it into toggleable filter chips (mark matching ones active).
- getWeather and getStockOrCrypto return LIVE data — never invent their values.
- After any tool call, the widget shows the result — add at most one short sentence of
  commentary; never repeat the widget's data as text.
- For everything else, answer concisely in markdown. Use code blocks for code.`;

export async function POST(req: Request) {
  const key = byokKey(req);
  const { messages }: { messages: ChatUIMessage[] } = await req.json();
  const prompt = lastUserText(messages);

  // Cache hit: replay the stored stream instantly. Doesn't consume the daily quota.
  const cached = await getCachedStream(prompt);
  if (cached) {
    return new Response(cached, { headers: UI_MESSAGE_STREAM_HEADERS });
  }

  // BYOK requests run on the visitor's own quota, so they skip our daily limit.
  if (!key) {
    const { success } = await checkRateLimit(clientIp(req));
    if (!success) {
      return Response.json({ error: "rate_limit", remaining: 0 }, { status: 429 });
    }
  }

  const result = streamText({
    model: getChatModel(key),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    tools,
    stopWhen: stepCountIs(3),
  });

  const response = result.toUIMessageStreamResponse();

  // Cache the response for suggested prompts: tee the stream, send one branch to the
  // client live, capture the other after the response completes.
  if (response.body && isCacheablePrompt(prompt)) {
    const [toClient, toCache] = response.body.tee();
    after(async () => {
      const body = await new Response(toCache).text();
      await setCachedStream(prompt, body);
    });
    return new Response(toClient, { headers: response.headers });
  }

  return response;
}
