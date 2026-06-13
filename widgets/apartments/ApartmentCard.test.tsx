import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ApartmentCard } from "./component";
import { floorPlanByRooms } from "./floor-plan";
import { photoUrl } from "./listing-photo";
import type { ApartmentItem } from "./schema";
import { ApartmentResultsSkeleton } from "./skeleton";

const apartment: ApartmentItem = {
  title: "Bright 2-room near Rothschild Blvd",
  location: "Lev HaIr, Tel Aviv",
  rooms: 2,
  area: 62,
  floor: 3,
  totalFloors: 6,
  price: 385000,
  features: ["balcony", "renovated"],
  imageQuery: "modern 2 bedroom apartment tel aviv interior",
};

describe("ApartmentCard photo", () => {
  it("renders an img whose src is the keyless photo URL for this card", () => {
    render(<ApartmentCard apartment={apartment} index={0} />);
    const img = screen.getByRole("img", { name: apartment.title });
    expect(img).toHaveAttribute("src", photoUrl(apartment.imageQuery, 1));
    expect(img.getAttribute("src")).toContain("loremflickr.com");
  });
});

describe("ApartmentCard floor plan toggle", () => {
  it("is hidden by default and reveals the floor plan image on click", () => {
    render(<ApartmentCard apartment={apartment} index={0} />);

    expect(screen.queryByRole("img", { name: /floor plan/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /show floor plan/i }));

    const plan = screen.getByRole("img", { name: /floor plan/i });
    expect(plan).toHaveAttribute("src", `/floorplans/${floorPlanByRooms(apartment.rooms)}.svg`);

    fireEvent.click(screen.getByRole("button", { name: /hide floor plan/i }));
    expect(screen.queryByRole("img", { name: /floor plan/i })).not.toBeInTheDocument();
  });
});

describe("floorPlanByRooms", () => {
  it("maps room counts to the five curated plans", () => {
    expect(floorPlanByRooms(0)).toBe("studio");
    expect(floorPlanByRooms(1)).toBe("1br");
    expect(floorPlanByRooms(2)).toBe("2br");
    expect(floorPlanByRooms(3)).toBe("3br");
    expect(floorPlanByRooms(4)).toBe("penthouse");
  });
});

describe("ApartmentResultsSkeleton", () => {
  it("reserves a fixed-height photo slot so the layout does not shift on load", () => {
    const { container } = render(<ApartmentResultsSkeleton />);
    // Default 2 placeholder cards, each leading with an h-40 photo slot.
    const photoSlots = container.querySelectorAll(".h-40");
    expect(photoSlots.length).toBe(2);
  });
});
