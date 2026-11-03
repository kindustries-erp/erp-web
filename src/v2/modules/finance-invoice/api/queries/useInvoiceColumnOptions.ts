import type {
  V2FetchOptions,
  V2FetchOptionsParams,
  V2FetchOptionsResult,
} from "@/v2/shared/types/v2-table";
import type { InvoiceDirection } from "@/v2/modules/finance-invoice/domain/entities/invoiceShape.data";
import { financeInvoiceV2Api } from "../financeInvoiceV2Api";

/** Bộ lọc cột dạng JSON của bảng; chuỗi sai định dạng thì coi như không lọc */
const parseColumnFilters = (raw?: string): Record<string, string[]> => {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object"
      ? (parsed as Record<string, string[]>)
      : {};
  } catch {
    return {};
  }
};

/**
 * Tạo fetchOptions cho V2StandardTable để tải động các giá trị bộ lọc của từng cột từ backend.
 */
export const createInvoiceFetchOptions = (
  direction: InvoiceDirection,
): V2FetchOptions => {
  return async (
    params: V2FetchOptionsParams,
  ): Promise<V2FetchOptionsResult> => {
    const res = await financeInvoiceV2Api.getColumnOptions({
      column: params.columnKey,
      search: params.search,
      page: params.pageParam,
      pageSize: 20,
      // Chiều hóa đơn đi qua bộ lọc cột, API v2 không có tham số direction riêng
      filters: JSON.stringify({
        ...parseColumnFilters(params.filtersStr),
        direction: [direction],
      }),
    });
    const items = res.items.map((item) =>
      typeof item === "string" ? { value: item, label: item } : item,
    );
    return {
      items,
      total: res.total,
      next: res.next,
    };
  };
};
