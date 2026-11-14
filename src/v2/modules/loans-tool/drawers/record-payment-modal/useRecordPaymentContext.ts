import { useMemo } from "react";
import {
  recalculateAmortizationSchedule,
  type LoanItem,
  type LoanPaymentRecord,
  type LoanSchedulePeriod,
} from "@/v2/core/loans";
import { useLoanDetailQuery } from "../../api";
import type { RecordPaymentModalProps } from "./RecordPaymentModal.type";
import { resolveEffectiveSchedule } from "./RecordPaymentModal.helper";
import {
  buildPaidByPeriod,
  resolveSuggestedPeriod,
} from "./RecordPaymentModal.periods";

const EMPTY_PAYMENTS: LoanPaymentRecord[] = [];

/**
 * Dữ liệu nền của modal ghi nhận thanh toán.
 * - Mở từ danh sách: không có `payments` nên tự tải chi tiết khoản vay.
 * - Mở từ drawer: nhận `payments` và `schedule` sẵn có, không tải lại.
 */
export function useRecordPaymentContext(props: RecordPaymentModalProps) {
  const {
    open,
    loanId,
    loan: loanProp,
    schedule: propSchedule,
    payments: propPayments,
    suggestedPeriod,
    mode = "create",
    editPayment = null,
  } = props;

  const isEdit = mode === "edit" && Boolean(editPayment?.id);
  const detailQuery = useLoanDetailQuery(
    open && propPayments === undefined ? loanId : null,
  );

  const loan: LoanItem | undefined = detailQuery.data ?? loanProp;
  const payments: LoanPaymentRecord[] =
    propPayments ??
    detailQuery.data?.payments ??
    loanProp?.payments ??
    EMPTY_PAYMENTS;

  const effectiveSchedule = useMemo<LoanSchedulePeriod[]>(() => {
    if (propSchedule && propSchedule.length > 0) return propSchedule;
    if (loan && payments.length > 0) {
      return recalculateAmortizationSchedule({
        principalAmount: Number(loan.principalAmount),
        annualInterestRate: Number(loan.annualInterestRate),
        tenorMonths: Number(loan.tenorMonths),
        amortizationMethod: loan.amortizationMethod,
        startDate: loan.startDate,
        firstPaymentDate: loan.firstPaymentDate,
        remainingPrincipal: Number(
          loan.remainingPrincipal ?? loan.principalAmount,
        ),
        payments: payments.map((p) => ({
          periodNumber: Number(p.periodNumber),
          paymentDate: p.paymentDate,
          principalPaid: Number(p.principalPaid || 0),
          interestPaid: Number(p.interestPaid || 0),
          totalPaid: Number(p.totalPaid || 0),
          paymentRef: p.paymentRef,
        })),
      }).schedule;
    }
    return resolveEffectiveSchedule(undefined, loan);
  }, [propSchedule, loan, payments]);

  const editingPaymentId = isEdit ? (editPayment?.id ?? null) : null;
  const paidByPeriod = useMemo(
    () => buildPaidByPeriod(payments, editingPaymentId),
    [payments, editingPaymentId],
  );

  const nextUnpaidPeriod = useMemo(
    () => resolveSuggestedPeriod(effectiveSchedule, paidByPeriod),
    [effectiveSchedule, paidByPeriod],
  );

  /** Kỳ mở modal: giữ kỳ gợi ý của caller nếu kỳ đó chưa trả, nếu không thì kỳ chưa trả đầu tiên. */
  const initialPeriod =
    suggestedPeriod && !paidByPeriod.has(suggestedPeriod)
      ? suggestedPeriod
      : (nextUnpaidPeriod ?? suggestedPeriod ?? 1);

  return {
    loan,
    effectiveSchedule,
    paidByPeriod,
    initialPeriod,
    allPeriodsPaid: effectiveSchedule.length > 0 && nextUnpaidPeriod === null,
    isLoadingPayments: propPayments === undefined && detailQuery.isLoading,
  };
}
