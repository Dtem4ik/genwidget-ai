import { tool } from "ai";

import catalog from "@/data/apartments.json";

import { type Apartment, type SearchApartmentsOutput, searchApartmentsInput } from "./schema";

const MAX_RESULTS = 6;

export const searchApartments = tool({
  description:
    "Search apartments for sale in the catalog (two residential complexes: Solara Heights, " +
    "Northbay Park). Use for ANY question about buying/finding an apartment or flat. " +
    "Returns matching apartments with prices, areas and floor plans. " +
    "An empty result is a valid answer — never invent listings.",
  inputSchema: searchApartmentsInput,
  execute: ({ rooms, minArea, maxPrice, complex }): SearchApartmentsOutput => {
    const all = catalog.apartments as Apartment[];
    const filtered = all.filter(
      (apt) =>
        (rooms === undefined || apt.rooms === rooms) &&
        (minArea === undefined || apt.area >= minArea) &&
        (maxPrice === undefined || apt.price <= maxPrice) &&
        (complex === undefined || apt.complex === complex),
    );
    const sorted = [...filtered].sort((a, b) => a.price - b.price);
    return { apartments: sorted.slice(0, MAX_RESULTS), total: filtered.length };
  },
});
