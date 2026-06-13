import { z } from "zod";

export const apartmentSchema = z.object({
  title: z.string().describe("Short listing title, e.g. 'Bright 2-room near Rothschild Blvd'"),
  location: z.string().describe("Neighborhood and city, e.g. 'Florentin, Tel Aviv'"),
  rooms: z.number().int().min(0).max(5).describe("Number of rooms; 0 means studio"),
  area: z.number().positive().describe("Total area in square meters"),
  floor: z.number().int().min(0).describe("Floor the apartment is on"),
  totalFloors: z.number().int().min(1).describe("Total floors in the building"),
  price: z.number().positive().describe("Price in USD"),
  features: z
    .array(z.string())
    .describe("2-4 short feature tags, e.g. 'balcony', 'parking', 'renovated'"),
  imageQuery: z
    .string()
    .describe(
      "Short photo search query for this listing, e.g. 'modern apartment living room tel aviv' " +
        "or 'luxury studio interior'. Make it specific to the apartment.",
    ),
});

export type ApartmentItem = z.infer<typeof apartmentSchema>;

export const showApartmentsInput = z.object({
  apartments: z
    .array(apartmentSchema)
    .min(1)
    .max(6)
    .describe("The apartment listings to display, generated to match the user's request"),
});

export type ShowApartmentsInput = z.infer<typeof showApartmentsInput>;

// execute() is a passthrough — output mirrors the validated input.
export type ShowApartmentsOutput = ShowApartmentsInput;
