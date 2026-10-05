import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { GarageDebtsAnalyticsCharts } from "./GarageDebtsAnalyticsCharts";

describe("GarageDebtsAnalyticsCharts", () => {
  it("renders section header and chart panels", () => {
    render(
      <GarageDebtsAnalyticsCharts
        cashTrend={[]}
        agingComparison={[]}
        isLoading={false}
      />,
    );

    expect(
      screen.getByText("Biến động & Phân tích Công nợ"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Biến động Doanh thu/Chi phí & Dòng tiền ròng"),
    ).toBeInTheDocument();
    expect(screen.getByText("Ma trận so sánh Tuổi nợ")).toBeInTheDocument();
    expect(screen.getByText("Cơ cấu Phân bổ Tuổi nợ")).toBeInTheDocument();
  });
});
