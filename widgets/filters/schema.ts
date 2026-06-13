import { z } from "zod";

export const filterSchema = z.object({
  key: z.string().describe("Machine key, e.g. 'maxPrice', 'minRooms'"),
  label: z.string().describe("Human chip label, e.g. 'Under $300k', '3+ rooms'"),
  value: z.string().describe("Value, e.g. '300000', '3'"),
  active: z.boolean().describe("Whether the chip starts toggled on"),
});

export type Filter = z.infer<typeof filterSchema>;

export const setFiltersInput = z.object({
  context: z
    .string()
    .describe("Short label for what's being refined, e.g. 'Refining apartment search'"),
  filters: z
    .array(filterSchema)
    .min(1)
    .max(6)
    .describe("Filters to present as toggleable chips, derived from the user's request"),
});

export type SetFiltersInput = z.infer<typeof setFiltersInput>;

// execute() is a passthrough — output mirrors the validated input.
export type SetFiltersOutput = SetFiltersInput;
