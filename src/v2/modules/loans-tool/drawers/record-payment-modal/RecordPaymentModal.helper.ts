import type { LoanItem, LoanSchedulePeriod } from "@/v2/core/loans";
import {
  formatVndCurrency,
  generateAmortizationSchedule,
} from "@/v2/core/loans";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import type {
  useRecordPaymentMutation,
  useUpdatePaymentMutation,
} from "../../api";

export interface PeriodOptionItem {
  value: string;
  label: string;
}

export function resolveEffectiveSchedule(
  propSchedule?: LoanSchedulePeriod[],
  loan?: LoanItem,
): LoanSchedulePeriod[] {
  if (propSchedule && propSchedule.length > 0) return propSchedule;
  if (loan) {
    return generateAmortizationSchedule({
      principalAmount: Number(loan.principalAmount || 0),
      annualInterestRate: Number(loan.annualInterestRate || 0),
      tenorMonths: Number(loan.tenorMonths || 12),
      amortizationMethod: loan.amortizationMethod,
      startDate: loan.startDate,
      firstPaymentDate: loan.firstPaymentDate,
    }).schedule;
  }
  return [];
}

export function buildPeriodOptions(
  schedule: LoanSchedulePeriod[],
  paidSet: Set<number>,
): PeriodOptionItem[] {
  if (schedule.length > 0) {
    return schedule.map((p) => {
      const isPaid = paidSet.has(p.periodNumber);
      const tag = isPaid ? " [Đã trả]" : "";
      return {
        value: String(p.periodNumber),
        label: `Kỳ ${p.periodNumber} (${p.dueDate}) — ${formatVndCurrency(p.totalPaymentDue)}${tag}`,
      };
    });
  }
  return Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: `Kỳ ${i + 1}`,
  }));
}

export function validatePaymentInput(
  periodNumber: number,
  principalPaid: number,
  interestPaid: number,
  t: (key: string, fallback: string) => string,
): string | null {
  if (periodNumber < 1) {
    return t(
      "v2.loans.validation.periodPositive",
      "Kỳ thanh toán phải lớn hơn 0",
    );
  }
  if (principalPaid < 0 || interestPaid < 0) {
    return t("v2.loans.validation.nonNegative", "Số tiền không được âm");
  }
  if (principalPaid === 0 && interestPaid === 0) {
    return t(
      "v2.loans.validation.amountRequired",
      "Vui lòng nhập tiền gốc hoặc tiền lãi thanh toán",
    );
  }
  return null;
}

export function resolveInitialPayment(
  suggestedPeriod: number,
  suggestedPrincipal: number,
  suggestedInterest: number,
  schedule: LoanSchedulePeriod[],
  editPayment?: {
    periodNumber: number;
    principalPaid: number | string;
    interestPaid: number | string;
    paymentDate: string;
    paymentRef?: string | null;
    notes?: string | null;
  } | null,
) {
  if (editPayment) {
    return {
      period: Number(editPayment.periodNumber),
      pPaid: Number(editPayment.principalPaid || 0),
      iPaid: Number(editPayment.interestPaid || 0),
      pDate: editPayment.paymentDate,
      ref: editPayment.paymentRef || "",
      notes: editPayment.notes || "",
    };
  }
  const period = suggestedPeriod || 1;
  const target = schedule.find((p) => p.periodNumber === period);
  const pPaid =
    suggestedPrincipal > 0
      ? suggestedPrincipal
      : target
        ? Math.round(target.principalDue)
        : 0;
  const iPaid =
    suggestedInterest > 0
      ? suggestedInterest
      : target
        ? Math.round(target.interestDue)
        : 0;
  const pDate = target?.dueDate || new Date().toISOString().split("T")[0];
  return { period, pPaid, iPaid, pDate, ref: "", notes: "" };
}

export async function executePaymentRecord(
  mutation: ReturnType<typeof useRecordPaymentMutation>,
  params: {
    loanId: string;
    periodNumber: number;
    paymentDate: string;
    principalPaid: number;
    interestPaid: number;
    paymentReference: string;
    notes: string;
  },
  t: (key: string, fallback: string) => string,
  onSuccess: () => void,
  setError: (msg: string | null) => void,
) {
  const validationErr = validatePaymentInput(
    params.periodNumber,
    params.principalPaid,
    params.interestPaid,
    t,
  );
  if (validationErr) {
    setError(validationErr);
    return;
  }

  try {
    await mutation.mutateAsync({
      loanId: params.loanId,
      payload: {
        periodNumber: Number(params.periodNumber),
        paymentDate: params.paymentDate,
        principalPaid: Number(params.principalPaid),
        interestPaid: Number(params.interestPaid),
        paymentRef: params.paymentReference.trim() || undefined,
        notes: params.notes.trim() || undefined,
      },
    });
    useV2ToastStore.getState().showToast({
      variant: "success",
      title: t("v2.loans.toast.paymentRecordedTitle", "Đã ghi nhận thanh toán"),
      description: t(
        "v2.loans.toast.paymentRecordedDesc",
        "Dư nợ gốc và lịch dự báo dòng tiền đã được cập nhật.",
      ),
    });
    onSuccess();
  } catch (err: unknown) {
    setError(
      err instanceof Error
        ? err.message
        : t(
            "v2.loans.validation.paymentError",
            "Có lỗi xảy ra khi ghi nhận thanh toán",
          ),
    );
  }
}

export async function executePaymentUpdate(
  mutation: ReturnType<typeof useUpdatePaymentMutation>,
  params: {
    loanId: string;
    paymentId: string;
    periodNumber: number;
    paymentDate: string;
    principalPaid: number;
    interestPaid: number;
    paymentReference: string;
    notes: string;
  },
  t: (key: string, fallback: string) => string,
  onSuccess: () => void,
  setError: (msg: string | null) => void,
) {
  const validationErr = validatePaymentInput(
    params.periodNumber,
    params.principalPaid,
    params.interestPaid,
    t,
  );
  if (validationErr) {
    setError(validationErr);
    return;
  }

  try {
    await mutation.mutateAsync({
      loanId: params.loanId,
      paymentId: params.paymentId,
      payload: {
        periodNumber: Number(params.periodNumber),
        paymentDate: params.paymentDate,
        principalPaid: Number(params.principalPaid),
        interestPaid: Number(params.interestPaid),
        paymentRef: params.paymentReference.trim() || undefined,
        notes: params.notes.trim() || undefined,
      },
    });
    useV2ToastStore.getState().showToast({
      variant: "success",
      title: t("v2.loans.toast.paymentUpdatedTitle", "Đã cập nhật thanh toán"),
      description: t(
        "v2.loans.toast.paymentUpdatedDesc",
        "Thông tin và lịch dòng tiền đã được cập nhật.",
      ),
    });
    onSuccess();
  } catch (err: unknown) {
    setError(
      err instanceof Error
        ? err.message
        : t(
            "v2.loans.validation.paymentError",
            "Có lỗi xảy ra khi cập nhật thanh toán",
          ),
    );
  }
}
