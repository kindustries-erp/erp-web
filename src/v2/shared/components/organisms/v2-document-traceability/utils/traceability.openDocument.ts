import type { TraceabilityNodeType } from "../types/traceability.type";

/** Tên sự kiện toàn cục mà shell đang lắng nghe để mở drawer chứng từ */
export const OPEN_ERP_DOCUMENT_EVENT = "open_erp_document";

/** Loại chứng từ → loại drawer mà shell mở (cùng hợp đồng với shell V1) */
const DOCUMENT_EVENT_TYPE: Partial<Record<TraceabilityNodeType, string>> = {
  INVOICE: "erp_invoice",
  BANK_TXN: "bank_transaction",
  PURCHASE_ORDER: "erp_purchase_order",
  SALES_ORDER: "erp_sales_order",
  GOODS_RECEIPT: "inventory_voucher",
  GOODS_ISSUE: "inventory_voucher",
  GARAGE_CASE: "garage_case",
  INVENTORY_ITEM: "inventory_item",
  PRODUCTION_ORDER: "production_order",
  BOM: "bom",
};

/** Chi tiết sự kiện mở chứng từ; loại không có màn hình mở được thì trả null */
export const toOpenDocumentDetail = (
  docType: TraceabilityNodeType,
  id: string,
): { type: string; id: string } | null => {
  const type = DOCUMENT_EVENT_TYPE[docType];
  return type ? { type, id } : null;
};

/** Mở chứng từ qua sự kiện toàn cục; trả false khi loại chứng từ không có màn hình mở */
export function openErpDocument(
  docType: TraceabilityNodeType,
  id: string,
): boolean {
  const detail = toOpenDocumentDetail(docType, id);
  if (!detail) return false;
  window.dispatchEvent(new CustomEvent(OPEN_ERP_DOCUMENT_EVENT, { detail }));
  return true;
}
