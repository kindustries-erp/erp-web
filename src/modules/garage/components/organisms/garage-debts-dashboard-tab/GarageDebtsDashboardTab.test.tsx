import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GarageDebtsDashboardTab } from "./GarageDebtsDashboardTab";

vi.mock("@/modules/garage/store/garageStore", () => ({
  useGarageStore: () => ({ selectedBranchId: "branch-01" }),
}));

vi.mock("../../../hooks/useGarageDebtsDashboard", () => ({
  useGarageDebtsDashboard: () => ({
    summary: { totalDebts: 1000000 },
    agingComparison: [],
    timeHorizons: undefined,
    forecastHorizons: undefined,
    cashTrend: [],
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
  }),
}));

vi.mock("../garage-debts-kpi-grid", () => ({
  GarageDebtsKpiGrid: () => <div data-testid="kpi-grid">KPI Grid</div>,
}));

vi.mock("../garage-debts-horizon-grid", () => ({
  GarageDebtsHorizonGrid: () => (
    <div data-testid="horizon-grid">Horizon Grid</div>
  ),
}));

vi.mock("../garage-debts-analytics-charts", () => ({
  GarageDebtsAnalyticsCharts: () => (
    <div data-testid="analytics-charts">Analytics Charts</div>
  ),
}));

vi.mock("../garage-payment-progress-card", () => ({
  GaragePaymentProgressCard: () => (
    <div data-testid="payment-progress">Payment Progress</div>
  ),
}));

vi.mock("../garage-time-horizon-detail-drawer", () => ({
  GarageTimeHorizonDetailDrawer: () => null,
}));

describe("GarageDebtsDashboardTab Organism", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  it("renders with Export button, Reload button, and WITHOUT Filter panel button", () => {
    const onExportClick = vi.fn();
    render(
      <QueryClientProvider client={queryClient}>
        <GarageDebtsDashboardTab onExportClick={onExportClick} />
      </QueryClientProvider>,
    );

    // Có tiêu đề
    expect(screen.getByText("Công nợ Garage")).toBeInTheDocument();

    // Có nút Xuất Excel
    const exportButton = screen.getByRole("button", { name: /Xuất Excel/i });
    expect(exportButton).toBeInTheDocument();

    // Có nút Tải lại (title="Tải lại")
    const reloadButton = screen.getByTitle("Tải lại");
    expect(reloadButton).toBeInTheDocument();

    // KHÔNG có nút Lọc (FilterButton)
    expect(screen.queryByTitle(/Lọc/i)).not.toBeInTheDocument();
    expect(screen.queryByText("Bộ lọc")).not.toBeInTheDocument();

    // Bấm nút Xuất Excel gọi onExportClick
    fireEvent.click(exportButton);
    expect(onExportClick).toHaveBeenCalledTimes(1);
  });
});
