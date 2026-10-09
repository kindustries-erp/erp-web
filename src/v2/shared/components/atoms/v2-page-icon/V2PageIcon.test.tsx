import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { V2PageIcon } from "./V2PageIcon";

describe("V2PageIcon", () => {
  it("renders its child inside a rounded primary-tinted box", () => {
    render(
      <V2PageIcon data-testid="page-icon">
        <svg data-testid="icon-svg" />
      </V2PageIcon>,
    );

    const box = screen.getByTestId("page-icon");
    expect(box).toContainElement(screen.getByTestId("icon-svg"));
    expect(box).toHaveClass("bg-primary/10", "text-primary", "rounded-xl");
  });

  it("merges a custom className", () => {
    render(
      <V2PageIcon data-testid="page-icon" className="custom-x">
        <span />
      </V2PageIcon>,
    );

    expect(screen.getByTestId("page-icon")).toHaveClass("custom-x");
  });
});
