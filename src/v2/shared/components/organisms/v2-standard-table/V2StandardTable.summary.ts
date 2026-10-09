import type { V2TableQuery } from "@/v2/shared/types/v2-table";
import type { V2Column } from "./V2StandardTable.type";

export interface V2ColumnSummaryValues {
  pageValue: number;
  totalValue: number;
  cumulativeValue?: number;
}

/** Trạng thái tích lũy theo trang của một cột (chế độ server); reset khi signature đổi */
export interface V2ServerSummaryState {
  signature: string;
  pageSums: Record<number, number>;
}

export const createServerSummaryState = (): V2ServerSummaryState => ({
  signature: "",
  pageSums: {},
});

const toFiniteNumber = (value: unknown): number => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const readByPath = (row: unknown, path: string): unknown =>
  path
    .split(".")
    .reduce<unknown>(
      (cur, part) =>
        cur !== null && typeof cur === "object"
          ? (cur as Record<string, unknown>)[part]
          : undefined,
      row,
    );

/** Số của một dòng cho cột: `summary.accessor` nếu có, không thì đọc theo `key` */
export const readSummaryNumber = <T>(column: V2Column<T>, row: T): number => {
  const raw = column.summary?.accessor
    ? column.summary.accessor(row)
    : readByPath(row, column.key);
  return toFiniteNumber(raw);
};

export const sumRows = <T>(rows: T[], read: (row: T) => number): number =>
  rows.reduce((sum, row) => sum + read(row), 0);

/**
 * Chế độ client: bảng có đủ dữ liệu nên tính trực tiếp.
 * `sortedRows` là toàn bộ dòng đã lọc và sắp xếp, `pageRows` là dòng đang hiển thị.
 */
export const computeClientSummary = <T>(
  read: (row: T) => number,
  sortedRows: T[],
  pageRows: T[],
  page: number,
  pageSize: number,
): V2ColumnSummaryValues => ({
  pageValue: sumRows(pageRows, read),
  totalValue: sumRows(sortedRows, read),
  cumulativeValue: sumRows(sortedRows.slice(0, page * pageSize), read),
});

/** Khóa trang-độc-lập của query: đổi filter, sort hoặc số dòng/trang thì lũy kế được tính lại */
export const buildSummarySignature = (query: V2TableQuery): string =>
  JSON.stringify({ ...query, page: 0 });

/** Ghi tổng của một trang vào trạng thái; trả về cùng object nếu không đổi */
export const recordPageSum = (
  state: V2ServerSummaryState,
  signature: string,
  page: number,
  value: number,
): V2ServerSummaryState => {
  const base =
    state.signature === signature ? state : createServerSummaryState();
  if (base.pageSums[page] === value && base.signature === signature) {
    return base;
  }
  return {
    signature,
    pageSums: { ...base.pageSums, [page]: value },
  };
};

/**
 * Lũy kế từ trang 1 đến `page` (chế độ server).
 * Trả về undefined khi còn thiếu tổng của một trang trước đó (người dùng chưa đi qua trang đó).
 */
export const cumulativeFromPages = (
  state: V2ServerSummaryState,
  signature: string,
  page: number,
  pageValue: number,
): number | undefined => {
  if (page <= 1) return pageValue;
  if (state.signature !== signature) return undefined;
  let sum = pageValue;
  for (let p = 1; p < page; p += 1) {
    const value = state.pageSums[p];
    if (value === undefined) return undefined;
    sum += value;
  }
  return sum;
};
