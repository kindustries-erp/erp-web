import { AmortizationMethod, LoanStatus } from "@/v2/core/loans";
import type { LoanFormValues } from "./LoanFormDrawer.type";

export const createDefaultValues = (): LoanFormValues => ({
  loanCode: "",
  title: "",
  lenderName: "",
  principalAmount: 100000000,
  annualInterestRate: 10.5,
  tenorMonths: 12,
  amortizationMethod: AmortizationMethod.AMORTIZED,
  startDate: new Date().toISOString().split("T")[0],
  firstPaymentDate: "",
  status: LoanStatus.ACTIVE,
  notes: "",
});

export function validateLoanForm(
  values: LoanFormValues,
  t: (key: string, fallback: string) => string,
): Record<string, string> {
  const errs: Record<string, string> = {};
  if (!values.title.trim()) {
    errs.title = t(
      "v2.loans.validation.titleRequired",
      "Vui lòng nhập tên khoản vay",
    );
  }
  if (!values.lenderName.trim()) {
    errs.lenderName = t(
      "v2.loans.validation.lenderRequired",
      "Vui lòng nhập đơn vị cho vay",
    );
  }
  if (values.principalAmount <= 0) {
    errs.principalAmount = t(
      "v2.loans.validation.principalPositive",
      "Số tiền vay phải > 0",
    );
  }
  if (values.tenorMonths <= 0) {
    errs.tenorMonths = t(
      "v2.loans.validation.tenorPositive",
      "Kỳ hạn phải > 0",
    );
  }
  if (values.annualInterestRate < 0) {
    errs.annualInterestRate = t(
      "v2.loans.validation.rateNonNegative",
      "Lãi suất không thể âm",
    );
  }
  if (!values.startDate) {
    errs.startDate = t(
      "v2.loans.validation.startDateRequired",
      "Vui lòng chọn ngày giải ngân",
    );
  }
  if (
    values.firstPaymentDate &&
    values.startDate &&
    values.firstPaymentDate < values.startDate
  ) {
    errs.firstPaymentDate = t(
      "v2.loans.validation.firstPaymentDateInvalid",
      "Kỳ đầu tiên không được trước ngày giải ngân",
    );
  }
  return errs;
}
