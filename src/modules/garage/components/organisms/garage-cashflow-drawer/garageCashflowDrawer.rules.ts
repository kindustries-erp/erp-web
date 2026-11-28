import {
  findGarageVoucherViolation,
  isGarageContentAllowed,
  type GarageVoucherRuleState,
  type GarageVoucherViolation,
} from "../../../utils/garageCashflowVoucherRules";
import type {
  CreateGarageCashflowVoucherDto,
  GarageCashflowVoucher,
} from "../../../api/garageCashflowApi";

import type { CashflowFormData } from "./GarageCashflowDrawer.type";

type FormData = Partial<CreateGarageCashflowVoucherDto>;

/** Trạng thái sẽ lưu, dùng đúng mặc định của payload gửi đi. */
export function toRuleState(formData: FormData): GarageVoucherRuleState {
  const voucherType = (formData.voucherType || "RECEIPT").toUpperCase();
  return {
    voucherType,
    paymentStatus:
      formData.paymentStatus ||
      (voucherType === "PAYMENT" ? "PENDING" : "PAID"),
    amount: formData.amount,
    paymentMethod: formData.paymentMethod,
    paymentContent: formData.paymentContent,
    caseId: formData.caseId,
    note: formData.note,
  };
}

/** `stored` là phiếu đang sửa; bỏ trống khi tạo mới. */
export const findFormViolation = (
  formData: FormData,
  stored?: GarageCashflowVoucher | null,
): GarageVoucherViolation | null =>
  findGarageVoucherViolation(toRuleState(formData), stored ?? undefined);

/** Đổi một field trên form; đổi loại phiếu thì bỏ nội dung không còn dùng được. */
export function applyFieldChange(
  prev: CashflowFormData,
  name: string,
  value: unknown,
): CashflowFormData {
  const next = { ...prev, [name]: value } as CashflowFormData;
  if (name !== "voucherType" || value === prev.voucherType) return next;

  next.paymentStatus = value === "PAYMENT" ? "PENDING" : "PAID";
  if (!isGarageContentAllowed(toRuleState(next))) next.paymentContent = "";
  const auto = next.autoPartnerName;
  if (auto) {
    // Tên khách tự điền chỉ thuộc phiếu thu; tên người dùng tự gõ được giữ nguyên.
    if (value === "PAYMENT" && next.partnerName === auto) next.partnerName = "";
    if (value === "RECEIPT" && !next.partnerName) next.partnerName = auto;
  }
  return next;
}
