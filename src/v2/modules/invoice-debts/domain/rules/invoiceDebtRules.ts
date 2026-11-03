import type { InvoiceDebtFormValue } from "../entities/invoiceDebt";

/** Trường bắt buộc, theo thứ tự hiển thị trên form */
export const REQUIRED_invoiceDebt_FIELDS = ["search"] as const;

export type InvoiceDebtFormError = (typeof REQUIRED_invoiceDebt_FIELDS)[number];

/** Trả về trường bắt buộc đầu tiên đang trống, hoặc null nếu hợp lệ */
export const validateInvoiceDebtForm = (
  form: InvoiceDebtFormValue,
): InvoiceDebtFormError | null =>
  REQUIRED_invoiceDebt_FIELDS.find((name) => !form[name].trim()) ?? null;

export const isInvoiceDebtFormDirty = (
  form: InvoiceDebtFormValue,
  initial: InvoiceDebtFormValue,
): boolean => JSON.stringify(form) !== JSON.stringify(initial);

export const isInvoiceDebtInactive = (status: string): boolean =>
  status === "INACTIVE";
