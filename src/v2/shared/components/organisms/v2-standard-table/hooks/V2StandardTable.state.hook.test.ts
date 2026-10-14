import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import {
  NumberFilterOperator,
  TableSortState,
} from "@/v2/shared/types/v2-table";
import { useV2TableState } from "./V2StandardTable.state.hook";

const setup = (onQueryChange?: () => void) =>
  renderHook(() =>
    useV2TableState({ initialQuery: { pageSize: 20 }, onQueryChange }),
  );

describe("useV2TableState", () => {
  it("setPage only changes the page and clamps to 1", () => {
    const { result } = setup();
    act(() => result.current.setPage(4));
    expect(result.current.query.page).toBe(4);
    act(() => result.current.setPage(-2));
    expect(result.current.query.page).toBe(1);
  });

  it("resets to page 1 when filters, sort or page size change", () => {
    const { result } = setup();
    act(() => result.current.setPage(3));
    act(() => result.current.setColumnFilter("code", ["A"]));
    expect(result.current.query.page).toBe(1);

    act(() => result.current.setPage(3));
    act(() => result.current.setSort("code", TableSortState.DESC));
    expect(result.current.query.page).toBe(1);

    act(() => result.current.setPage(3));
    act(() => result.current.setPageSize(50));
    expect(result.current).toMatchObject({ query: { page: 1, pageSize: 50 } });
  });

  it("keeps a single sort and removes it on NONE", () => {
    const { result } = setup();
    act(() => result.current.setSort("a", TableSortState.ASC));
    act(() => result.current.setSort("b", TableSortState.DESC));
    expect(result.current.query.sorts).toEqual([
      { columnKey: "b", direction: TableSortState.DESC },
    ]);
    expect(result.current.getSort("b")).toBe(TableSortState.DESC);
    expect(result.current.getSort("a")).toBe(TableSortState.NONE);
    act(() => result.current.setSort("b", TableSortState.NONE));
    expect(result.current.query.sorts).toEqual([]);
  });

  it("counts active filters per column and drops empty values", () => {
    const { result } = setup();
    act(() => result.current.setColumnFilter("code", ["A", "B"]));
    act(() => result.current.setColumnSearch("code", "HD"));
    act(() =>
      result.current.setColumnOperator("qty", {
        operator: NumberFilterOperator.GREATER_THAN,
        value: "3",
      }),
    );
    act(() => result.current.setDateRange("day", { from: "2026-01-01" }));
    expect(result.current.activeFilterCount).toBe(3);

    act(() => result.current.setColumnFilter("code", []));
    act(() => result.current.setColumnSearch("code", "   "));
    act(() => result.current.setDateRange("day", {}));
    expect(result.current.activeFilterCount).toBe(1);
    expect(result.current.query.columnFilters).toEqual({});
  });

  it("clearColumn removes every filter of one column only", () => {
    const { result } = setup();
    act(() => result.current.setColumnFilter("a", ["x"]));
    act(() => result.current.setColumnSearch("a", "x"));
    act(() => result.current.setColumnFilter("b", ["y"]));
    act(() => result.current.clearColumn("a"));
    expect(result.current.query.columnFilters).toEqual({ b: ["y"] });
    expect(result.current.query.columnSearch).toEqual({});
  });

  it("resetAll clears filters, keeps sort and page size, returns to page 1", () => {
    const { result } = setup();
    act(() => result.current.setSort("a", TableSortState.ASC));
    act(() => result.current.setColumnFilter("a", ["x"]));
    act(() => result.current.setPage(5));
    act(() => result.current.resetAll());
    expect(result.current.activeFilterCount).toBe(0);
    expect(result.current.query).toMatchObject({
      page: 1,
      pageSize: 20,
      sorts: [{ columnKey: "a", direction: TableSortState.ASC }],
    });
  });

  it("emits onQueryChange only after a real change, with the latest query", () => {
    const onQueryChange = vi.fn();
    const { result } = setup(onQueryChange);
    expect(onQueryChange).not.toHaveBeenCalled();
    act(() => result.current.setPage(2));
    expect(onQueryChange).toHaveBeenCalledTimes(1);
    expect(onQueryChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 2 }),
    );
  });

  it("keeps setter references stable across renders", () => {
    const { result, rerender } = setup();
    const first = result.current.setColumnFilter;
    rerender();
    expect(result.current.setColumnFilter).toBe(first);
  });
});
