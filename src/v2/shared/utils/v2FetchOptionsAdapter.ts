import type { V2PaginatedResponse } from "../types/v2-pagination";
import type { V2FetchOptionsResult, V2FilterOption } from "../types/v2-table";

/**
 * Đổi response column-options chuẩn v2 (`items` + `pagination`) sang kiểu bảng
 * `V2FetchOptionsResult` (`items`, `total`, `next`) mà `V2StandardTable` đang dùng.
 */
export function toFetchOptionsResult(
  response: V2PaginatedResponse<V2FilterOption>,
): V2FetchOptionsResult {
  return {
    items: response.items,
    total: response.pagination.total,
    next: response.pagination.next,
  };
}
