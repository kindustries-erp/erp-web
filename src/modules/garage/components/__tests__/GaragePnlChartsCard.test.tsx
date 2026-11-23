import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GaragePnlChartsCard } from "../GaragePnlCharts/GaragePnlChartsCard";

// Mock translation hook
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
}));

// Mock chart theme
vi.mock("@/shared/utils/chartTheme", () => ({
  useChartTheme: () => ({ isDark: false }),
}));

// Mock useGaragePnlTrend hook
vi.mock("../../hooks/useGaragePnlTrend", () => ({
  useGaragePnlTrend: () => ({
    data: [
      {
        year: 2026,
        month: 10,
        label: "2026-thg 10",
        revenue: 100_000_000,
        cogs: 60_000_000,
        grossProfit: 40_000_000,
        grossMarginRatio: 0.4,
        ratios: {
          cogs: 0.6,
          nhanSu: 0.15,
          matBang: 0.1,
          vatTu: 0.05,
          baoTri: 0.04,
          khauHao: 0.03,
          khac: 0.03,
        },
      },
    ],
    isLoading: false,
  }),
}));

// Mock BarChart
vi.mock("@/shared/components/charts/BarChart", () => ({
  BarChart: () => <div data-testid="mock-bar-chart" />,
}));

describe("GaragePnlChartsCard", () => {
  it("mặc định hiển thị Báo cáo lợi nhuận với icon trend", () => {
    render(<GaragePnlChartsCard year={2026} month={10} />);

    // Kiểm tra icon trend hiện diện
    expect(screen.getByTestId("icon-trend")).toBeDefined();
    // Section trend chart hiển thị
    expect(screen.getByTestId("section-trend-chart")).toBeDefined();
    // Section ratio chart không hiển thị
    expect(screen.queryByTestId("section-ratio-chart")).toBeNull();
  });

  it("chuyển sang xem Tỷ trọng 100% doanh thu khi click nhãn hoặc gạt switch", () => {
    render(<GaragePnlChartsCard year={2026} month={10} />);

    // Click vào nhãn "Tỷ trọng các chỉ số trên 100% doanh thu"
    const ratioLabel = screen.getByTestId("switch-to-ratio");
    fireEvent.click(ratioLabel);

    // Section ratio chart hiển thị kèm icon ratio
    expect(screen.getByTestId("section-ratio-chart")).toBeDefined();
    expect(screen.getByTestId("icon-ratio")).toBeDefined();
    // Section trend chart biến mất
    expect(screen.queryByTestId("section-trend-chart")).toBeNull();

    // Click lại vào nhãn "Báo cáo lợi nhuận"
    const trendLabel = screen.getByTestId("switch-to-trend");
    fireEvent.click(trendLabel);

    // Section trend chart hiển thị lại
    expect(screen.getByTestId("section-trend-chart")).toBeDefined();
    expect(screen.getByTestId("icon-trend")).toBeDefined();
    expect(screen.queryByTestId("section-ratio-chart")).toBeNull();
  });
});
