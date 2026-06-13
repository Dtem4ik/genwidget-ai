import { z } from "zod";

// specs is an array of {label,value} — Gemini rejects z.record/additionalProperties.
const specSchema = z.object({
  label: z.string().describe("Spec name, e.g. 'CPU', 'RAM', 'Weight'"),
  value: z.string().describe("Spec value, e.g. 'M3 Pro', '18GB', '1.6kg'"),
});

const alternativeSchema = z.object({
  name: z.string().describe("Alternative product name"),
  price: z.number().positive().describe("Price in USD"),
  tradeoff: z.string().describe("One line: what you give up vs the main pick"),
});

// alternatives is a TOP-LEVEL sibling of product (not nested) and optional. flash-lite
// tends to emit it at the top level and sometimes omits it; nesting + min(1) made
// validation hard-fail and the widget error out. Flatter + optional is reliable.
export const recommendProductInput = z.object({
  userNeed: z.string().describe("The user's need, restated briefly"),
  product: z.object({
    name: z.string().describe("Recommended product name"),
    category: z.string().describe("Category: laptop, phone, car, … — drives the icon"),
    price: z.number().positive().describe("Price in USD"),
    reason: z.string().describe("Why this is the best pick for the user's need, 1-2 sentences"),
    specs: z.array(specSchema).max(6).describe("Up to 6 key specs"),
    imageQuery: z.string().describe("Short photo query — used for alt text only"),
  }),
  alternatives: z
    .array(alternativeSchema)
    .max(2)
    .default([])
    .describe("Up to 2 cheaper/simpler alternatives, each with its tradeoff"),
});

export type RecommendProductInput = z.infer<typeof recommendProductInput>;

// execute() is a passthrough — output mirrors the validated input.
export type RecommendProductOutput = RecommendProductInput;
