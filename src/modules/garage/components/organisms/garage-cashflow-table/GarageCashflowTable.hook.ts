import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import {
  useGarageCashflowList,
  useDeleteGarageCashflow,
} from "@/modules/garage/hooks/useGarageCashflowQuery";
import { garageCashflowApi } from "@/modules/garage/api/garageCashflowApi";
import { buildGarageCashflowColumns } from "./GarageCashflowTable.columns";
import { buildCashflowSummaryRow } from "./GarageCashflowTable.summary";
import { buildCashflowRowActions } from "./GarageCashflowTable.actions";
import type { GarageCashflowTableProps } from "./GarageCashflowTable.type";

export function useGarageCashflowTable(props: GarageCashflowTableProps) {
  const { t } = useTranslation(["garage", "common"]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [activeStatusTab, setActiveStatusTab] = useState("all");
  const [dateRanges, setDateRanges] = useState<
    Record<string, { from?: string; to?: string }>
  >({});

  const tableState = useTableColumnState("garage-cashflow-table");

  const handleDateRangeChange = useCallback(
    (col: string, range: { from?: string; to?: string }) => {
      setDateRanges((prev) => ({ ...prev, [col]: range }));
      setPage(1);
    },
    [],
  );

  const handleSortChange = useCallback(
    (key: string, state: "asc" | "desc" | "none") => {
      tableState.setSort(key, state);
      setPage(1);
    },
    [tableState],
  );

  const handleSearchChange = useCallback(
    (key: string, search: string) => {
      tableState.setColumnSearch(key, search);
      setPage(1);
    },
    [tableState],
  );

  const handleFilterChange = useCallback(
    (key: string, filters: string[]) => {
      tableState.setColumnFilter(key, filters);
      setPage(1);
    },
    [tableState],
  );

  const serverFiltersStr = useMemo(() => {
    const combined: Record<string, string[]> = { ...tableState.columnFilters };

    Object.entries(tableState.columnSearch).forEach(([key, searchVal]) => {
      const s = typeof searchVal === "string" ? searchVal.trim() : "";
      if (s && (!combined[key] || combined[key].length === 0)) {
        combined[key] = ["__ALL_MATCHING__", s];
      }
    });

    Object.entries(dateRanges).forEach(([key, range]) => {
      if (range?.from || range?.to) {
        combined[key] = [`${range.from || ""}..${range.to || ""}`];
      }
    });

    return Object.keys(combined).length > 0
      ? JSON.stringify(combined)
      : undefined;
  }, [tableState.columnFilters, tableState.columnSearch, dateRanges]);

  const activeFilterCount = useMemo(() => {
    const dateCount = Object.values(dateRanges).filter(
      (r) => r?.from || r?.to,
    ).length;
    return (tableState.activeFilterCount || 0) + dateCount;
  }, [tableState.activeFilterCount, dateRanges]);

  const handleClearAllFilters = useCallback(() => {
    tableState.resetFilters();
    setDateRanges({});
    setPage(1);
  }, [tableState]);

  const { data, isLoading, isFetching, refetch } = useGarageCashflowList({
    page,
    pageSize,
    filtersStr: serverFiltersStr,
    sorts: tableState.sorts.length > 0 ? tableState.sorts : undefined,
    statusTab: activeStatusTab !== "all" ? activeStatusTab : undefined,
  });

  const deleteMutation = useDeleteGarageCashflow();

  const fetchCashflowColumnOptions = useCallback(
    async ({
      columnKey,
      search,
      pageParam = 1,
      filtersStr,
    }: {
      columnKey: string;
      search: string;
      pageParam: number;
      filtersStr?: string;
    }) => {
      const res = await garageCashflowApi.getColumnOptions({
        column: columnKey,
        search,
        page: pageParam,
        pageSize: 20,
        filtersStr,
        statusTab: activeStatusTab !== "all" ? activeStatusTab : undefined,
      });

      return {
        items: (res?.items || []).map((item: any) =>
          typeof item === "object" && item !== null
            ? item
            : { label: String(item), value: String(item) },
        ),
        total: res?.total || 0,
        next: res?.page < res?.totalPages ? res.page + 1 : null,
      };
    },
    [activeStatusTab],
  );

  const items = data?.items || [];
  const total = data?.total || 0;
  const stats = data?.stats;

  const columnContext = useMemo(
    () => ({
      t: (key: string, def?: string) => t(key, { defaultValue: def }) as string,
      tableState,
      dateRanges,
      onDateRangeChange: handleDateRangeChange,
      onSortChange: handleSortChange,
      onSearchChange: handleSearchChange,
      onFilterChange: handleFilterChange,
      fetchCashflowColumnOptions,
      onOpenCase: props.onOpenCase,
      onEdit: props.onEdit,
      onDelete: props.onDelete,
    }),
    [
      t,
      tableState,
      dateRanges,
      handleDateRangeChange,
      handleSortChange,
      handleSearchChange,
      handleFilterChange,
      fetchCashflowColumnOptions,
      props.onOpenCase,
      props.onEdit,
      props.onDelete,
    ],
  );

  const columns = useMemo(
    () => buildGarageCashflowColumns(columnContext),
    [columnContext],
  );
  const rowActions = useMemo(
    () => buildCashflowRowActions(columnContext),
    [columnContext],
  );
  const summaryRow = useMemo(
    () =>
      buildCashflowSummaryRow({
        items,
        stats,
        page,
        pageSize,
        total,
        t: (key: string, def?: string) =>
          t(key, { defaultValue: def }) as string,
      }),
    [items, stats, page, pageSize, total, t],
  );

  return {
    t,
    items,
    total,
    page,
    setPage,
    pageSize,
    setPageSize,
    columns,
    summaryRow,
    rowActions,
    activeStatusTab,
    setActiveStatusTab,
    activeFilterCount,
    handleClearAllFilters,
    isLoading: isLoading || isFetching,
    refetch,
    deleteMutation,
  };
}
