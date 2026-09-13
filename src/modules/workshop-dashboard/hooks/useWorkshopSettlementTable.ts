import React, { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import {
  workshopDashboardApi,
  type DashboardDateParams,
  type PaginatedParams,
  type SettlementRow,
  type SettlementOrdersResponse,
} from "../api/workshopDashboardApi";

export interface WorkshopSettlementHookResult {
  data:
    | {
        items: SettlementRow[];
        total: number;
        page: number;
        totalPages: number;
      }
    | undefined;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
  tableState: ReturnType<typeof useTableColumnState>;
  page: number;
  pageSize: number;
  setPage: (p: number) => void;
  setPageSize: (ps: number) => void;
  fetchOptions: (args: {
    columnKey: string;
    search: string;
    pageParam: number;
    filtersStr?: string;
  }) => Promise<{
    items: { value: string; label: string }[];
    total: number;
    next: number | null;
  }>;
  aggregateTotals: {
    totalPreVat: number;
    totalVat: number;
    totalAmount: number;
    totalNetoff: number;
    remaining: number;
  };
}

export function useWorkshopSettlementTable(
  filterParams: DashboardDateParams & { search?: string },
  initialPage = 1,
  initialPageSize = 50,
): WorkshopSettlementHookResult {
  const tableState = useTableColumnState("workshop-settlement-table");
  const [page, setPage] = React.useState(initialPage);
  const [pageSize, setPageSize] = React.useState(initialPageSize);

  React.useEffect(() => {
    setPage(1);
  }, [
    filterParams.dateFrom,
    filterParams.dateTo,
    filterParams.branchId,
    filterParams.search,
  ]);

  React.useEffect(() => {
    setPage(1);
  }, [tableState.columnSearch, tableState.columnFilters]);

  const activeSort = tableState.sorts[0] || "";
  const normalizedSorts: string[] = [];
  if (activeSort) normalizedSorts.push(activeSort);

  const queryParams: PaginatedParams = {
    ...filterParams,
    page,
    pageSize,
    columnSearch: tableState.columnSearch,
    columnFilters: tableState.columnFilters,
    sorts: normalizedSorts,
  };

  const result = useQuery<SettlementOrdersResponse, Error>({
    queryKey: [
      "workshop-settlement-orders",
      filterParams.dateFrom,
      filterParams.dateTo,
      filterParams.branchId,
      filterParams.search,
      page,
      pageSize,
      tableState.columnSearch,
      tableState.columnFilters,
      normalizedSorts,
    ],
    queryFn: () => workshopDashboardApi.getSettlementOrders(queryParams),
    placeholderData: (prev) => prev,
  });

  const items = result.data?.items || [];

  const aggregateTotals = React.useMemo(() => {
    const NUMERIC_FIELDS: Array<
      "totalPreVat" | "totalVat" | "totalAmount" | "totalNetoff" | "remaining"
    > = ["totalPreVat", "totalVat", "totalAmount", "totalNetoff", "remaining"];
    const acc = {
      totalPreVat: 0,
      totalVat: 0,
      totalAmount: 0,
      totalNetoff: 0,
      remaining: 0,
    };
    for (const row of items) {
      for (const key of NUMERIC_FIELDS) {
        acc[key] += Number((row as SettlementRow)[key]) || 0;
      }
    }
    return acc;
  }, [items]);

  const fetchOptions = useCallback(
    async ({
      columnKey,
      search: searchTerm,
      pageParam,
      filtersStr,
    }: {
      columnKey: string;
      search: string;
      pageParam: number;
      filtersStr?: string;
    }) => {
      try {
        const res = await workshopDashboardApi.getSettlementColumnOptions({
          columnKey,
          search: searchTerm || "",
          page: pageParam || 1,
          limit: 20,
          filtersStr,
          dateFrom: filterParams.dateFrom,
          dateTo: filterParams.dateTo,
        });
        const data = res as {
          items: { value: string; label: string }[];
          total: number;
          page: number;
          totalPages: number;
        };

        const NUMERIC_QTY_COLS = new Set<string>(["invoiceCount"]);
        const NUMERIC_AMOUNT_COLS = new Set<string>([
          "totalPreVat",
          "totalVat",
          "totalAmount",
          "totalNetoff",
          "remaining",
        ]);
        const formatLabel = (raw: string, col: string): string => {
          const n = parseFloat(raw);
          if (isNaN(n)) return raw;
          if (NUMERIC_QTY_COLS.has(col))
            return Math.round(n).toLocaleString("vi-VN");
          if (NUMERIC_AMOUNT_COLS.has(col))
            return n.toLocaleString("vi-VN", { maximumFractionDigits: 0 });
          return raw;
        };

        return {
          items: (data.items || []).map((it) => ({
            value: it.value,
            label: formatLabel(it.value, columnKey),
          })),
          total: data.total,
          next: data.page < data.totalPages ? data.page + 1 : null,
        };
      } catch {
        const fallback: { value: string; label: string }[] = [];
        const seen = new Set<string>();
        const columnFilters = filtersStr
          ? JSON.parse(filtersStr || "{}")
          : tableState.columnFilters;

        for (const row of items) {
          const value = String(
            (row as unknown as Record<string, unknown>)[columnKey] ?? "",
          );
          if (!value || seen.has(value)) continue;
          if (
            searchTerm &&
            !value.toLowerCase().includes(searchTerm.toLowerCase())
          )
            continue;

          let matchedAll = true;
          for (const [fKey, fVals] of Object.entries(columnFilters || {})) {
            if (fKey === columnKey) continue;
            const arr = fVals as string[];
            if (!arr?.length) continue;
            const rowVal = String(
              (row as unknown as Record<string, unknown>)[fKey] ?? "",
            );
            if (!arr.includes(rowVal)) {
              matchedAll = false;
              break;
            }
          }
          if (!matchedAll) continue;
          seen.add(value);
          fallback.push({ value, label: value });
        }
        return { items: fallback, total: fallback.length, next: null };
      }
    },
    [
      filterParams.dateFrom,
      filterParams.dateTo,
      items,
      tableState.columnFilters,
    ],
  );

  return {
    ...result,
    tableState,
    page,
    pageSize,
    setPage,
    setPageSize,
    fetchOptions,
    aggregateTotals,
  };
}
