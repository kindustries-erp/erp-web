/** Trạng thái form tạo phiếu thu/chi tiền mặt. Số tiền là `null` khi ô để trống. */
export interface CashVoucherFormValue {
  cashBookId: string;
  transDate: string;
  correspondentName: string;
  /** Thu tiền (phiếu thu) */
  receiptAmount: number | null;
  /** Chi tiền (phiếu chi) */
  paymentAmount: number | null;
  description: string;
}

export const emptyCashVoucherForm = (): CashVoucherFormValue => ({
  cashBookId: "",
  transDate: "",
  correspondentName: "",
  receiptAmount: null,
  paymentAmount: null,
  description: "",
});

/** Trường bị lỗi đầu tiên; `amount` là lỗi về số tiền (phải nhập đúng một trong Thu/Chi) */
export type CashVoucherFieldError = "cashBookId" | "transDate" | "amount";
