import type { TraceabilityNodeType } from "../types/traceability.type";

/** Loại chứng từ có thể là đích của thao tác ghép nối trên sơ đồ */
export type TraceabilityLinkTarget = Extract<
  TraceabilityNodeType,
  "BANK_TXN" | "INVOICE" | "PURCHASE_ORDER" | "SALES_ORDER" | "GARAGE_CASE"
>;

const TARGET_BY_DOC_TYPE: Partial<
  Record<TraceabilityNodeType, TraceabilityLinkTarget>
> = {
  BANK_TXN: "BANK_TXN",
  INVOICE: "INVOICE",
  PURCHASE_ORDER: "PURCHASE_ORDER",
  SALES_ORDER: "SALES_ORDER",
  GARAGE_CASE: "GARAGE_CASE",
};

/** Giai đoạn không chỉ rõ loại chứng từ thì suy ra loại đại diện của giai đoạn đó */
const TARGET_BY_STAGE: Record<string, TraceabilityLinkTarget> = {
  ORDER_STOCK: "PURCHASE_ORDER",
  INVOICE: "INVOICE",
  PAYMENT: "BANK_TXN",
};

/**
 * Chuyển `onAddLink(stageKey, docType)` của sơ đồ thành loại chứng từ cần ghép nối.
 * `docType` được ưu tiên hơn `stageKey`; không xác định được thì trả null để nơi gọi dùng mặc định.
 */
export function resolveLinkTargetDocType(
  stageKey?: string,
  docType?: TraceabilityNodeType,
): TraceabilityLinkTarget | null {
  if (docType && TARGET_BY_DOC_TYPE[docType]) {
    return TARGET_BY_DOC_TYPE[docType] ?? null;
  }
  return (stageKey && TARGET_BY_STAGE[stageKey]) || null;
}
