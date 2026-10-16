import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GarageDebts } from "../GarageDebts";

vi.mock("@/modules/garage/store/garageStore", () => ({
  useGarageStore: () => ({ selectedBranchId: "branch-01" }),
}));

vi.mock("@/modules/garage/hooks/useGarage", () => ({
  useGarageBranches: () => ({ data: [] }),
  useSyncGarageCaseDetail: () => ({ mutate: vi.fn() }),
}));

vi.mock("@/modules/garage/hooks/useGarageCustomersList", () => ({
  useGarageCustomersList: () => ({
    data: [],
    isLoading: false,
    sorts: [],
    setSort: vi.fn(),
    columnFilters: {},
    setColumnFilter: vi.fn(),
    columnSearch: {},
    setColumnSearch: vi.fn(),
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 1,
    setPage: vi.fn(),
    setPageSize: vi.fn(),
    refetch: vi.fn(),
    summary: {},
    activeFilterCount: 0,
    clearAllFilters: vi.fn(),
  }),
}));

vi.mock("@/modules/garage/hooks/useGarageDebtsDashboard", () => ({
  useGarageDebtsDashboard: () => ({
    summary: {},
    agingComparison: [],
    timeHorizons: {},
    forecastHorizons: {},
    cashTrend: [],
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
  }),
}));

vi.mock("../../components/organisms/garage-debts-table", () => ({
  GarageDebtsTable: () => (
    <div data-testid="garage-debts-table">Debts Table</div>
  ),
}));

vi.mock("../../components/organisms/garage-payables-table", () => ({
  GaragePayablesTable: () => (
    <div data-testid="garage-payables-table">Payables Table</div>
  ),
}));

describe("GarageDebts Page RBAC & Tabs", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  it("renders default 3 tabs (Tổng quan, Phải thu, Phải trả) without cashflow tab", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <GarageDebts />
      </QueryClientProvider>,
    );

    expect(screen.getByText("Công nợ Garage")).toBeInTheDocument();
    expect(screen.getByText("Tổng quan")).toBeInTheDocument();
    expect(screen.getByText("Phải thu")).toBeInTheDocument();
    expect(screen.getByText("Phải trả")).toBeInTheDocument();
    expect(screen.queryByText("Thu chi xưởng")).not.toBeInTheDocument();
    expect(screen.queryByText("Thu chi garage")).not.toBeInTheDocument();
  });

  it("renders receivables tab when initialTab is receivables", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <GarageDebts initialTab="receivables" />
      </QueryClientProvider>,
    );

    expect(screen.getByTestId("garage-debts-table")).toBeInTheDocument();
  });

  it("renders payables tab when initialTab is payables", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <GarageDebts initialTab="payables" />
      </QueryClientProvider>,
    );

    expect(screen.getByTestId("garage-payables-table")).toBeInTheDocument();
  });

  it("falls back to overview tab when initialTab is legacy cashflow", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <GarageDebts initialTab="cashflow" />
      </QueryClientProvider>,
    );

    expect(screen.getByText("Tổng quan")).toBeInTheDocument();
    expect(
      screen.queryByTestId("garage-cashflow-list"),
    ).not.toBeInTheDocument();
  });
});
