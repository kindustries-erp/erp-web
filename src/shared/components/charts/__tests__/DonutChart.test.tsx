import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DonutLegend } from "../DonutChart";

describe("DonutLegend", () => {
  it("renders items with duplicate labels safely without duplicate key collision", () => {
    const items = [
      { label: "Đang làm", value: 10, color: "#3b82f6" },
      { label: "Đang làm", value: 20, color: "#6366f1" },
      { label: "Báo giá", value: 5, color: "#f59e0b" },
      { label: "Báo giá", value: 15, color: "#ef4444" },
    ];

    const { container } = render(<DonutLegend items={items} />);
    const textElements = screen.getAllByText("Đang làm");
    expect(textElements).toHaveLength(2);

    const baoGiaElements = screen.getAllByText("Báo giá");
    expect(baoGiaElements).toHaveLength(2);

    // Verify all children rendered
    expect(
      container.querySelectorAll(".flex.items-center.justify-between"),
    ).toHaveLength(4);
  });

  it("calls onClick handler when clicking legend item", () => {
    const handleClick = vi.fn();
    const items = [
      { id: "item-1", label: "Hoàn tất", value: 50, color: "#10b981" },
      { id: "item-2", label: "Đang làm", value: 50, color: "#3b82f6" },
    ];

    render(
      <DonutLegend
        items={items}
        onClick={handleClick}
        valueFormatter={(val) => `${val}%`}
      />,
    );

    const item = screen.getByText("Hoàn tất");
    fireEvent.click(item);

    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith(items[0]);
  });
});
