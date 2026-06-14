import { convertToModelMessages, stepCountIs, streamText } from "ai";

import { chatModel } from "@/lib/ai/provider";
import { type ChatUIMessage, tools } from "@/lib/ai/tools";
import { checkRateLimit } from "@/lib/rate-limit";

const clientIp = (req: Request) =>
  req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "127.0.0.1";

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
  const { success } = await checkRateLimit(clientIp(req));
  if (!success) {
    return Response.json({ error: "rate_limit", remaining: 0 }, { status: 429 });
  }

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
