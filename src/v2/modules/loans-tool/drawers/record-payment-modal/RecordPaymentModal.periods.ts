import type { LoanPaymentRecord, LoanSchedulePeriod } from "@/v2/core/loans";
import { formatVndCurrency } from "@/v2/core/loans";

export interface PeriodOption {
  value: string;
  label: string;
  disabled?: boolean;
  /** Chi tiết kỳ đã trả, hiện khi hover (desktop) hoặc dòng phụ (mobile) */
  tooltip?: string;
}

type Translate = (key: string, fallback: string) => string;

/**
 * Map periodNumber -> thanh toán đã ghi nhận của khoản vay.
 * `excludePaymentId` là thanh toán đang sửa: kỳ của nó vẫn được chọn lại.
 */
export function buildPaidByPeriod(
  payments: LoanPaymentRecord[] | undefined,
  excludePaymentId?: string | null,
): Map<number, LoanPaymentRecord> {
  const paidByPeriod = new Map<number, LoanPaymentRecord>();
  for (const payment of payments ?? []) {
    if (excludePaymentId && payment.id === excludePaymentId) continue;
    paidByPeriod.set(Number(payment.periodNumber), payment);
  }
  return paidByPeriod;
}

function buildPaidTooltip(payment: LoanPaymentRecord, t: Translate): string {
  const principal = formatVndCurrency(Number(payment.principalPaid || 0));
  const interest = formatVndCurrency(Number(payment.interestPaid || 0));
  const total = formatVndCurrency(Number(payment.totalPaid || 0));
  return [
    `${t("v2.loans.modal.periodPaidTooltipPrincipal", "Gốc đã trả")}: ${principal}`,
    `${t("v2.loans.modal.periodPaidTooltipInterest", "Lãi đã trả")}: ${interest}`,
    `${t("v2.loans.modal.periodPaidTooltipTotal", "Tổng đã trả")}: ${total}`,
    `${t("v2.loans.modal.periodPaidTooltipDate", "Ngày thanh toán")}: ${payment.paymentDate}`,
  ].join(" · ");
}

/** Kỳ đã có thanh toán bị khóa (disabled) và kèm tooltip chi tiết. */
export function buildPeriodOptions(
  schedule: LoanSchedulePeriod[],
  paidByPeriod: Map<number, LoanPaymentRecord>,
  t: Translate,
): PeriodOption[] {
  const paidTag = t("v2.loans.modal.periodPaidTag", "Đã trả");
  return schedule.map((period) => {
    const base = `Kỳ ${period.periodNumber} (${period.dueDate}) — ${formatVndCurrency(period.totalPaymentDue)}`;
    const paid = paidByPeriod.get(period.periodNumber);
    if (!paid) {
      return { value: String(period.periodNumber), label: base };
    }
    return {
      value: String(period.periodNumber),
      label: `${base} [${paidTag}]`,
      disabled: true,
      tooltip: buildPaidTooltip(paid, t),
    };
  });
}

/** Kỳ gợi ý: kỳ chưa trả đầu tiên, hoặc null khi đã trả đủ. */
export function resolveSuggestedPeriod(
  schedule: LoanSchedulePeriod[],
  paidByPeriod: Map<number, LoanPaymentRecord>,
): number | null {
  const next = schedule.find((p) => !paidByPeriod.has(p.periodNumber));
  return next ? next.periodNumber : null;
}
