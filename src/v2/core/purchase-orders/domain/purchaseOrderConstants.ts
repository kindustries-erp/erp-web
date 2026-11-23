/** Trạng thái PO theo API v2 (khớp PURCHASE_ORDER_TRANSITIONS phía erp-api) */
export enum PurchaseOrderStatus {
  DRAFT = "DRAFT",
  APPROVED = "APPROVED",
  CONFIRMED = "CONFIRMED",
  PARTIAL_RECEIVED = "PARTIAL_RECEIVED",
  RECEIVED = "RECEIVED",
  CANCELLED = "CANCELLED",
}

/** Tiến độ nhập kho do API suy ra, chỉ đọc trên UI */
export enum PurchaseOrderInventoryStatus {
  NOT_RECEIVED = "NOT_RECEIVED",
  PARTIAL_RECEIVED = "PARTIAL_RECEIVED",
  RECEIVED = "RECEIVED",
}

export const PURCHASE_ORDER_DEFAULT_PAYMENT_STATUS = "UNPAID";
