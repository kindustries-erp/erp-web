import type { GoodsReceiptFormValue } from "@/v2/core/goods-receipts";

/** Metadata của từng trường trên form: nhãn, bắt buộc, class; phần render nằm ở `.fields.tsx` */
export interface GoodsReceiptFieldMeta {
  key: keyof GoodsReceiptFormValue;
  labelKey: string;
  defaultLabel: string;
  required?: boolean;
  className?: string;
}

/** Trường chỉ có khi phiếu gắn đơn mua (module cấu hình `sourceOrder`) */
export const GOODS_RECEIPT_ORDER_FIELD_KEYS: ReadonlySet<
  keyof GoodsReceiptFormValue
> = new Set(["sourceOrderId", "sourceOrderTotal"]);

export const GOODS_RECEIPT_FIELD_META: GoodsReceiptFieldMeta[] = [
  {
    key: "receiptNo",
    labelKey: "v2.goodsReceipts.columns.receiptNo",
    defaultLabel: "Số phiếu",
    required: true,
  },
  {
    key: "receiptDate",
    labelKey: "v2.goodsReceipts.columns.receiptDate",
    defaultLabel: "Ngày nhập",
    required: true,
  },
  {
    key: "sourceOrderId",
    labelKey: "v2.goodsReceipts.columns.sourceOrderId",
    defaultLabel: "Đơn mua",
    required: true,
    className: "sm:col-span-2",
  },
  {
    key: "supplierName",
    labelKey: "v2.goodsReceipts.columns.supplierName",
    defaultLabel: "Nhà cung cấp",
  },
  {
    key: "totalAmount",
    labelKey: "v2.goodsReceipts.columns.totalAmount",
    defaultLabel: "Tổng tiền",
  },
  {
    key: "sourceOrderTotal",
    labelKey: "v2.goodsReceipts.columns.sourceOrderTotal",
    defaultLabel: "Tổng tiền đơn mua",
  },
  {
    key: "branchName",
    labelKey: "v2.goodsReceipts.columns.branchName",
    defaultLabel: "Chi nhánh",
  },
  {
    key: "remarks",
    labelKey: "v2.goodsReceipts.columns.remarks",
    defaultLabel: "Ghi chú",
    className: "sm:col-span-2",
  },
];
