import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GarageDashboard } from "../GarageDashboard";

// Mock Chart and Sparkline
vi.mock("react-chartjs-2", () => ({
  Chart: () => <div data-testid="mock-chart" />,
  Bar: () => <div data-testid="mock-bar" />,
  Line: () => <div data-testid="mock-line" />,
  Doughnut: () => <div data-testid="mock-doughnut" />,
}));

vi.mock("@/shared/components/KpiSparkline", () => ({
  KpiSparkline: () => <div data-testid="mock-sparkline" />,
}));

vi.mock("@/modules/garage/components/GarageExportDrawer", () => ({
  GarageExportDrawer: ({
    open,
    defaultReportType,
  }: {
    open: boolean;
    defaultReportType: string;
  }) => (
    <div
      data-testid="export-drawer"
      data-open={open ? "true" : "false"}
      data-report-type={defaultReportType}
    />
  ),
}));

// Mock các API call
vi.mock("@/modules/garage/api/garageDashboardApi", () => ({
  garageDashboardApi: {
    getStats: vi.fn().mockResolvedValue({
      summary: {
        totalCases: 10,
        inProgressCases: 3,
        completedCases: 6,
        cancelledCases: 1,
        totalRevenue: 50000000,
        totalCost: 30000000,
        grossProfit: 20000000,
        grossMarginRate: 40,
        kyGuiRate: 20,
        avgDaysToComplete: 2.5,
      },
      funnel: {
        totalIntake: { count: 10, amount: 50000000, rate: 100 },
        inProgress: { count: 3, amount: 15000000, rate: 30 },
        completed: { count: 6, amount: 30000000, rate: 60 },
        cancelled: { count: 1, amount: 5000000, rate: 10 },
        byClassification: {},
      },
      byMonth: {},
      availableMonths: ["2026-08", "2026-09"],
      statusDistribution: [],
      classificationDistribution: [],
      trend: [],
      collectionSummary: {
        totalBilled: 50000000,
        totalPaid: 40000000,
        collectionRate: 80,
      },
      costPaymentSummary: {
        totalCost: 30000000,
        totalPaidCost: 25000000,
        paymentRate: 83.3,
      },
    }),
  },
}));

vi.mock("@/modules/garage/api/garageOpexApi", () => ({
  garageOpexApi: {
    getPnlReport: vi.fn().mockResolvedValue({
      caseCount: 6,
      revenue: 30000000,
      cogs: 18000000,
      grossProfit: 12000000,
      grossMarginRate: 40,
      opex: { total: 5000000, items: [] },
      netProfitBeforeCommission: 7000000,
      commission: {
        total: 700000,
        auto: {
          kyGuiProfitRate: 20,
          saleCommission: 140000,
          dvCommission: 560000,
        },
        items: [],
      },
      netProfitAfterCommission: 6300000,
      netMarginRate: 21,
    }),
    exportPnlExcel: vi.fn(),
  },
}));

describe("GarageDashboard Atomic Refactor", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  it("renders GarageDashboard page container and sections properly", async () => {
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <GarageDashboard />
      </QueryClientProvider>,
    );

    expect(container).toBeTruthy();
  });

  it("nút chính Đồng bộ + dropdown: Xuất Excel mở drawer xuất chung, mặc định Tổng hợp tất cả", async () => {
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={queryClient}>
        <GarageDashboard />
      </QueryClientProvider>,
    );

    const openStates = () =>
      screen.getAllByTestId("export-drawer").map((el) => el.dataset.open);

    // Checkpoint drawer cũng chứa một drawer xuất (đóng sẵn), nên có thể có nhiều phần tử
    expect(openStates().every((open) => open === "false")).toBe(true);
    // Không còn nút "Xuất Excel" riêng ở header
    expect(
      screen.queryByRole("button", { name: /Xuất Excel|Export Excel/ }),
    ).toBeNull();

    await user.click(screen.getByRole("button", { name: /Đồng bộ|Sync/ }));
    expect(screen.getByText("Báo cáo & Xuất file")).toBeDefined();
    await user.click(screen.getByText("Xuất Excel"));

    const opened = screen
      .getAllByTestId("export-drawer")
      .filter((el) => el.dataset.open === "true");
    expect(opened).toHaveLength(1);
    expect(opened[0].dataset.reportType).toBe("period-all");
  });
});
