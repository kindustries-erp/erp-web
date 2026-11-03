import type { CashBookDto } from "../../api/dtos/cashVoucher.dto";
import type {
  CashVoucherFieldError,
  CashVoucherFormValue,
} from "../entities/cashVoucher";

/**
 * Kiểm tra form theo thứ tự hiển thị; trả về trường lỗi đầu tiên hoặc null.
 * Phiếu là thu hoặc chi, nên phải nhập đúng một trong hai số tiền.
 */
export function validateCashVoucherForm(
  form: CashVoucherFormValue,
): CashVoucherFieldError | null {
  if (!form.cashBookId) return "cashBookId";
  if (!form.transDate) return "transDate";
  const hasReceipt = (form.receiptAmount ?? 0) > 0;
  const hasPayment = (form.paymentAmount ?? 0) > 0;
  if (hasReceipt === hasPayment) return "amount";
  return null;
}

/** Chi nhánh của phiếu: lấy từ sổ quỹ, nếu sổ chưa có thì dùng chi nhánh đang chọn */
export const resolveVoucherBranchId = (
  cashBook: Pick<CashBookDto, "branchId"> | undefined,
  fallbackBranchId: string | null | undefined,
): string | undefined => cashBook?.branchId ?? fallbackBranchId ?? undefined;

export function isCashVoucherFormDirty(
  form: CashVoucherFormValue,
  initial: CashVoucherFormValue,
): boolean {
  return (Object.keys(initial) as (keyof CashVoucherFormValue)[]).some(
    (key) => form[key] !== initial[key],
  );
}
