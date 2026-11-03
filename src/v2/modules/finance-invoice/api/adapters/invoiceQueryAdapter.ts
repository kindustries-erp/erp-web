import { TableSortState, type V2TableQuery } from "@/v2/shared/types/v2-table";
import type {
  InvoiceDirection,
  TaxTab,
} from "@/v2/modules/finance-invoice/domain/entities/invoiceShape.data";

/** Tham số `GET /api/v2/invoices` (xem `QueryInvoiceDto` và `TableQueryDto` phía API) */
export interface InvoiceListQueryParams {
  direction?: "IN" | "OUT";
  page: number;
  pageSize: number;
  search?: string;
  /** `a,-b`: dấu `-` là giảm dần */
  sort?: string;
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

/** Chuỗi sắp xếp của API v2 từ danh sách sort của bảng */
export function toSortParam(sorts: V2TableQuery["sorts"]): string | undefined {
  if (sorts.length === 0) return undefined;
  return sorts
    .map((sort) =>
      sort.direction === TableSortState.DESC
        ? `-${sort.columnKey}`
        : sort.columnKey,
    )
    .join(",");
}

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

  // Khoảng ngày của cột hóa đơn: API v2 nhận YYYY-MM-DD
  const dateRange = query.dateRanges.invoiceDate;

  return {
    direction,
    page: query.page,
    pageSize: query.pageSize,
    search: query.search?.trim() || undefined,
    sort: toSortParam(query.sorts),
    column_search: Object.keys(query.columnSearch).length
      ? JSON.stringify(query.columnSearch)
      : undefined,
    column_filters: Object.keys(columnFilters).length
      ? JSON.stringify(columnFilters)
      : undefined,
    date_from: dateRange?.from || undefined,
    date_to: dateRange?.to || undefined,
  };
}
