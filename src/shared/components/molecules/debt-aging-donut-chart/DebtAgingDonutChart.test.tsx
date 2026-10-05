import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { DebtAgingDonutChart } from "./DebtAgingDonutChart";

describe("DebtAgingDonutChart", () => {
  it("renders fully settled message when totalBalance is 0", () => {
    render(<DebtAgingDonutChart items={[]} totalBalance={0} />);
    expect(screen.getByText("Đã tất toán toàn bộ")).toBeInTheDocument();
  });

  it("renders donut legend when totalBalance > 0", () => {
    render(
      <DebtAgingDonutChart
        items={[
          { label: "0-30 ngày", value: 5000000, color: "#10b981" },
          { label: "31-60 ngày", value: 3000000, color: "#f59e0b" },
        ]}
        totalBalance={8000000}
      />,
    );
    expect(screen.getByText("0-30 ngày")).toBeInTheDocument();
    expect(screen.getByText("31-60 ngày")).toBeInTheDocument();
  });
});
