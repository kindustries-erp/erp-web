import type {
  V2FetchOptionsParams,
  V2FetchOptionsResult,
  V2SummaryMetric,
  V2TableQuery,
} from "@/v2/shared/types/v2-table";
import type {
  GoodsReceiptFormValue,
  GoodsReceiptRecord,
} from "../domain/goodsReceipt";

/** Kết quả danh sách phiếu nhập từ API */
export interface GoodsReceiptListResult {
  items: GoodsReceiptRecord[];
  total: number;
  /** Số liệu tổng theo key đã gửi trong `summary_keys`; `null` = API không tính được */
  summaries?: Record<string, V2SummaryMetric | null>;
}

/**
 * Hợp đồng API của một họ phiếu nhập. Mỗi module cung cấp một đối tượng
 * đúng hợp đồng này (endpoint riêng), core chỉ gọi qua interface.
 */
export interface GoodsReceiptApi {
  list: (query: V2TableQuery) => Promise<GoodsReceiptListResult>;
  options: (params: V2FetchOptionsParams) => Promise<V2FetchOptionsResult>;
  get: (id: string) => Promise<GoodsReceiptRecord>;
  nextCode: () => Promise<{ nextCode: string }>;
  create: (form: GoodsReceiptFormValue) => Promise<GoodsReceiptRecord>;
  update: (
    id: string,
    form: GoodsReceiptFormValue,
  ) => Promise<GoodsReceiptRecord>;
  post: (id: string) => Promise<GoodsReceiptRecord>;
  cancel: (id: string) => Promise<GoodsReceiptRecord>;
  remove: (id: string) => Promise<GoodsReceiptRecord>;
}
