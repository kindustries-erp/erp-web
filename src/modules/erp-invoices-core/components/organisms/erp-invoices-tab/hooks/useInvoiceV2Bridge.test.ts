import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { TableSortState } from "@/v2/shared/types/v2-table";
import { useInvoiceV2Bridge, type InvoiceListHook } from "./useInvoiceV2Bridge";

const makeListHook = () => {
  const hook = {
    page: 1,
    pageSize: 20,
    sortBy: "invoiceDate",
    sortOrder: "desc" as const,
    total: 0,
    totals: undefined,
    tableState: {
      sorts: [] as string[],
      columnFilters: {} as Record<string, string[]>,
      columnSearch: {} as Record<string, string>,
      setSort: vi.fn(),
      setColumnFilter: vi.fn(),
      setColumnSearch: vi.fn(),
    },
    filterPanel: {
      state: { dateFrom: "", dateTo: "", search: "" },
      resetAll: vi.fn(),
      setDateFrom: vi.fn(),
      setDateTo: vi.fn(),
      setSearchInput: vi.fn(),
    },
    setPage: vi.fn(),
    setPageSize: vi.fn(),
  };
  return hook as typeof hook & InvoiceListHook;
};

const baseQuery = {
  page: 1,
  pageSize: 20,
  sorts: [],
  columnFilters: {},
  columnSearch: {},
  columnOperators: {},
  dateRanges: {},
};

describe("useInvoiceV2Bridge", () => {
  it("hydrates the initial query from the V1 list state", () => {
    const listHook = makeListHook();
    const { result } = renderHook(() => useInvoiceV2Bridge(listHook));
    expect(result.current.initialQuery.page).toBe(1);
    expect(result.current.initialQuery.sorts).toEqual([
      { columnKey: "invoiceDate", direction: TableSortState.DESC },
    ]);
  });

  it("pushes page, page size, sort, filters and search into the V1 store", () => {
    const listHook = makeListHook();
    const { result } = renderHook(() => useInvoiceV2Bridge(listHook));
    act(() => {
      result.current.onQueryChange({
        ...baseQuery,
        page: 3,
        pageSize: 50,
        sorts: [{ columnKey: "totalAmount", direction: TableSortState.ASC }],
        columnFilters: { taxInvoiceStatus: ["1"] },
        columnSearch: { partner: "abc" },
        search: "hd",
      });
    });
    expect(listHook.setPage).toHaveBeenCalledWith(3);
    expect(listHook.setPageSize).toHaveBeenCalledWith(50);
    expect(listHook.tableState.setSort).toHaveBeenCalledWith(
      "totalAmount",
      "asc",
    );
    expect(listHook.tableState.setColumnFilter).toHaveBeenCalledWith(
      "taxInvoiceStatus",
      ["1"],
    );
    expect(listHook.tableState.setColumnSearch).toHaveBeenCalledWith(
      "partner",
      "abc",
    );
    expect(listHook.filterPanel.setSearchInput).toHaveBeenCalledWith("hd");
  });

  it("does not write values that did not change", () => {
    const listHook = makeListHook();
    const { result } = renderHook(() => useInvoiceV2Bridge(listHook));
    act(() => {
      result.current.onQueryChange({ ...baseQuery, page: 1, pageSize: 20 });
    });
    expect(listHook.setPage).not.toHaveBeenCalled();
    expect(listHook.setPageSize).not.toHaveBeenCalled();
    expect(listHook.filterPanel.setSearchInput).not.toHaveBeenCalled();
  });

  it("clears V1 filters and bumps tableKey so the V2 table remounts", () => {
    const listHook = makeListHook();
    const { result } = renderHook(() => useInvoiceV2Bridge(listHook));
    const before = result.current.tableKey;
    act(() => {
      result.current.clearAll();
    });
    expect(listHook.filterPanel.resetAll).toHaveBeenCalled();
    expect(listHook.setPage).toHaveBeenCalledWith(1);
    expect(result.current.tableKey).toBe(before + 1);
  });
});
