import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GarageDebts } from "../GarageDebts";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { ErpResource, ErpAction } from "@/modules/system/types/rbac";

vi.mock("@/shared/hooks/useHasPermission", () => ({
  useHasPermission: vi.fn(),
}));

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

vi.mock("../../components/organisms/garage-cashflow-list", () => ({
  GarageCashflowList: (props: any) => (
    <div data-testid="garage-cashflow-list" data-active-tab={props.activeTab}>
      Garage Cashflow List
    </div>
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

  it("renders default tabs without cashflow when user lacks GARAGE_CASHFLOW:READ", () => {
    vi.mocked(useHasPermission).mockReturnValue(false);

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
  });

  it("renders cashflow tab when user has GARAGE_CASHFLOW:READ permission", () => {
    vi.mocked(useHasPermission).mockImplementation(
      (resource: string, action?: string) => {
        if (
          resource === ErpResource.GARAGE_CASHFLOW &&
          action === ErpAction.READ
        ) {
          return true;
        }
        return false;
      },
    );

    render(
      <QueryClientProvider client={queryClient}>
        <GarageDebts />
      </QueryClientProvider>,
    );

    expect(screen.getByText("Tổng quan")).toBeInTheDocument();
    expect(screen.getByText("Phải thu")).toBeInTheDocument();
    expect(screen.getByText("Phải trả")).toBeInTheDocument();
    expect(screen.getByText("Thu chi xưởng")).toBeInTheDocument();
  });

  it("renders GarageCashflowList when active tab is cashflow and user has permission", () => {
    vi.mocked(useHasPermission).mockImplementation(
      (resource: string, action?: string) => {
        if (
          resource === ErpResource.GARAGE_CASHFLOW &&
          action === ErpAction.READ
        ) {
          return true;
        }
        return false;
      },
    );

    render(
      <QueryClientProvider client={queryClient}>
        <GarageDebts initialTab="cashflow" />
      </QueryClientProvider>,
    );

    expect(screen.getByTestId("garage-cashflow-list")).toBeInTheDocument();
  });

  it("falls back to overview tab when initialTab is cashflow but user lacks permission", () => {
    vi.mocked(useHasPermission).mockReturnValue(false);

    render(
      <QueryClientProvider client={queryClient}>
        <GarageDebts initialTab="cashflow" />
      </QueryClientProvider>,
    );

    expect(
      screen.queryByTestId("garage-cashflow-list"),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Tổng quan")).toBeInTheDocument();
  });
});
