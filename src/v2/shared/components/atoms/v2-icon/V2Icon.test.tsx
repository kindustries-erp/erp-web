import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { V2Icon } from "./V2Icon";
import { LayoutDashboard, Car } from "./icons";

describe("V2Icon Atom Component", () => {
  it("renders icon correctly with default size", () => {
    render(<V2Icon icon={LayoutDashboard} data-testid="test-dashboard-icon" />);
    const icon = screen.getByTestId("test-dashboard-icon");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute("width", "16");
    expect(icon).toHaveAttribute("height", "16");
  });

  it("applies custom size and className", () => {
    render(
      <V2Icon
        icon={Car}
        size={24}
        className="text-primary custom-icon-class"
        data-testid="test-car-icon"
      />,
    );
    const icon = screen.getByTestId("test-car-icon");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute("width", "24");
    expect(icon).toHaveAttribute("height", "24");
    expect(icon).toHaveClass("custom-icon-class");
  });

  it("returns null when no icon is provided", () => {
    const { container } = render(<V2Icon />);
    expect(container.firstChild).toBeNull();
  });

  it("supports aria-label for accessibility", () => {
    render(
      <V2Icon
        icon={LayoutDashboard}
        aria-label="Bảng điều khiển"
        data-testid="test-a11y-icon"
      />,
    );
    const icon = screen.getByTestId("test-a11y-icon");
    expect(icon).toHaveAttribute("aria-label", "Bảng điều khiển");
    expect(icon).toHaveAttribute("aria-hidden", "false");
  });
});
