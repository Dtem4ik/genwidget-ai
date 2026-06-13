import { tool } from "ai";

import { type RecommendProductInput, recommendProductInput } from "./schema";

export const recommendProduct = tool({
  description:
    "Recommend the single best product for the user's stated need (e.g. 'best laptop under " +
    "$1500 for a developer'). YOU generate the pick — name, price, why it fits, key specs — " +
    "plus 2 cheaper/simpler alternatives, each with the tradeoff, as the arguments.",
  inputSchema: recommendProductInput,
  // Passthrough — see docs/adr/adr-003-llm-generated-data.md.
  execute: (input: RecommendProductInput): RecommendProductInput => input,
});
