import React, { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import {
  workshopDashboardApi,
  type DashboardDateParams,
  type PaginatedParams,
  type InvoicePartnerInfo,
  type InvoiceDashboardPartnersResponse,
} from "../api/workshopDashboardApi";

export interface WorkshopInvoicePartnersHookResult {
  data:
    | {
        items: InvoicePartnerInfo[];
        total: number;
        page: number;
        pageSize: number;
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
}

export function useWorkshopInvoicePartnersTable(
  filterParams: DashboardDateParams & { search?: string },
  initialPage = 1,
  initialPageSize = 20,
): WorkshopInvoicePartnersHookResult {
  const tableState = useTableColumnState("workshop-invoice-partners");
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

  const queryParams: PaginatedParams = {
    ...filterParams,
    page,
    pageSize,
    columnSearch: tableState.columnSearch,
    columnFilters: tableState.columnFilters,
    sorts: tableState.sorts,
  };

  const result = useQuery<InvoiceDashboardPartnersResponse, Error>({
    queryKey: [
      "workshop-invoice-partners",
      filterParams.dateFrom,
      filterParams.dateTo,
      filterParams.branchId,
      filterParams.search,
      page,
      pageSize,
      tableState.columnSearch,
      tableState.columnFilters,
      tableState.sorts,
    ],
    queryFn: () => workshopDashboardApi.getInvoicePartners(queryParams),
    placeholderData: (prev) => prev,
  });

  const fetchOptions = useCallback(
    async ({
      columnKey,
      search: searchTerm,
      filtersStr,
    }: {
      columnKey: string;
      search: string;
      pageParam: number;
      filtersStr?: string;
    }) => {
      const items: { value: string; label: string }[] = [];
      const existing = result.data?.items || [];
      const seen = new Set<string>();
      const columnFilters = filtersStr
        ? JSON.parse(filtersStr || "{}")
        : tableState.columnFilters;

      for (const row of existing) {
        const value = String(
          (row as unknown as Record<string, unknown>)[columnKey] ?? "",
        );
        if (!value) continue;
        if (seen.has(value)) continue;
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
        items.push({ value, label: value });
      }

      return {
        items,
        total: items.length,
        next: null,
      };
    },
    [result.data, tableState.columnFilters],
  );

  return {
    ...result,
    tableState,
    page,
    pageSize,
    setPage,
    setPageSize,
    fetchOptions,
  };
}
