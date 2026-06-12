import { z } from "zod";

export const searchApartmentsInput = z.object({
  rooms: z
    .number()
    .int()
    .min(1)
    .max(4)
    .optional()
    .describe("Exact number of rooms (bedrooms + living room), 1-4. '2-bedroom' means rooms: 2."),
  minArea: z.number().positive().optional().describe("Minimum total area in square meters"),
  maxPrice: z.number().positive().optional().describe("Maximum price in USD, e.g. 200000"),
  complex: z
    .enum(["Solara Heights", "Northbay Park"])
    .optional()
    .describe("Residential complex name, only if the user mentions one"),
});

export type SearchApartmentsInput = z.infer<typeof searchApartmentsInput>;

export interface FloorPlanRoom {
  id: string;
  label: string;
  area: number;
  /** Closed polygon, plan units: [[x, y], ...] */
  polygon: number[][];
}

export interface FloorPlan {
  width: number;
  height: number;
  rooms: FloorPlanRoom[];
}

export interface Apartment {
  id: string;
  complex: string;
  district: string;
  rooms: number;
  area: number;
  floor: number;
  totalFloors: number;
  price: number;
  currency: string;
  pricePerM2: number;
  features: string[];
  floorPlan: FloorPlan;
}

export interface SearchApartmentsOutput {
  apartments: Apartment[];
  /** Total matches before truncation to the result limit */
  total: number;
}
