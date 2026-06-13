import { tool } from "ai";

import { type ShowApartmentsInput, showApartmentsInput } from "./schema";

export const showApartments = tool({
  description:
    "Display apartment listings for sale. Use for ANY request about finding or buying an " +
    "apartment or flat. YOU generate the listings as the arguments: invent realistic, varied " +
    "apartments that match the user's criteria (location, rooms, budget) with plausible prices, " +
    "areas and floors, and a fitting photo query per listing. Generate 3-6 listings.",
  inputSchema: showApartmentsInput,
  // Passthrough: the model generates the data as arguments; zod validates it, we return it.
  // No catalog, no external API — see docs/adr/adr-003-llm-generated-data.md.
  execute: (input: ShowApartmentsInput): ShowApartmentsInput => input,
});
