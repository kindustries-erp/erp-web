import type { GoodsReceiptFormValue } from "@/v2/core/goods-receipts";

/** Metadata của từng trường trên form: nhãn, bắt buộc, class; phần render nằm ở `.fields.tsx` */
export interface GoodsReceiptFieldMeta {
  key: keyof GoodsReceiptFormValue;
  labelKey: string;
  defaultLabel: string;
  required?: boolean;
  className?: string;
}

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
    key: "supplierName",
    labelKey: "v2.goodsReceipts.columns.supplierName",
    defaultLabel: "Nhà cung cấp",
  },
  {
    key: "branchName",
    labelKey: "v2.goodsReceipts.columns.branchName",
    defaultLabel: "Chi nhánh",
  },
  {
    key: "totalAmount",
    labelKey: "v2.goodsReceipts.columns.totalAmount",
    defaultLabel: "Tổng tiền",
  },
  {
    key: "status",
    labelKey: "v2.goodsReceipts.columns.status",
    defaultLabel: "Trạng thái",
  },
  {
    key: "remarks",
    labelKey: "v2.goodsReceipts.columns.remarks",
    defaultLabel: "Ghi chú",
    className: "sm:col-span-2",
  },
];
