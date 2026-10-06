import { describe, it, expect, vi } from "vitest";
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

describe("GarageDebts Page", () => {
  it("renders GarageDebts page with overview tab by default", () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <GarageDebts />
      </QueryClientProvider>,
    );

    expect(screen.getByText("Công nợ Garage")).toBeInTheDocument();
    expect(screen.getByText("Tổng quan")).toBeInTheDocument();
    expect(screen.getByText("Khách hàng")).toBeInTheDocument();
  });
});
