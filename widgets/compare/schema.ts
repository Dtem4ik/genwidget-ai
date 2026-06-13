import { z } from "zod";

// NB: specs is an array of {label,value}, NOT z.record(). Gemini function-calling
// rejects JSON-schema `additionalProperties` (free-form maps) with a 400, so an
// explicit array is the portable shape — and it lets rows align by label.
export const specSchema = z.object({
  label: z.string().describe("Spec name, e.g. 'Display', 'Battery', 'Price'"),
  value: z.string().describe("Spec value, e.g. '6.1\" OLED', '3274 mAh'"),
});

export const compareProductSchema = z.object({
  name: z.string().describe("Product name, e.g. 'iPhone 15 Pro'"),
  category: z.string().describe("Category: phone, laptop, car, etc. — drives the icon"),
  price: z.number().positive().describe("Price in USD"),
  specs: z
    .array(specSchema)
    .describe("4-6 specs. Use the SAME labels across all products so rows line up."),
  pros: z.array(z.string()).describe("2-3 advantages"),
  cons: z.array(z.string()).describe("1-2 drawbacks"),
  imageQuery: z.string().describe("Short photo query — used for alt text only"),
  recommended: z.boolean().optional().describe("true on the single best pick"),
});

export type CompareProduct = z.infer<typeof compareProductSchema>;

export const compareProductsInput = z.object({
  question: z.string().describe("What the user asked to compare"),
  products: z.array(compareProductSchema).min(2).max(3).describe("2-3 products to compare"),
});

export type CompareProductsInput = z.infer<typeof compareProductsInput>;

// execute() is a passthrough — output mirrors the validated input.
export type CompareProductsOutput = CompareProductsInput;
