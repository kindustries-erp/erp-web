import type { GoodsReceiptFormLine } from "./goodsReceiptLine";
import {
  GoodsReceiptStatus,
  type GoodsReceiptFormField,
  type GoodsReceiptFormValue,
} from "./goodsReceipt";

/** Thành tiền một dòng = số lượng × đơn giá; giá trị không hợp lệ được coi là 0 */
export const calcGoodsReceiptLineAmount = (
  qty: string | number,
  unitCost: string | number,
): number => (Number(qty) || 0) * (Number(unitCost) || 0);

/** Tổng thành tiền của các dòng */
export const sumGoodsReceiptLineAmounts = (
  lines: Pick<GoodsReceiptFormLine, "amount">[],
): number => lines.reduce((acc, line) => acc + (Number(line.amount) || 0), 0);

/** Tổng số lượng nhận của các dòng */
export const sumGoodsReceiptLineQuantities = (
  lines: Pick<GoodsReceiptFormLine, "qtyReceived">[],
): number =>
  lines.reduce((acc, line) => acc + (Number(line.qtyReceived) || 0), 0);

/** Trả về trường bắt buộc đầu tiên đang trống theo thứ tự `requiredFields`, hoặc null nếu hợp lệ */
export const validateGoodsReceiptForm = (
  form: GoodsReceiptFormValue,
  requiredFields: readonly GoodsReceiptFormField[],
): GoodsReceiptFormField | null => {
  const missing = requiredFields.find((name) => {
    const value = form[name];
    return typeof value === "string" ? !value.trim() : value == null;
  });
  return missing ?? null;
};

export const isGoodsReceiptFormDirty = (
  form: GoodsReceiptFormValue,
  initial: GoodsReceiptFormValue,
): boolean => JSON.stringify(form) !== JSON.stringify(initial);

export const isGoodsReceiptInactive = (status: string): boolean =>
  status === GoodsReceiptStatus.CANCELLED;
