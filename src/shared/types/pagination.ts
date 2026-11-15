export interface ListParams {
  page?: number; // 1-based, default 1
  pageSize?: number; // default 15
  sort?: string[]; // e.g. ["-created_at"], fallback ["id"]
  search?: string;
  [key: string]: unknown; // allow extra filter params
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const DEFAULT_PAGE_SIZE = 15;
export const DEFAULT_SORT = ["-created_at"];
export const FALLBACK_SORT = ["id"];

/** Build a PaginatedResponse<T> from a raw Directus-style response. */
export function buildPaginated<T>(
  data: T[],
  meta: { filter_count?: number } | undefined,
  page: number,
  pageSize: number,
): PaginatedResponse<T> {
  const total = meta?.filter_count ?? data.length;
  return {
    items: data,
    total,
    page,
    pageSize,
    totalPages: pageSize > 0 ? Math.ceil(total / pageSize) : 1,
  };
}

/** Khối `pagination` của response danh sách chuẩn v2 (có `next`/`previous`). */
export interface PaginationWireMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  next: number | null;
  previous: number | null;
}

/** Response danh sách chuẩn v2 từ API: `items` + `pagination`. */
export interface PaginatedWireResponse<T> {
  items: T[];
  pagination: PaginationWireMeta;
}

/**
 * Đổi response chuẩn v2 sang kiểu phẳng `PaginatedResponse` mà các bảng V1 đang dùng.
 * Chỉ gọi ở lớp API client V1; màn hình V1 không đọc key chuẩn v2 trực tiếp.
 */
export function fromPaginatedWire<T>(
  wire: PaginatedWireResponse<T>,
): PaginatedResponse<T> {
  const { page, pageSize, total, totalPages } = wire.pagination;
  return { items: wire.items, total, page, pageSize, totalPages };
}

/** Đổi response column-options chuẩn v2 sang `{ items, total, next }` của bộ lọc V1. */
export function fromColumnOptionsWire<T>(wire: PaginatedWireResponse<T>): {
  items: T[];
  total: number;
  next: number | null;
} {
  return {
    items: wire.items,
    total: wire.pagination.total,
    next: wire.pagination.next,
  };
}
