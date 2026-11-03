import type { TraceabilityNodeType } from "@/v2/shared/components/organisms/v2-document-traceability";

/** Loại chứng từ → tên sự kiện mở chứng từ toàn cục (cùng hợp đồng với shell V1 đang lắng nghe) */
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
