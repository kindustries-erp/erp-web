import { useQuery } from "@tanstack/react-query";
import {
  invoiceDashboardApi,
  type TimeHorizonKey,
  type TimeHorizonInvoicesResponse,
  type TimeHorizonDetailSummary,
  type TimeHorizonInvoiceItem,
} from "../api/invoiceDashboardApi";

export interface UseTimeHorizonInvoicesParams {
  horizon: TimeHorizonKey | string | null;
  dateFrom?: string;
  dateTo?: string;
  branchId?: string;
  direction?: "ALL" | "IN" | "OUT";
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  columnSearch?: Record<string, string>;
  columnFilters?: Record<string, string[]>;
  enabled?: boolean;
}

export interface UseTimeHorizonInvoicesReturn {
  data?: TimeHorizonInvoicesResponse;
  summary?: TimeHorizonDetailSummary;
  items: TimeHorizonInvoiceItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => Promise<void>;
}

export function useTimeHorizonInvoices({
  horizon,
  dateFrom,
  dateTo,
  branchId,
  direction = "ALL",
  search,
  page = 1,
  pageSize = 20,
  sortBy,
  sortOrder = "DESC",
  columnSearch = {},
  columnFilters = {},
  enabled = true,
}: UseTimeHorizonInvoicesParams): UseTimeHorizonInvoicesReturn {
  const columnSearchStr =
    Object.keys(columnSearch).length > 0
      ? JSON.stringify(columnSearch)
      : undefined;

  const columnFiltersStr =
    Object.keys(columnFilters).length > 0
      ? JSON.stringify(columnFilters)
      : undefined;

  const query = useQuery({
    queryKey: [
      "time-horizon-invoices",
      horizon,
      dateFrom,
      dateTo,
      branchId,
      direction,
      search,
      page,
      pageSize,
      sortBy,
      sortOrder,
      columnSearchStr,
      columnFiltersStr,
    ],
    queryFn: () => {
      if (!horizon) return Promise.reject(new Error("No horizon selected"));
      return invoiceDashboardApi.getTimeHorizonInvoices(horizon, {
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        branch_id: branchId || undefined,
        direction,
        search: search || undefined,
        page,
        pageSize,
        sortBy: sortBy || undefined,
        sortOrder: sortOrder || undefined,
        column_search: columnSearchStr,
        column_filters: columnFiltersStr,
      });
    },
    enabled: Boolean(enabled && horizon),
    staleTime: 90_000,
  });

  const refetch = async () => {
    await query.refetch();
  };

  const data = query.data;

  return {
    data,
    summary: data?.summary,
    items: data?.items || [],
    total: data?.total || 0,
    page: data?.page || page,
    pageSize: data?.pageSize || pageSize,
    totalPages: data?.totalPages || 1,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch,
  };
}
