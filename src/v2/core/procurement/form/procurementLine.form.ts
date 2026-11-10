import type {
  ProcurementDetailLine,
  ProcurementLinePayload,
} from "../procurement.types";

export type ProcurementLineType = "GOODS" | "SERVICE";

/** Một dòng trên form. Số lượng và đơn giá giữ dạng chuỗi để người dùng gõ tự do. */
export interface ProcurementLineFormValue {
  key: string;
  lineType: ProcurementLineType;
  itemCode: string;
  itemName: string;
  description: string;
  qty: string;
  /** Đơn giá (PO) hoặc đơn giá dự kiến (PR) */
  price: string;
  requestLineId: string | null;
}

let lineSeq = 0;
export const newProcurementLineKey = (): string => `line-${++lineSeq}`;

export const emptyProcurementLine = (): ProcurementLineFormValue => ({
  key: newProcurementLineKey(),
  lineType: "GOODS",
  itemCode: "",
  itemName: "",
  description: "",
  qty: "1",
  price: "",
  requestLineId: null,
});

/** Chuỗi rỗng, null, undefined hoặc không phải số thì trả null. Nhận cả số (API trả số). */
export const toNumberOrNull = (
  value: string | number | null | undefined,
): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

/** Đổi số/chuỗi từ API thành chuỗi cho ô nhập; null hoặc rỗng thì trả null. */
const toInputText = (
  value: string | number | null | undefined,
): string | null =>
  value === null || value === undefined || value === "" ? null : String(value);

/** Thành tiền = số lượng x đơn giá, làm tròn 3 số lẻ; thiếu một trong hai thì null. */
export const procurementLineAmount = (
  line: Pick<ProcurementLineFormValue, "qty" | "price">,
): number | null => {
  const qty = toNumberOrNull(line.qty);
  const price = toNumberOrNull(line.price);
  if (qty === null || price === null) return null;
  return Math.round(qty * price * 1000) / 1000;
};

export const sumProcurementLines = (
  lines: Array<Pick<ProcurementLineFormValue, "qty" | "price">>,
): number => lines.reduce((sum, l) => sum + (procurementLineAmount(l) ?? 0), 0);

/** Mã lỗi dòng đầu tiên gặp phải, hoặc null nếu hợp lệ. */
export type ProcurementLinesError = "empty" | "itemName" | "itemCode" | "qty";

/** Mã hàng bắt buộc khi `itemCodeRequired` (đơn mua Garage). */
export const validateProcurementLines = (
  lines: ProcurementLineFormValue[],
  itemCodeRequired = false,
): ProcurementLinesError | null => {
  if (lines.length === 0) return "empty";
  if (lines.some((l) => !l.itemName.trim())) return "itemName";
  if (itemCodeRequired && lines.some((l) => !l.itemCode.trim()))
    return "itemCode";
  if (lines.some((l) => (toNumberOrNull(l.qty) ?? 0) <= 0)) return "qty";
  return null;
};

const textOrUndefined = (value: string): string | undefined =>
  value.trim() || undefined;

export const toOrderLinePayload = (
  line: ProcurementLineFormValue,
): ProcurementLinePayload => ({
  lineType: line.lineType,
  itemCode: textOrUndefined(line.itemCode),
  itemName: textOrUndefined(line.itemName),
  description: textOrUndefined(line.description),
  qtyOrdered: toNumberOrNull(line.qty),
  unitPrice: toNumberOrNull(line.price) ?? undefined,
  requestLineId: line.requestLineId ?? undefined,
});

export const toRequestLinePayload = (
  line: ProcurementLineFormValue,
): ProcurementLinePayload => ({
  lineType: line.lineType,
  itemCode: textOrUndefined(line.itemCode),
  itemName: textOrUndefined(line.itemName),
  description: textOrUndefined(line.description),
  qtyRequested: toNumberOrNull(line.qty),
  estUnitPrice: toNumberOrNull(line.price) ?? undefined,
});

/**
 * Dòng chi tiết từ API thành dòng form. Số lượng ưu tiên `qtyRequested` (PR): PR luôn trả
 * `qtyOrdered = 0` cho tới khi đặt hàng, nên không được dùng `qtyOrdered` trước. PO không có
 * `qtyRequested` nên rơi xuống `qtyOrdered`.
 */
export const procurementLineFromDetail = (
  detail: ProcurementDetailLine,
): ProcurementLineFormValue => ({
  key: newProcurementLineKey(),
  lineType: detail.lineType,
  itemCode: detail.itemCode ?? "",
  itemName: detail.itemName ?? "",
  description: detail.description ?? "",
  qty: toInputText(detail.qtyRequested ?? detail.qtyOrdered) ?? "0",
  price: toInputText(detail.unitPrice ?? detail.estUnitPrice) ?? "",
  requestLineId: detail.requestLineId ?? null,
});
