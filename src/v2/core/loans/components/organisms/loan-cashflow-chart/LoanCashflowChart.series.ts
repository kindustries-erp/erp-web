import type { V2ComboSeries } from "@/v2/shared/components/organisms/v2-chart/V2Chart.type";
import type { LoanChartItem } from "./LoanCashflowChart.type";

export interface LoanCashflowSeriesLabels {
  paid: string;
  unpaid: string;
  remaining: string;
  principal: string;
  interest: string;
}

export interface BuildLoanCashflowSeriesInput {
  schedule: LoanChartItem[];
  /** Màu theo thứ tự khoản vay, lấy từ palette V2 */
  palette: readonly string[];
  /** Màu đường dư nợ, lấy từ token theme */
  balanceColor: string;
  labels: LoanCashflowSeriesLabels;
}

/** Có số đã trả thực tế (chỉ projection có) thì mới tách cột đã trả / còn phải trả */
export const hasActualPaid = (schedule: LoanChartItem[]): boolean =>
  schedule.some((p) =>
    p.breakdown?.some((b) => b.actualTotalPaid !== undefined),
  );

const collectLoans = (schedule: LoanChartItem[]): Map<string, string> => {
  const loans = new Map<string, string>();
  for (const period of schedule) {
    for (const item of period.breakdown ?? []) {
      if (!loans.has(item.loanId)) loans.set(item.loanId, item.loanName);
    }
  }
  return loans;
};

const balanceSeries = (
  schedule: LoanChartItem[],
  balanceColor: string,
  label: string,
): V2ComboSeries => ({
  key: "remaining",
  label,
  type: "line",
  color: balanceColor,
  data: schedule.map((p) =>
    Math.round(
      p.endingBalance ??
        p.remainingPrincipal ??
        p.cumulativeRemainingPrincipal ??
        0,
    ),
  ),
  secondaryAxis: true,
});

/** Một khoản vay: có số thực trả thì tách đã trả (đậm) và còn phải trả (nhạt) */
const loanBarSeries = (
  schedule: LoanChartItem[],
  loanId: string,
  loanName: string,
  color: string,
  labels: LoanCashflowSeriesLabels,
  actual: boolean,
): V2ComboSeries[] => {
  const matchOf = (period: LoanChartItem) =>
    period.breakdown?.find((b) => b.loanId === loanId);

  const paid: V2ComboSeries[] = actual
    ? [
        {
          key: `loan-${loanId}-paid`,
          label: loanName,
          type: "bar",
          color,
          tooltipLabel: `${loanName} – ${labels.paid}`,
          data: schedule.map((period) =>
            Math.round(matchOf(period)?.actualTotalPaid ?? 0),
          ),
        },
      ]
    : [];

  const unpaid: V2ComboSeries = {
    key: `loan-${loanId}-unpaid`,
    label: loanName,
    type: "bar",
    color,
    legendHidden: actual,
    fillAlpha: actual ? 0.35 : undefined,
    tooltipLabel: actual ? `${loanName} – ${labels.unpaid}` : undefined,
    data: schedule.map((period) => {
      const match = matchOf(period);
      if (!match) return 0;
      const scheduled = match.scheduledTotal ?? match.totalPayment;
      return Math.round(Math.max(0, scheduled - (match.actualTotalPaid ?? 0)));
    }),
  };

  return [...paid, unpaid];
};

export const buildLoanCashflowSeries = ({
  schedule,
  palette,
  balanceColor,
  labels,
}: BuildLoanCashflowSeriesInput): V2ComboSeries[] => {
  const actual = hasActualPaid(schedule);
  const remaining = balanceSeries(schedule, balanceColor, labels.remaining);
  const loans = collectLoans(schedule);

  if (loans.size > 1 || actual) {
    const loanSeries = Array.from(loans.entries()).flatMap(
      ([loanId, loanName], idx) =>
        loanBarSeries(
          schedule,
          loanId,
          loanName,
          palette[idx % palette.length],
          labels,
          actual,
        ),
    );
    return [...loanSeries, remaining];
  }

  return [
    {
      key: "principal",
      label: labels.principal,
      type: "bar",
      data: schedule.map((p) => Math.round(p.principalDue)),
    },
    {
      key: "interest",
      label: labels.interest,
      type: "bar",
      data: schedule.map((p) => Math.round(p.interestDue)),
    },
    remaining,
  ];
};
