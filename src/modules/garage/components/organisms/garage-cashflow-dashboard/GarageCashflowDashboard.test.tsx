import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { GarageCashflowDashboard } from "./GarageCashflowDashboard";

vi.mock("./GarageCashflowDashboard.hook", () => ({
  useGarageCashflowDashboard: () => ({
    t: (key: string, fallback?: string) => fallback || key,
    filterConfig: { period: true, custom: [] },
    filter: { state: { custom: {} }, setField: vi.fn(), reset: vi.fn() },
    data: {
      kpi: {
        totalIn: 1000000,
        totalOut: 500000,
        netCashflow: 500000,
        totalVouchers: 10,
        inCount: 6,
        outCount: 4,
      },
      methodBreakdown: { in: [], out: [] },
      contentBreakdown: { in: [], out: [] },
      trend: [],
      topTransactions: { in: [], out: [] },
    },
    isLoading: false,
    isFetching: false,
    handleRefresh: vi.fn(),
    selectedVoucher: null,
    setSelectedVoucher: vi.fn(),
    selectedCaseCode: null,
    setSelectedCaseCode: vi.fn(),
    handleOpenItem: vi.fn(),
    handleOpenCase: vi.fn(),
  }),
}));

vi.mock("@/shared/components/DashboardTemplate", () => ({
  DashboardTemplate: ({ title, children }: any) => (
    <div data-testid="mock-dashboard-template">
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

vi.mock("../garage-cashflow-kpi-cards", () => ({
  GarageCashflowKpiCards: () => <div data-testid="mock-kpi-cards" />,
}));

vi.mock("../garage-cashflow-trend-panel", () => ({
  GarageCashflowTrendPanel: () => <div data-testid="mock-trend-panel" />,
}));

vi.mock("../garage-cashflow-breakdown-panels", () => ({
  GarageCashflowBreakdownPanels: () => (
    <div data-testid="mock-breakdown-panels" />
  ),
}));

vi.mock("../garage-cashflow-top-txns-table", () => ({
  GarageCashflowTopTxnsTable: () => <div data-testid="mock-top-txns-table" />,
}));

vi.mock("../garage-cashflow-drawer/GarageCashflowDrawer", () => ({
  GarageCashflowDrawer: () => <div data-testid="mock-cashflow-drawer" />,
}));

vi.mock("../../GarageCaseStandaloneDrawer", () => ({
  GarageCaseStandaloneDrawer: () => <div data-testid="mock-case-drawer" />,
}));

describe("GarageCashflowDashboard", () => {
  it("renders DashboardTemplate with child organism panels", () => {
    render(<GarageCashflowDashboard />);

    expect(screen.getByTestId("mock-dashboard-template")).toBeInTheDocument();
    expect(screen.getByTestId("mock-kpi-cards")).toBeInTheDocument();
    expect(screen.getByTestId("mock-trend-panel")).toBeInTheDocument();
    expect(screen.getByTestId("mock-breakdown-panels")).toBeInTheDocument();
    expect(screen.getByTestId("mock-top-txns-table")).toBeInTheDocument();
  });
});
