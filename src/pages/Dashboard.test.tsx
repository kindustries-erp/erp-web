import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Dashboard } from "./Dashboard";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { ErpResource, ErpAction } from "@/modules/system/types/rbac";

vi.mock("@/shared/hooks/useHasPermission", () => ({
  useHasPermission: vi.fn(),
}));

vi.mock("@/pages/Forbidden", () => ({
  Forbidden: () => <div data-testid="forbidden-page">403 Forbidden</div>,
}));

vi.mock("@/modules/dashboard-core/hooks/useDashboardOverview", () => ({
  useDashboardOverview: () => ({
    branches: [],
    filterConfig: { period: true, custom: [] },
    filter: { state: { dateFrom: "", dateTo: "", custom: {} } },
    loading: false,
    mergedData: {
      cashflow: {
        totalCashIn: 0,
        totalCashOut: 0,
        cashTrend: [],
        categoryBreakdown: [],
      },
      sales: { kpi: undefined, topCustomers: [], trend: [] },
      purchasing: { kpi: undefined },
      inventory: {
        totalSkus: 0,
        totalReceiptsCount: 0,
        totalIssuesCount: 0,
        lowStockCount: 0,
        zeroStockCount: 0,
        stockTrend: [],
      },
      cashTrendLabels: [],
      cashTrendIn: [],
      cashTrendOut: [],
      salesLabels: [],
      salesData: [],
      donutItems: [],
    },
    handleRefresh: vi.fn(),
    t: (key: string) => (key === "title" ? "Tổng quan" : key),
  }),
}));

vi.mock("@/shared/components/DashboardTemplate", () => ({
  DashboardTemplate: ({ title, children }: any) => (
    <div data-testid="dashboard-template">
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

vi.mock("@/modules/dashboard-core/components/DashboardTabsContent", () => ({
  DashboardTabsContent: () => (
    <div data-testid="dashboard-tabs">Tabs Content</div>
  ),
}));

describe("Dashboard RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Forbidden when user lacks DASHBOARD:READ permission", () => {
    vi.mocked(useHasPermission).mockReturnValue(false);

    render(<Dashboard />);

    expect(useHasPermission).toHaveBeenCalledWith(
      ErpResource.DASHBOARD,
      ErpAction.READ,
    );
    expect(screen.getByTestId("forbidden-page")).toBeDefined();
    expect(screen.queryByTestId("dashboard-template")).toBeNull();
  });

  it("renders DashboardContent when user has DASHBOARD:READ permission", () => {
    vi.mocked(useHasPermission).mockReturnValue(true);

    render(<Dashboard />);

    expect(useHasPermission).toHaveBeenCalledWith(
      ErpResource.DASHBOARD,
      ErpAction.READ,
    );
    expect(screen.queryByTestId("forbidden-page")).toBeNull();
    expect(screen.getByTestId("dashboard-template")).toBeDefined();
    expect(screen.getByText("Tổng quan")).toBeDefined();
  });
});
