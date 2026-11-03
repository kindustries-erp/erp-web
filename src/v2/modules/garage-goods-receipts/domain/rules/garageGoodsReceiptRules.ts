import type { GarageGoodsReceiptFormValue } from "@/v2/modules/garage-goods-receipts/domain/entities/garageGoodsReceipt";

/** Trường bắt buộc, theo thứ tự hiển thị trên form */
export const REQUIRED_garageGoodsReceipt_FIELDS = ["receiptDate"] as const;

export type GarageGoodsReceiptFormError =
  (typeof REQUIRED_garageGoodsReceipt_FIELDS)[number];

/** Trả về trường bắt buộc đầu tiên đang trống, hoặc null nếu hợp lệ */
export const validateGarageGoodsReceiptForm = (
  form: GarageGoodsReceiptFormValue,
): GarageGoodsReceiptFormError | null =>
  REQUIRED_garageGoodsReceipt_FIELDS.find((name) => !form[name]?.trim()) ??
  null;

export const isGarageGoodsReceiptFormDirty = (
  form: GarageGoodsReceiptFormValue,
  initial: GarageGoodsReceiptFormValue,
): boolean => JSON.stringify(form) !== JSON.stringify(initial);

export const isGarageGoodsReceiptInactive = (status: string): boolean =>
  status === "CANCELLED";
