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
  palette: readonly string[];
  balanceColor: string;
  labels: LoanCashflowSeriesLabels;
}

/** Có số đã trả thực tế thì mới tách cột đã trả / nợ gốc / tiền lãi */
export const hasActualPaid = (schedule: LoanChartItem[]): boolean =>
  schedule.some(
    (p) =>
      Boolean(p.isPaid) ||
      Number(p.actualTotalPaid ?? 0) > 0 ||
      p.breakdown?.some(
        (b) => Boolean(b.isPaid) || Number(b.actualTotalPaid ?? 0) > 0,
      ),
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
  color: string,
  label: string,
): V2ComboSeries => ({
  key: "remaining",
  label,
  type: "line",
  color,
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

/** Một khoản vay: tách Đã trả, Nợ gốc và Tiền lãi (số phải trả tự điều chỉnh về 0 khi đã trả) */
const loanBarSeries = (
  schedule: LoanChartItem[],
  loanId: string,
  loanName: string,
  color: string,
  labels: LoanCashflowSeriesLabels,
  actual: boolean,
): V2ComboSeries[] => {
  const matchOf = (p: LoanChartItem) =>
    p.breakdown?.find((b) => b.loanId === loanId);

  const paid: V2ComboSeries = {
    key: `loan-${loanId}-paid`,
    label: loanName,
    type: "bar",
    color,
    legendHidden: true,
    tooltipLabel: `${loanName} – ${labels.paid}`,
    data: schedule.map((p) => Math.round(matchOf(p)?.actualTotalPaid ?? 0)),
  };

  const principal: V2ComboSeries = {
    key: `loan-${loanId}-principal`,
    label: loanName,
    type: "bar",
    color,
    legendHidden: false,
    tooltipLabel: `${loanName} – ${labels.principal}`,
    data: schedule.map((p) => {
      const m = matchOf(p);
      if (!m || m.isPaid) return 0;
      const sched = m.scheduledPrincipal ?? m.principalDue;
      return Math.round(Math.max(0, sched - (m.actualPrincipalPaid ?? 0)));
    }),
  };

  const interest: V2ComboSeries = {
    key: `loan-${loanId}-interest`,
    label: loanName,
    type: "bar",
    color,
    fillAlpha: 0.35,
    legendHidden: true,
    tooltipLabel: `${loanName} – ${labels.interest}`,
    data: schedule.map((p) => {
      const m = matchOf(p);
      if (!m || m.isPaid) return 0;
      const sched = m.scheduledInterest ?? m.interestDue;
      return Math.round(Math.max(0, sched - (m.actualInterestPaid ?? 0)));
    }),
  };

  return actual ? [paid, principal, interest] : [principal, interest];
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

  if (loans.size > 0) {
    const loanSeries = Array.from(loans.entries()).flatMap(([id, name], idx) =>
      loanBarSeries(
        schedule,
        id,
        name,
        palette[idx % palette.length],
        labels,
        actual,
      ),
    );
    return [...loanSeries, remaining];
  }

  if (actual) {
    return [
      {
        key: "paid",
        label: labels.paid,
        type: "bar",
        data: schedule.map((p) =>
          Math.round(
            p.isPaid
              ? (p.actualTotalPaid ?? p.principalDue + p.interestDue)
              : (p.actualTotalPaid ?? 0),
          ),
        ),
      },
      {
        key: "principal",
        label: labels.principal,
        type: "bar",
        data: schedule.map((p) => (p.isPaid ? 0 : Math.round(p.principalDue))),
      },
      {
        key: "interest",
        label: labels.interest,
        type: "bar",
        fillAlpha: 0.35,
        data: schedule.map((p) => (p.isPaid ? 0 : Math.round(p.interestDue))),
      },
      remaining,
    ];
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
