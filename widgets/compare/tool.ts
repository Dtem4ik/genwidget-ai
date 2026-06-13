import { tool } from "ai";

import { type CompareProductsInput, compareProductsInput } from "./schema";

export const compareProducts = tool({
  description:
    "Compare 2-3 products side by side. Use when the user asks to compare or weigh products " +
    "(phones, laptops, cars, …). YOU generate realistic specs, pros/cons and pricing as the " +
    "arguments. Use the SAME spec labels across products so the table rows line up. Set " +
    "recommended:true on the single best pick.",
  inputSchema: compareProductsInput,
  // Passthrough — see docs/adr/adr-003-llm-generated-data.md.
  execute: (input: CompareProductsInput): CompareProductsInput => input,
});
