import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAppStore } from "@/core/config/appStore";
import { GarageDebts } from "../GarageDebts";

vi.mock("@/modules/garage/store/garageStore", () => ({
  useGarageStore: () => ({ selectedBranchId: "branch-01" }),
}));

vi.mock("@/modules/garage/hooks/useGarage", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/modules/garage/hooks/useGarage")>();
  return {
    ...actual,
    useGarageBranches: () => ({ data: [] }),
    useSyncGarageCaseDetail: () => ({ mutate: vi.fn() }),
    useGarageCaseByCode: () => ({
      data: null,
      isLoading: false,
      refetch: vi.fn(),
    }),
    useGarageCaseGrossProfit: () => ({ data: null, isLoading: false }),
  };
});

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
  GarageDebtsTable: ({ onTabChange }: any) => (
    <div data-testid="garage-debts-table">
      Debts Table
      <button onClick={() => onTabChange?.("payables")}>
        Mock Switch to Payables
      </button>
    </div>
  ),
}));

vi.mock("../../components/organisms/garage-payables-table", () => ({
  GaragePayablesTable: () => (
    <div data-testid="garage-payables-table">Payables Table</div>
  ),
}));

vi.mock(
  "../../components/organisms/garage-cashflow-drawer/GarageCashflowDrawer",
  () => ({
    GarageCashflowDrawer: ({ open }: any) => (
      <div
        data-testid="mock-cashflow-drawer"
        data-open={open ? "true" : "false"}
      />
    ),
  }),
);

describe("GarageDebts Page RBAC & Tabs", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState(null, "", "/garage-debts");
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
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

  it("mounts GarageCashflowDrawer on page", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <GarageDebts />
      </QueryClientProvider>,
    );

    const drawer = screen.getByTestId("mock-cashflow-drawer");
    expect(drawer).toBeInTheDocument();
    expect(drawer).toHaveAttribute("data-open", "false");
  });

  it("preserves mounted views (keep-alive) when switching sub-tabs and syncs URL with appStore", () => {
    vi.useFakeTimers();
    const updateSpy = vi.fn();
    useAppStore.setState({
      currentInstanceId: "garage-debts",
      updateCurrentTabUrl: updateSpy,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <GarageDebts />
      </QueryClientProvider>,
    );

    expect(window.location.search).toContain("tab=overview");
    expect(updateSpy).toHaveBeenCalledWith(
      "garage-debts",
      "/garage-debts?tab=overview",
    );

    const receivablesTab = screen.getByRole("tab", { name: "Phải thu" });
    fireEvent.mouseDown(receivablesTab, { button: 0 });
    fireEvent.click(receivablesTab);
    expect(screen.getByTestId("garage-debts-table")).toBeInTheDocument();
    expect(window.location.search).toContain("tab=receivables");

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(updateSpy).toHaveBeenCalledWith(
      "garage-debts",
      "/garage-debts?tab=receivables",
    );

    fireEvent.click(screen.getByText("Mock Switch to Payables"));
    expect(screen.getByTestId("garage-payables-table")).toBeInTheDocument();
    // Previously mounted receivables table stays mounted in DOM (hidden)
    expect(screen.getByTestId("garage-debts-table")).toBeInTheDocument();
    expect(screen.getByTestId("garage-debts-table").parentElement).toHaveClass(
      "hidden",
    );
  });
});
