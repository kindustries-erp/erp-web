import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useUnifiedTableFilter } from "../useUnifiedTableFilter";
import { getDropdownSearchState } from "@/shared/components/DataTable/TableColumnHeaderFilter";

describe("useUnifiedTableFilter", () => {
  const dummyColumns = [
    {
      key: "invoiceNo",
      header: "Số HĐ",
    },
    {
      key: "partnerName",
      header: "Bên bán",
    },
  ];

  it("produces 1 chip and activeFilterCount = 1 when only columnSearch is active on a column", () => {
    const listHook = {
      sorts: [],
      setSort: () => {},
      columnFilters: {},
      setColumnFilter: () => {},
      columnSearch: { invoiceNo: "1187" },
      setColumnSearch: () => {},
    };

    const { result } = renderHook(() =>
      useUnifiedTableFilter({
        columns: dummyColumns as any,
        listHook: listHook as any,
      }),
    );

    expect(result.current.activeFilterCount).toBe(1);
    expect(result.current.activeChips).toHaveLength(1);
    expect(result.current.activeChips[0].id).toBe("search-invoiceNo");
    expect(result.current.activeChips[0].valueDisplay).toBe('"1187"');
  });

  it("produces 1 chip and activeFilterCount = 1 when only columnFilters is active on a column", () => {
    const listHook = {
      sorts: [],
      setSort: () => {},
      columnFilters: { invoiceNo: ["1187", "1188"] },
      setColumnFilter: () => {},
      columnSearch: {},
      setColumnSearch: () => {},
    };

    const { result } = renderHook(() =>
      useUnifiedTableFilter({
        columns: dummyColumns as any,
        listHook: listHook as any,
      }),
    );

    expect(result.current.activeFilterCount).toBe(1);
    expect(result.current.activeChips).toHaveLength(1);
    expect(result.current.activeChips[0].id).toBe("filter-invoiceNo");
    expect(result.current.activeChips[0].valueDisplay).toBe("1187, 1188");
  });

  it("deduplicates chips and keeps activeFilterCount = 1 when 1 column has BOTH columnSearch and columnFilters", () => {
    const listHook = {
      sorts: [],
      setSort: () => {},
      columnFilters: { invoiceNo: ["1187"] },
      setColumnFilter: () => {},
      columnSearch: { invoiceNo: "1187" },
      setColumnSearch: () => {},
    };

    const { result } = renderHook(() =>
      useUnifiedTableFilter({
        columns: dummyColumns as any,
        listHook: listHook as any,
      }),
    );

    // CRITICAL: Must count as 1 filter, NOT 2!
    expect(result.current.activeFilterCount).toBe(1);
    expect(result.current.activeChips).toHaveLength(1);
    expect(result.current.activeChips[0].id).toBe("filter-invoiceNo");
    expect(result.current.activeChips[0].valueDisplay).toBe("1187");
  });

  it("shows (Khớp keyword) and activeFilterCount = 1 in __ALL_MATCHING__ mode", () => {
    const listHook = {
      sorts: [],
      setSort: () => {},
      columnFilters: { invoiceNo: ["__ALL_MATCHING__", '"1";"5"'] },
      setColumnFilter: () => {},
      columnSearch: { invoiceNo: '"1";"5"' },
      setColumnSearch: () => {},
    };

    const { result } = renderHook(() =>
      useUnifiedTableFilter({
        columns: dummyColumns as any,
        listHook: listHook as any,
      }),
    );

    expect(result.current.activeFilterCount).toBe(1);
    expect(result.current.activeChips).toHaveLength(1);
    expect(result.current.activeChips[0].id).toBe("filter-invoiceNo");
    expect(result.current.activeChips[0].valueDisplay).toBe('(Khớp ""1";"5"")');
  });

  it("removeChip clears both filter, search, and dropdownSearchState for the column", () => {
    let colFiltersState: Record<string, string[]> = { invoiceNo: ["1187"] };
    let colSearchState: Record<string, string> = { invoiceNo: "1187" };

    const listHook = {
      sorts: [],
      setSort: () => {},
      columnFilters: colFiltersState,
      setColumnFilter: (key: string, vals: string[]) => {
        colFiltersState = { ...colFiltersState, [key]: vals };
      },
      columnSearch: colSearchState,
      setColumnSearch: (key: string, val: string) => {
        colSearchState = { ...colSearchState, [key]: val };
      },
    };

    const { result } = renderHook(() =>
      useUnifiedTableFilter({
        columns: dummyColumns as any,
        listHook: listHook as any,
      }),
    );

    act(() => {
      result.current.removeChip("filter-invoiceNo");
    });

    expect(colFiltersState["invoiceNo"]).toEqual([]);
    expect(colSearchState["invoiceNo"]).toBe("");
    expect(getDropdownSearchState("invoiceNo")).toBe("");
  });

  it("formats composite filter values with ::: into friendly labels without exposing ::: separator", () => {
    const listHook = {
      sorts: [],
      setSort: () => {},
      columnFilters: { invoiceNo: ["1066:::C25MDP", ":::C25THP"] },
      setColumnFilter: () => {},
      columnSearch: {},
      setColumnSearch: () => {},
    };

    const { result } = renderHook(() =>
      useUnifiedTableFilter({
        columns: dummyColumns as any,
        listHook: listHook as any,
      }),
    );

    expect(result.current.activeFilterCount).toBe(1);
    expect(result.current.activeChips).toHaveLength(1);
    expect(result.current.activeChips[0].id).toBe("filter-invoiceNo");
    // Should format "1066:::C25MDP" -> "1066 (C25MDP)" and ":::C25THP" -> "(C25THP)"
    expect(result.current.activeChips[0].valueDisplay).toBe(
      "1066 (C25MDP), (C25THP)",
    );
  });
});
