import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { V2Sparkline } from "./V2Sparkline";
import { buildSparklinePoints } from "./V2Sparkline.helper";

describe("buildSparklinePoints", () => {
  it("returns no points for fewer than two values", () => {
    expect(buildSparklinePoints([], 100, 20)).toEqual([]);
    expect(buildSparklinePoints([5], 100, 20)).toEqual([]);
  });

  it("spans the width with the max at the top and the min at the bottom", () => {
    const points = buildSparklinePoints([0, 10], 100, 30, 5);
    expect(points[0]).toEqual({ x: 5, y: 25 });
    expect(points[1]).toEqual({ x: 95, y: 5 });
  });

  it("draws a flat line in the middle for constant values", () => {
    const points = buildSparklinePoints([3, 3, 3], 100, 30);
    expect(points.every((p) => p.y === 15)).toBe(true);
  });
});

describe("V2Sparkline", () => {
  it("renders an accessible svg with a 2px line and an end dot", () => {
    const { container } = render(
      <V2Sparkline
        values={[1, 3, 2, 5]}
        ariaLabel="Doanh thu 4 kỳ"
        color="#eb6834"
      />,
    );
    expect(
      screen.getByRole("img", { name: "Doanh thu 4 kỳ" }),
    ).toBeInTheDocument();
    expect(container.querySelector("polyline")).toHaveAttribute(
      "stroke-width",
      "2",
    );
    expect(container.querySelector("circle")).toHaveAttribute("r", "4");
  });

  it("renders nothing without enough data", () => {
    const { container } = render(<V2Sparkline values={[1]} ariaLabel="x" />);
    expect(container).toBeEmptyDOMElement();
  });
});
