import type { InferUITools, ToolSet, UIDataTypes, UIMessage } from "ai";

import { showApartments } from "@/widgets/apartments/tool";
import { compareProducts } from "@/widgets/compare/tool";
import { setFilters } from "@/widgets/filters/tool";
import { recommendProduct } from "@/widgets/recommend/tool";
import { getStockOrCrypto } from "@/widgets/stock/tool";
import { getWeather } from "@/widgets/weather/tool";

// Every widget pack contributes exactly one entry here.
export const tools = {
  showApartments,
  compareProducts,
  recommendProduct,
  getWeather,
  getStockOrCrypto,
  setFilters,
} satisfies ToolSet;

export type ChatTools = InferUITools<typeof tools>;

/** Chat message type shared by the API route and the client. */
export type ChatUIMessage = UIMessage<unknown, UIDataTypes, ChatTools>;
