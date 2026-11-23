import { PurchaseOrderStatus } from "./purchaseOrderConstants";
import type { PurchaseOrderFormLine } from "./purchaseOrderLine";
import type {
  PurchaseOrderFormField,
  PurchaseOrderFormValue,
} from "./purchaseOrder";

/** Thành tiền một dòng = số lượng đặt × đơn giá; giá trị không hợp lệ được coi là 0 */
export const calcPurchaseOrderLineAmount = (
  qty: string | number,
  unitPrice: string | number,
): number => (Number(qty) || 0) * (Number(unitPrice) || 0);

/** Tổng thành tiền của các dòng (dùng để hiển thị; server tính lại khi ghi) */
export const sumPurchaseOrderLineAmounts = (
  lines: Pick<PurchaseOrderFormLine, "qtyOrdered" | "unitPrice">[],
): number =>
  lines.reduce(
    (acc, line) =>
      acc + calcPurchaseOrderLineAmount(line.qtyOrdered, line.unitPrice),
    0,
  );

/** Trả về trường bắt buộc đầu tiên đang trống theo thứ tự `requiredFields`, hoặc null nếu hợp lệ */
export const validatePurchaseOrderForm = (
  form: PurchaseOrderFormValue,
  requiredFields: readonly PurchaseOrderFormField[],
): PurchaseOrderFormField | null => {
  const missing = requiredFields.find((name) => {
    const value = form[name];
    return typeof value === "string" ? !value.trim() : value == null;
  });
  return missing ?? null;
};

export const isPurchaseOrderFormDirty = (
  form: PurchaseOrderFormValue,
  initial: PurchaseOrderFormValue,
): boolean => JSON.stringify(form) !== JSON.stringify(initial);

/** Khớp bảng hành động theo trạng thái của API; UI chỉ ẩn/hiện, API vẫn là chốt chặn */
const EDITABLE: readonly PurchaseOrderStatus[] = [
  PurchaseOrderStatus.DRAFT,
  PurchaseOrderStatus.APPROVED,
  PurchaseOrderStatus.CONFIRMED,
  PurchaseOrderStatus.PARTIAL_RECEIVED,
];

export const canEditPurchaseOrder = (status: string): boolean =>
  EDITABLE.includes(status as PurchaseOrderStatus);

export const canApprovePurchaseOrder = (status: string): boolean =>
  status === PurchaseOrderStatus.DRAFT;

export const canConfirmPurchaseOrder = (status: string): boolean =>
  status === PurchaseOrderStatus.DRAFT ||
  status === PurchaseOrderStatus.APPROVED;

export const canCancelPurchaseOrder = (status: string): boolean =>
  status === PurchaseOrderStatus.APPROVED ||
  status === PurchaseOrderStatus.CONFIRMED ||
  status === PurchaseOrderStatus.PARTIAL_RECEIVED;

export const canDeletePurchaseOrder = (status: string): boolean =>
  status === PurchaseOrderStatus.DRAFT;
