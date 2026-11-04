import {
  PURCHASE_ORDER_DEFAULT_PAYMENT_STATUS,
  PurchaseOrderInventoryStatus,
  PurchaseOrderStatus,
} from "./purchaseOrderConstants";
import type {
  PurchaseOrderFormLine,
  PurchaseOrderRecordLine,
} from "./purchaseOrderLine";

export { PurchaseOrderStatus, PurchaseOrderInventoryStatus };

/** PO như API trả về; mỗi họ PO dùng chung kiểu này */
export interface PurchaseOrderRecord {
  id: string;
  poNo: string;
  supplierName?: string | null;
  branchId?: string | null;
  branchName?: string | null;
  orderDate: string;
  expectedDate?: string | null;
  status: PurchaseOrderStatus;
  paymentStatus?: string | null;
  remarks?: string | null;
  supplierInvoiceNo?: string | null;
  createdBy?: string | null;
  totalAmount?: number | null;
  inventoryStatus?: PurchaseOrderInventoryStatus | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  lines?: PurchaseOrderRecordLine[];
}

/** Giá trị form của PO (chuỗi, phục vụ input) */
export interface PurchaseOrderFormValue {
  poNo: string;
  orderDate: string;
  expectedDate: string;
  supplierName: string;
  branchName: string;
  supplierInvoiceNo: string;
  remarks: string;
  status: PurchaseOrderStatus;
  paymentStatus: string;
  totalAmount: string;
  lines: PurchaseOrderFormLine[];
}

/** Khóa form dùng để báo lỗi bắt buộc theo trường */
export type PurchaseOrderFormField = keyof PurchaseOrderFormValue;

let lineSeq = 0;
/** Sinh khóa tạm cho dòng trên form; không cần duy nhất toàn cục, chỉ cần duy nhất trong form */
export const newPurchaseOrderLineKey = (): string => {
  lineSeq += 1;
  return `line-${Date.now().toString(36)}-${lineSeq}`;
};

export const emptyPurchaseOrderLine = (): PurchaseOrderFormLine => ({
  clientKey: newPurchaseOrderLineKey(),
  itemCode: "",
  itemName: "",
  description: "",
  qtyOrdered: "1",
  qtyReceived: "0",
  unitPrice: "0",
  amount: "0",
});

export const emptyPurchaseOrderForm = (): PurchaseOrderFormValue => ({
  poNo: "",
  orderDate: new Date().toISOString().slice(0, 10),
  expectedDate: "",
  supplierName: "",
  branchName: "",
  supplierInvoiceNo: "",
  remarks: "",
  status: PurchaseOrderStatus.DRAFT,
  paymentStatus: PURCHASE_ORDER_DEFAULT_PAYMENT_STATUS,
  totalAmount: "0",
  lines: [],
});

/** Chuyển PO từ API sang giá trị form; ngày cắt về yyyy-mm-dd */
export const toPurchaseOrderForm = (
  data: PurchaseOrderRecord,
): PurchaseOrderFormValue => ({
  poNo: data.poNo ?? "",
  orderDate: data.orderDate ? data.orderDate.slice(0, 10) : "",
  expectedDate: data.expectedDate ? data.expectedDate.slice(0, 10) : "",
  supplierName: data.supplierName ?? "",
  branchName: data.branchName ?? "",
  supplierInvoiceNo: data.supplierInvoiceNo ?? "",
  remarks: data.remarks ?? "",
  status: data.status || PurchaseOrderStatus.DRAFT,
  paymentStatus: data.paymentStatus || PURCHASE_ORDER_DEFAULT_PAYMENT_STATUS,
  totalAmount: data.totalAmount == null ? "0" : String(data.totalAmount),
  lines:
    data.lines?.map((l) => ({
      clientKey: l.id ?? newPurchaseOrderLineKey(),
      id: l.id,
      itemCode: l.itemCode ?? "",
      itemName: l.itemName ?? "",
      description: l.description ?? "",
      qtyOrdered: l.qtyOrdered ?? "0",
      qtyReceived: l.qtyReceived ?? "0",
      unitPrice: l.unitPrice ?? "0",
      amount: l.amount ?? "0",
    })) ?? [],
});
