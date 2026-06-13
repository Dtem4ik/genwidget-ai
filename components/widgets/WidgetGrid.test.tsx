import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { WidgetGrid } from "./WidgetGrid";

const gridClass = (count: number) => {
  const { container } = render(
    <WidgetGrid count={count}>
      <div />
    </WidgetGrid>,
  );
  return (container.firstChild as HTMLElement).className;
};

describe("WidgetGrid column count", () => {
  it("renders a single column for 1 item", () => {
    const cls = gridClass(1);
    expect(cls).toContain("grid-cols-1");
    expect(cls).not.toContain("sm:grid-cols-2");
  });

  it("renders up to 2 columns for 2 items", () => {
    const cls = gridClass(2);
    expect(cls).toContain("sm:grid-cols-2");
    expect(cls).not.toContain("lg:grid-cols-3");
  });

  it("renders up to 3 columns for 3+ items", () => {
    const cls = gridClass(5);
    expect(cls).toContain("sm:grid-cols-2");
    expect(cls).toContain("lg:grid-cols-3");
  });

  it("always starts single-column (mobile-first)", () => {
    expect(gridClass(3)).toContain("grid-cols-1");
  });
});
