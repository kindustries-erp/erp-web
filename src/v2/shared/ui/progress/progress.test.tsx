import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Progress } from "./progress";

describe("Progress", () => {
  it("exposes its value to assistive tech", () => {
    render(<Progress value={40} aria-label="Tiến độ" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "40",
    );
  });

  it("moves the indicator according to the value", () => {
    const { container } = render(<Progress value={25} />);
    const indicator = container.querySelector("[data-state]")!
      .firstElementChild as HTMLElement;
    expect(indicator.style.transform).toBe("translateX(-75%)");
  });
});
