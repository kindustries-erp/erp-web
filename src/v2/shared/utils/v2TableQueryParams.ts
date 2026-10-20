import { TableSortState } from "@/v2/shared/types/v2-table";
import type { V2DateRange, V2TableQuery } from "@/v2/shared/types/v2-table";

/**
 * Hàm thuần giúp module đổi `V2TableQuery` thành tham số riêng của API mình.
 * Khung không biết tên tham số của từng API, nên chỉ cung cấp các phép đọc chung.
 */

export interface V2PrimarySort {
  field: string;
  order: "asc" | "desc";
}

/** Sắp xếp chính (cột đầu tiên); `undefined` nếu bảng chưa sắp xếp */
export const getV2PrimarySort = (
  query: V2TableQuery,
): V2PrimarySort | undefined => {
  const sort = query.sorts[0];
  if (!sort) return undefined;
  return {
    field: sort.columnKey,
    order: sort.direction === TableSortState.DESC ? "desc" : "asc",
  };
};

export const getV2ColumnFilterValues = (
  query: V2TableQuery,
  columnKey: string,
): string[] => query.columnFilters[columnKey] ?? [];

export const getV2DateRange = (
  query: V2TableQuery,
  columnKey: string,
): V2DateRange => query.dateRanges[columnKey] ?? {};

/** Khoảng ngày thành mốc đầu ngày và cuối ngày, dạng `YYYY-MM-DDTHH:mm:ss` */
export const toV2DayBounds = (
  range: V2DateRange,
): { from?: string; to?: string } => ({
  from: range.from ? `${range.from}T00:00:00` : undefined,
  to: range.to ? `${range.to}T23:59:59` : undefined,
});

/** Trang (bắt đầu từ 1) thành `limit` và `offset` */
export const toV2OffsetPage = (
  query: V2TableQuery,
): { limit: number; offset: number } => ({
  limit: query.pageSize,
  offset: (query.page - 1) * query.pageSize,
});
