import type {
  PurchaseOrderFormValue,
  PurchaseOrderRecord,
} from "@/v2/core/purchase-orders";

/** PO garage như API trả về (cùng hình dạng với lõi PO) */
export type GaragePurchaseOrder = PurchaseOrderRecord;

/** Giá trị form PO garage (cùng hình dạng với lõi PO) */
export type GaragePurchaseOrderFormValue = PurchaseOrderFormValue;
