import { TableSortState, type V2TableQuery } from "@/v2/shared/types/v2-table";
import type {
  InvoiceDirection,
  TaxTab,
} from "@/v2/modules/finance-invoice/domain/entities/invoiceShape.data";

export interface InvoiceListQueryParams {
  direction?: "IN" | "OUT";
  page: number;
  pageSize: number;
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  column_search?: string;
  column_filters?: string;
  date_from?: string;
  date_to?: string;
}

const TAX_TAB_STATUS_MAP: Record<TaxTab, string[] | null> = {
  all: null,
  new: ["1"],
  replacement: ["2", "4"],
  adjustment: ["3", "5"],
};

export function v2InvoiceQueryToParams(
  direction: InvoiceDirection,
  taxTab: TaxTab,
  query: V2TableQuery,
): InvoiceListQueryParams {
  const columnFilters: Record<string, string[]> = { ...query.columnFilters };

  // Tax tab status handling
  const statusTabValues = TAX_TAB_STATUS_MAP[taxTab];
  if (
    statusTabValues &&
    (!columnFilters.taxInvoiceStatus ||
      columnFilters.taxInvoiceStatus.length === 0)
  ) {
    columnFilters.taxInvoiceStatus = statusTabValues;
  }

  // Sort mapping
  let sort_by: string | undefined;
  let sort_order: "asc" | "desc" | undefined;
  if (query.sorts.length > 0) {
    const primarySort = query.sorts[0];
    sort_by = primarySort.columnKey;
    sort_order = primarySort.direction === TableSortState.DESC ? "desc" : "asc";
  }

  // Date range mapping
  let date_from: string | undefined;
  let date_to: string | undefined;
  const dateRange = query.dateRanges.invoiceDate;
  if (dateRange) {
    if (dateRange.from) {
      date_from = `${dateRange.from}T00:00:00`;
    }
    if (dateRange.to) {
      date_to = `${dateRange.to}T23:59:59`;
    }
  }

  return {
    direction,
    page: query.page,
    pageSize: query.pageSize,
    search: query.search?.trim() || undefined,
    sort_by,
    sort_order,
    column_search: Object.keys(query.columnSearch).length
      ? JSON.stringify(query.columnSearch)
      : undefined,
    column_filters: Object.keys(columnFilters).length
      ? JSON.stringify(columnFilters)
      : undefined,
    date_from,
    date_to,
  };
}
