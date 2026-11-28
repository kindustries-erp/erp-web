import { useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { GarageCashflowTabKey } from "@/shared/constants/urlParams";
import { useGarageStore } from "../../../store/garageStore";
import { garageCashflowApi } from "../../../api/garageCashflowApi";
import type { GarageCashflowVoucher } from "../../../api/garageCashflowApi";
import { garageCashflowListKey } from "../../../hooks/garageCashflowQueries";
import { useGarageCashflowMutations } from "./GarageCashflowTable.mutations";

export const getDefaultPageSize = (): number =>
  typeof window !== "undefined" && window.innerHeight >= 900 ? 50 : 20;

const EMPTY_DATE_RANGES: Record<string, { from?: string; to?: string }> = {};

export interface UseGarageCashflowTableOptions {
  tabKey?:
    | GarageCashflowTabKey.VOUCHERS
    | GarageCashflowTabKey.FORECAST
    | "vouchers"
    | "forecast";
}

export function useGarageCashflowTable({
  tabKey = GarageCashflowTabKey.VOUCHERS,
}: UseGarageCashflowTableOptions = {}) {
  const tableId = `garage-cashflow-table-${tabKey}`;
  const tableState = useTableColumnState(tableId);

  const tableUi = useGarageStore((s) => s.tableUiState[tableId]);
  const page = tableUi?.page ?? 1;
  const pageSize = tableUi?.pageSize ?? getDefaultPageSize();
  const dateRanges = tableUi?.dateRanges ?? EMPTY_DATE_RANGES;

  const setPage = useCallback(
    (nextPage: number) => {
      useGarageStore.getState().setTablePage(tableId, nextPage);
    },
    [tableId],
  );

  const setPageSize = useCallback(
    (nextSize: number) => {
      useGarageStore.getState().setTablePageSize(tableId, nextSize);
    },
    [tableId],
  );

  const serverFilters = useMemo(() => {
    const combined: Record<string, string[]> = { ...tableState.columnFilters };
    // "Chọn tất cả kết quả tìm kiếm" gửi sentinel; từ khóa đã đi qua column_search.
    Object.keys(combined).forEach((key) => {
      if (combined[key]?.[0] === "__ALL_MATCHING__") delete combined[key];
    });
    Object.entries(dateRanges).forEach(([key, range]) => {
      if (range?.from || range?.to)
        combined[key] = [`${range.from || ""}..${range.to || ""}`];
    });
    return combined;
  }, [tableState.columnFilters, dateRanges]);

  const queryKey = [
    garageCashflowListKey(tabKey),
    page,
    pageSize,
    tableState.sorts,
    serverFilters,
    tableState.columnSearch,
  ];

  const { data, isLoading, refetch } = useQuery({
    queryKey,
    queryFn: () =>
      garageCashflowApi.getList({
        tab: tabKey,
        page,
        pageSize,
        sorts:
          tableState.sorts.length > 0 ? tableState.sorts.join(",") : undefined,
        column_filters: Object.keys(serverFilters).length
          ? JSON.stringify(serverFilters)
          : undefined,
        column_search: Object.keys(tableState.columnSearch).length
          ? JSON.stringify(tableState.columnSearch)
          : undefined,
      }),
  });

  const { createMutation, updateMutation, deleteMutation } =
    useGarageCashflowMutations();

  const setSort = useCallback(
    (key: string, state: "asc" | "desc" | "none") => {
      tableState.setSort(key, state);
      useGarageStore.getState().setTablePage(tableId, 1);
    },
    [tableState, tableId],
  );

  const toggleSort = useCallback(
    (field: string) => {
      tableState.toggleSort(field);
      useGarageStore.getState().setTablePage(tableId, 1);
    },
    [tableState, tableId],
  );

  const setColumnFilter = useCallback(
    (key: string, vals: string[]) => {
      tableState.setColumnFilter(key, vals);
      useGarageStore.getState().setTablePage(tableId, 1);
    },
    [tableState, tableId],
  );

  const setColumnSearchVal = useCallback(
    (key: string, val: string) => {
      tableState.setColumnSearch(key, val);
      useGarageStore.getState().setTablePage(tableId, 1);
    },
    [tableState, tableId],
  );

  const setDateRange = useCallback(
    (key: string, from?: string, to?: string) => {
      useGarageStore.getState().setTableDateRange(tableId, key, from, to);
    },
    [tableId],
  );

  const getDateRange = useCallback(
    (key: string) => dateRanges[key] || { from: "", to: "" },
    [dateRanges],
  );

  const activeFilterCount = useMemo(() => {
    const rangeCnt = Object.values(dateRanges).filter(
      (r) => r?.from || r?.to,
    ).length;
    return (tableState.activeFilterCount || 0) + rangeCnt;
  }, [tableState.activeFilterCount, dateRanges]);

  const clearAllFilters = useCallback(() => {
    tableState.resetFilters();
    useGarageStore.getState().resetTableDateRanges(tableId);
  }, [tableState, tableId]);

  const getColumnOptions = async ({
    columnKey,
    search,
    pageParam = 1,
    pageSize: reqPageSize = 20,
  }: {
    columnKey: string;
    search?: string;
    pageParam?: number;
    pageSize?: number;
  }) => {
    const filtersWithoutCurrent = { ...serverFilters };
    delete filtersWithoutCurrent[columnKey];
    const res = await garageCashflowApi.getOptions(
      columnKey,
      search || "",
      pageParam,
      reqPageSize,
      Object.keys(filtersWithoutCurrent).length
        ? JSON.stringify(filtersWithoutCurrent)
        : undefined,
      tabKey,
    );
    return {
      items: res.items.map((i: string) => ({ label: i, value: i })),
      total: res.total,
      next: pageParam < res.totalPages ? pageParam + 1 : null,
    };
  };

  return {
    data: (data?.data ?? []) as GarageCashflowVoucher[],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 0,
    totals: data?.totals,
    isLoading,
    page,
    setPage,
    pageSize,
    setPageSize,
    sorts: tableState.sorts,
    setSort,
    toggleSort,
    columnFilters: tableState.columnFilters,
    setColumnFilter,
    columnSearch: tableState.columnSearch,
    setColumnSearch: setColumnSearchVal,
    dateRanges,
    setDateRange,
    getDateRange,
    serverFilters,
    activeFilterCount,
    clearAllFilters,
    refetch,
    getColumnOptions,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
