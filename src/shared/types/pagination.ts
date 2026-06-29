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
