import type { PurchaseOrderFormField } from "../../../domain/purchaseOrder";

/** Metadata từng trường trên form: nhãn, bắt buộc, class; phần render nằm ở `.fields.tsx` */
export interface PurchaseOrderFieldMeta {
  key: PurchaseOrderFormField;
  labelKey: string;
  defaultLabel: string;
  required?: boolean;
  className?: string;
}

export const PURCHASE_ORDER_FIELD_META: PurchaseOrderFieldMeta[] = [
  {
    key: "poNo",
    labelKey: "v2.purchaseOrders.columns.poNo",
    defaultLabel: "Số đơn",
  },
  {
    key: "orderDate",
    labelKey: "v2.purchaseOrders.columns.orderDate",
    defaultLabel: "Ngày đặt",
    required: true,
  },
  {
    key: "expectedDate",
    labelKey: "v2.purchaseOrders.columns.expectedDate",
    defaultLabel: "Ngày dự kiến",
  },
  {
    key: "supplierName",
    labelKey: "v2.purchaseOrders.columns.supplierName",
    defaultLabel: "Nhà cung cấp",
  },
  {
    key: "branchName",
    labelKey: "v2.purchaseOrders.columns.branchName",
    defaultLabel: "Chi nhánh",
  },
  {
    key: "supplierInvoiceNo",
    labelKey: "v2.purchaseOrders.columns.supplierInvoiceNo",
    defaultLabel: "Số hóa đơn NCC",
  },
  {
    key: "remarks",
    labelKey: "v2.purchaseOrders.columns.remarks",
    defaultLabel: "Ghi chú",
    className: "sm:col-span-2",
  },
];
