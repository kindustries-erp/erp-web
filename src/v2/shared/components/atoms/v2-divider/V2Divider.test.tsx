import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { V2Divider } from "./V2Divider";

describe("V2Divider", () => {
  it("is a hidden-from-a11y vertical line by default", () => {
    render(<V2Divider data-testid="divider" />);

    const divider = screen.getByTestId("divider");
    expect(divider).toHaveAttribute("aria-hidden");
    expect(divider).toHaveClass("h-4", "w-px", "bg-border");
  });

  it("supports horizontal orientation and merges className", () => {
    render(
      <V2Divider
        data-testid="divider"
        orientation="horizontal"
        className="my-2"
      />,
    );

    const divider = screen.getByTestId("divider");
    expect(divider).toHaveClass("h-px", "w-full", "my-2");
  });
});
