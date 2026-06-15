import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SpecList, WidgetCard } from "./primitives";

describe("WidgetCard", () => {
  it("renders the shared shell classes, merges className, and forwards props", () => {
    const { getByTestId } = render(
      <WidgetCard aria-busy="true" className="gap-4" data-testid="card">
        <span>child</span>
      </WidgetCard>,
    );
    const el = getByTestId("card");
    for (const cls of ["w-full", "p-4", "sm:p-5", "rounded-xl", "border", "bg-card", "gap-4"]) {
      expect(el.className.split(/\s+/)).toContain(cls);
    }
    expect(el.tagName).toBe("SECTION");
    expect(el).toHaveAttribute("aria-busy", "true");
    expect(el).toHaveTextContent("child");
  });
});

describe("SpecList", () => {
  it("renders each label/value pair as a dt/dd", () => {
    const { container } = render(
      <SpecList
        specs={[
          { label: "RAM", value: "16GB" },
          { label: "Storage", value: "512GB" },
        ]}
      />,
    );
    expect(container.querySelectorAll("dt")).toHaveLength(2);
    expect(container.querySelectorAll("dd")).toHaveLength(2);
    expect(container).toHaveTextContent("RAM");
    expect(container).toHaveTextContent("16GB");
  });

  it("renders nothing when there are no specs", () => {
    const { container } = render(<SpecList specs={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
