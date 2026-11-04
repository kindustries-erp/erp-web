import type {
  V2FetchOptionsParams,
  V2FetchOptionsResult,
  V2TableQuery,
} from "@/v2/shared/types/v2-table";
import type {
  PurchaseOrderFormValue,
  PurchaseOrderRecord,
} from "../domain/purchaseOrder";

/** Kết quả danh sách PO từ API */
export interface PurchaseOrderListResult {
  items: PurchaseOrderRecord[];
  total: number;
  summaries?: Record<string, number>;
}

/**
 * Hợp đồng API của một họ PO. Mỗi module cung cấp một đối tượng đúng hợp đồng này
 * (endpoint riêng), core chỉ gọi qua interface.
 */
export interface PurchaseOrderApi {
  list: (query: V2TableQuery) => Promise<PurchaseOrderListResult>;
  options: (params: V2FetchOptionsParams) => Promise<V2FetchOptionsResult>;
  get: (id: string) => Promise<PurchaseOrderRecord>;
  nextNo: () => Promise<{ nextNo: string }>;
  create: (form: PurchaseOrderFormValue) => Promise<PurchaseOrderRecord>;
  update: (
    id: string,
    form: PurchaseOrderFormValue,
  ) => Promise<PurchaseOrderRecord>;
  approve: (id: string) => Promise<PurchaseOrderRecord>;
  confirm: (id: string) => Promise<PurchaseOrderRecord>;
  cancel: (id: string) => Promise<PurchaseOrderRecord>;
  remove: (id: string) => Promise<PurchaseOrderRecord>;
}
