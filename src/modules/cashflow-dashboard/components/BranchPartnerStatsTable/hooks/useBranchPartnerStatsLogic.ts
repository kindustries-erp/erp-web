import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";

export interface UseBranchPartnerStatsLogicProps {
  branchId?: string;
  filterState: any;
}

export function useBranchPartnerStatsLogic({
  branchId,
  filterState,
}: UseBranchPartnerStatsLogicProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const tableId = `cashflow-dashboard-partners-${branchId || "all"}`;
  const tableState = useTableColumnState(tableId);

  const { data: partnerStats, isFetching: isPartnerFetching } = useQuery({
    queryKey: [
      "partner-stats",
      branchId,
      page,
      pageSize,
      filterState?.dateFrom,
      filterState?.dateTo,
      filterState?.custom?.sourceType,
      filterState?.custom?.tagIds,
      tableState.columnSearch,
      tableState.columnFilters,
      tableState.sorts,
    ],
    queryFn: () =>
      bankStatementApi.getPartnerStats({
        page,
        pageSize,
        startDate: filterState?.dateFrom || undefined,
        endDate: filterState?.dateTo || undefined,
        branchId: branchId || undefined,
        sourceType: (filterState?.custom?.sourceType as any) || undefined,
        tagIds:
          (filterState?.custom?.tagIds as unknown as string[]) || undefined,
        column_search: JSON.stringify(tableState.columnSearch),
        column_filters: JSON.stringify(tableState.columnFilters),
        sortBy: tableState.sorts?.[0]?.replace(/^-/, ""),
        sortOrder: tableState.sorts?.[0]?.startsWith("-") ? "DESC" : "ASC",
      }),
  });

  const fetchPartnerOptions = useCallback(
    async ({
      columnKey,
      search,
      pageParam,
      pageSize: optPageSize = 20,
      filtersStr,
    }: {
      columnKey: string;
      search: string;
      pageParam: number;
      pageSize?: number;
      filtersStr?: string;
    }) => {
      let currentFilters: Record<string, string[]> = {};
      if (filtersStr) {
        try {
          currentFilters = JSON.parse(filtersStr);
        } catch {
          // ignore
        }
      }
      if (branchId) {
        currentFilters["branchId"] = [branchId];
      }
      const newFiltersStr = JSON.stringify(currentFilters);

      return bankStatementApi.getColumnOptions(
        columnKey,
        search || "",
        pageParam || 1,
        optPageSize,
        newFiltersStr,
      );
    },
    [branchId],
  );

  const items = partnerStats?.items || [];
  const total = partnerStats?.total || 0;
  const totalPages = partnerStats?.totalPages || 1;

  const topTransactionsInTotal = useMemo(
    () =>
      items.reduce(
        (sum: number, r: any) => sum + (Number(r.totalCredit) || 0),
        0,
      ),
    [items],
  );

  const topTransactionsOutTotal = useMemo(
    () =>
      items.reduce(
        (sum: number, r: any) => sum + (Number(r.totalDebit) || 0),
        0,
      ),
    [items],
  );

  const grandTotalCredit = Number(
    partnerStats?.totals?.grandTotalCredit || topTransactionsInTotal,
  );
  const grandTotalDebit = Number(
    partnerStats?.totals?.grandTotalDebit || topTransactionsOutTotal,
  );

  return {
    tableId,
    tableState,
    page,
    pageSize,
    setPage,
    setPageSize,
    partnerStats,
    isPartnerFetching,
    items,
    total,
    totalPages,
    fetchPartnerOptions,
    topTransactionsInTotal,
    topTransactionsOutTotal,
    grandTotalCredit,
    grandTotalDebit,
  };
}
