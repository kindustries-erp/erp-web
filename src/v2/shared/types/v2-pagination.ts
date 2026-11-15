/** Khối `pagination` chuẩn v2 của mọi response danh sách và column-options. */
export interface V2PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  /** Số trang kế tiếp, null khi đã ở trang cuối. */
  next: number | null;
  /** Số trang trước, null khi đang ở trang đầu. */
  previous: number | null;
}

/** Response danh sách không có summaries: `items` và `pagination`. */
export interface V2PaginatedResponse<T> {
  items: T[];
  pagination: V2PaginationMeta;
}

/** Response danh sách có summaries (tổng cột số). */
export interface V2PaginatedResponseWithSummaries<
  T,
  S = Record<string, unknown>,
> extends V2PaginatedResponse<T> {
  summaries: S;
}
