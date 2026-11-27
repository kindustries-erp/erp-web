import type { QueryClient } from "@tanstack/react-query";

/**
 * Khóa cache React Query của phiếu thu chi garage. Mọi nơi đọc hoặc làm mới dữ liệu phiếu
 * dùng hằng này để không lệch khóa giữa tab Phiếu thu chi, tab Dự thu chi và dashboard.
 */
export const GARAGE_CASHFLOW_QUERY_KEYS = {
  list: "garage-cashflow-list",
  forecastList: "garage-cashflow-forecast-list",
  dashboard: "garage-cashflow-dashboard",
  audit: "garage-cashflow-audit",
  /** Tiền tố khóa giá trị lọc cột: `garage-cashflow-options-<tabKey>`. */
  optionsPrefix: "garage-cashflow-options-",
} as const;

export type GarageCashflowTabKey = "vouchers" | "forecast";

/** Khóa danh sách theo tab (tab Dự thu chi dùng khóa riêng). */
export function garageCashflowListKey(tabKey?: GarageCashflowTabKey): string {
  return tabKey === "forecast"
    ? GARAGE_CASHFLOW_QUERY_KEYS.forecastList
    : GARAGE_CASHFLOW_QUERY_KEYS.list;
}

/** Khóa giá trị lọc cột theo tab. */
export function garageCashflowOptionsKey(
  tabKey?: GarageCashflowTabKey,
): string {
  return `${GARAGE_CASHFLOW_QUERY_KEYS.optionsPrefix}${tabKey ?? "vouchers"}`;
}

/**
 * Làm mới mọi dữ liệu phụ thuộc phiếu thu chi sau khi tạo, sửa hoặc xóa: hai danh sách,
 * dashboard, lịch sử phiếu và giá trị lọc cột.
 */
export function invalidateGarageCashflowQueries(
  queryClient: QueryClient,
): Promise<void> {
  const { list, forecastList, dashboard, audit, optionsPrefix } =
    GARAGE_CASHFLOW_QUERY_KEYS;
  return queryClient.invalidateQueries({
    predicate: (query) => {
      const head = query.queryKey[0];
      if (typeof head !== "string") return false;
      return (
        head === list ||
        head === forecastList ||
        head === dashboard ||
        head === audit ||
        head.startsWith(optionsPrefix)
      );
    },
  });
}
