import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { V2StatCard } from "./V2StatCard";

describe("V2StatCard", () => {
  it("renders label, value and unit", () => {
    render(<V2StatCard label="Doanh thu" value="1.250" unit="₫" />);
    expect(screen.getByText("Doanh thu")).toBeInTheDocument();
    expect(screen.getByText("1.250")).toBeInTheDocument();
    expect(screen.getByText("₫")).toBeInTheDocument();
  });

  it("renders trend label with direction colour", () => {
    render(
      <V2StatCard
        label="Hóa đơn"
        value="42"
        trend={{ direction: "down", label: "-5% so với tháng trước" }}
      />,
    );
    const trend = screen.getByText("-5% so với tháng trước");
    expect(trend).toHaveClass("text-rose-600");
  });

  it("hides the value while loading", () => {
    const { container } = render(
      <V2StatCard label="Doanh thu" value="1.250" loading />,
    );
    expect(screen.queryByText("1.250")).not.toBeInTheDocument();
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
  });
});
