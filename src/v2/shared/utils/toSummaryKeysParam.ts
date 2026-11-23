import type { V2TableQuery } from "@/v2/shared/types/v2-table";

/**
 * Chuỗi `summary_keys` gửi lên API (CSV, không trùng, bỏ trống).
 * Trả `undefined` khi không có key nào để API không phải tính tổng.
 * Mọi API client V2 dùng chung hàm này, không tự ghép chuỗi.
 */
export const toSummaryKeysParam = (
  query: Pick<V2TableQuery, "summaryKeys">,
): string | undefined => {
  const keys = (query.summaryKeys ?? [])
    .map((key) => key.trim())
    .filter(Boolean);
  const unique = Array.from(new Set(keys));
  return unique.length ? unique.join(",") : undefined;
};
