import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GarageCashflowTabKey } from "@/shared/constants/urlParams";
import { useTableColumnStore } from "@/shared/hooks/useTableColumnState";
import { useGarageStore } from "../../../store/garageStore";
import { useGarageCashflowTable } from "./GarageCashflowTable.hook";

vi.mock("../../../api/garageCashflowApi", () => ({
  garageCashflowApi: {
    getList: vi.fn().mockResolvedValue({
      data: [],
      total: 0,
      totalPages: 0,
    }),
    getOptions: vi.fn().mockResolvedValue({
      items: [],
      total: 0,
      totalPages: 1,
    }),
  },
}));

vi.mock("./GarageCashflowTable.mutations", () => ({
  useGarageCashflowMutations: () => ({
    createMutation: { mutate: vi.fn(), isPending: false },
    updateMutation: { mutate: vi.fn(), isPending: false },
    deleteMutation: { mutate: vi.fn(), isPending: false },
  }),
}));

describe("useGarageCashflowTable state preservation across unmount/remount", () => {
  let wrapper: React.FC<{ children: React.ReactNode }>;

  beforeEach(() => {
    vi.clearAllMocks();
    useTableColumnStore.setState({ tables: {} });
    useGarageStore.setState({ tableUiState: {} });
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    wrapper = ({ children }) =>
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        children,
      );
  });

  it("preserves filters, search, sorts, dateRanges, page, and pageSize after unmount & remount", () => {
    const first = renderHook(
      () => useGarageCashflowTable({ tabKey: GarageCashflowTabKey.VOUCHERS }),
      { wrapper },
    );

    act(() => {
      first.result.current.setColumnFilter("status", ["PAID"]);
      first.result.current.setColumnSearch("voucherCode", "PT-GARA");
      first.result.current.setSort("transDate", "desc");
      first.result.current.setDateRange(
        "transDate",
        "2026-11-01",
        "2026-11-28",
      );
      first.result.current.setPageSize(50);
      first.result.current.setPage(3);
    });

    // Simulate switching away to another topbar tab
    first.unmount();

    // Simulate switching back to garage-cashflow?tab=vouchers
    const second = renderHook(
      () => useGarageCashflowTable({ tabKey: GarageCashflowTabKey.VOUCHERS }),
      { wrapper },
    );

    expect(second.result.current.columnFilters).toEqual({ status: ["PAID"] });
    expect(second.result.current.columnSearch).toEqual({
      voucherCode: "PT-GARA",
    });
    expect(second.result.current.sorts).toEqual(["-transDate"]);
    expect(second.result.current.getDateRange("transDate")).toEqual({
      from: "2026-11-01",
      to: "2026-11-28",
    });
    expect(second.result.current.pageSize).toBe(50);
    expect(second.result.current.page).toBe(3);
    expect(second.result.current.activeFilterCount).toBe(3);
  });

  it("isolates state between vouchers and forecast tables", () => {
    const vouchers = renderHook(
      () => useGarageCashflowTable({ tabKey: GarageCashflowTabKey.VOUCHERS }),
      { wrapper },
    );
    const forecast = renderHook(
      () => useGarageCashflowTable({ tabKey: GarageCashflowTabKey.FORECAST }),
      { wrapper },
    );

    act(() => {
      vouchers.result.current.setColumnFilter("status", ["PAID"]);
    });

    expect(vouchers.result.current.columnFilters).toEqual({ status: ["PAID"] });
    expect(forecast.result.current.columnFilters).toEqual({});
  });
});
