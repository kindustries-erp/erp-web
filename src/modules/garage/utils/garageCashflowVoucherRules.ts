/**
 * Luật nhập phiếu thu chi garage phía client. Bản đối ứng của
 * erp-api/src/kgara-api-core/helpers/garage-cashflow-voucher-rules.ts (API là chốt chặn cuối).
 * Kiểm trên trạng thái sẽ lưu; `previous` là phiếu đang lưu (bỏ trống khi tạo mới).
 */
import {
  GARAGE_FORECAST_RECEIPT_CONTENT,
  GARAGE_PAYMENT_METHODS,
  getGarageContentsForType,
  requiresCase,
} from "./garageCashflowCatalog";

export interface GarageVoucherRuleState {
  voucherType?: string | null;
  paymentStatus?: string | null;
  amount?: number | string | null;
  paymentMethod?: string | null;
  paymentContent?: string | null;
  caseId?: string | null;
  note?: string | null;
}

export type GarageVoucherRuleCode =
  | "amount"
  | "methodRequired"
  | "contentRequired"
  | "contentType"
  | "methodInvalid"
  | "caseRequired";

export interface GarageVoucherViolation {
  code: GarageVoucherRuleCode;
  content?: string;
  method?: string;
}

/** Nhãn chi cũ: không còn chọn được nhưng phiếu đang lưu vẫn được giữ. */
const LEGACY_PAYMENT_CONTENTS: readonly string[] = [
  "8. Vật tư tiêu hao",
  "6. HH Thưởng",
];

const text = (value?: string | null): string => value?.trim() ?? "";

const isPaymentType = (state: GarageVoucherRuleState): boolean =>
  state.voucherType === "PAYMENT";

function comparable(
  state: GarageVoucherRuleState,
  key: keyof GarageVoucherRuleState,
): string {
  if (key === "paymentStatus" && !state.paymentStatus) {
    return isPaymentType(state) ? "PENDING" : "PAID";
  }
  return String(state[key] ?? "");
}

export const isGarageVoucherSettled = (
  state: GarageVoucherRuleState,
): boolean =>
  state.paymentStatus === "PAID" ||
  (state.voucherType === "RECEIPT" && !state.paymentStatus);

/** Nội dung có dùng được cho loại phiếu và trạng thái này không (rỗng coi là được). */
export function isGarageContentAllowed(
  next: GarageVoucherRuleState,
  previous?: GarageVoucherRuleState,
): boolean {
  const content = text(next.paymentContent);
  if (!content) return true;
  if (getGarageContentsForType(next.voucherType).includes(content)) return true;
  if (!isPaymentType(next)) {
    return (
      next.paymentStatus === "EXPECTED" &&
      content === GARAGE_FORECAST_RECEIPT_CONTENT
    );
  }
  return (
    previous?.voucherType === "PAYMENT" &&
    text(previous.paymentContent) === content &&
    LEGACY_PAYMENT_CONTENTS.includes(content)
  );
}

/** Trả vi phạm đầu tiên theo đúng thứ tự của API, hoặc null khi hợp lệ. */
export function findGarageVoucherViolation(
  next: GarageVoucherRuleState,
  previous?: GarageVoucherRuleState,
): GarageVoucherViolation | null {
  if (next.paymentStatus === "CANCELLED") return null;

  const changed = (...keys: (keyof GarageVoucherRuleState)[]): boolean =>
    !previous ||
    keys.some((key) => comparable(next, key) !== comparable(previous, key));

  if (!(Number(next.amount) > 0)) return { code: "amount" };

  const content = text(next.paymentContent);
  const method = text(next.paymentMethod);
  if (isGarageVoucherSettled(next)) {
    if (!method) return { code: "methodRequired" };
    if (!content) return { code: "contentRequired" };
  }

  if (
    changed("voucherType", "paymentContent", "paymentStatus") &&
    !isGarageContentAllowed(next, previous)
  ) {
    return { code: "contentType", content };
  }

  if (
    method &&
    changed("paymentMethod") &&
    !GARAGE_PAYMENT_METHODS.includes(method)
  ) {
    return { code: "methodInvalid", method };
  }

  if (
    changed("paymentContent", "caseId", "note") &&
    requiresCase(content) &&
    !next.caseId &&
    !text(next.note)
  ) {
    return { code: "caseRequired", content };
  }

  return null;
}

const MESSAGES: Record<GarageVoucherRuleCode, string> = {
  amount: "Số tiền phải lớn hơn 0.",
  methodRequired: "Phiếu đã thu/chi phải có phương thức thanh toán.",
  contentRequired: "Phiếu đã thu/chi phải có nội dung thanh toán.",
  contentType:
    'Nội dung thanh toán "{{content}}" không dùng cho loại phiếu này. Hãy chọn lại nội dung.',
  methodInvalid: 'Phương thức thanh toán "{{method}}" không hợp lệ.',
  caseRequired:
    'Nội dung "{{content}}" cần gắn phiếu dịch vụ. Nếu chưa có (thu trước, trả gộp), hãy ghi lý do vào Ghi chú.',
};

export function formatGarageVoucherViolation(
  violation: GarageVoucherViolation,
  t: (key: string, options?: { defaultValue: string }) => string,
): string {
  const template = t(`garage:cashflowDrawer.rules.${violation.code}`, {
    defaultValue: MESSAGES[violation.code],
  });
  return template
    .replace("{{content}}", violation.content ?? "")
    .replace("{{method}}", violation.method ?? "");
}
