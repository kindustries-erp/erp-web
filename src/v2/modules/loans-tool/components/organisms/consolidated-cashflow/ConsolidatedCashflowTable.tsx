import React, { useMemo } from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  PortfolioMonthlyPeriod,
  PortfolioScheduleTable,
} from "@/v2/core/loans";
import type { CashflowLoanBreakdownItem } from "../../../api";

export interface MonthlyProjectionRow {
  month: string;
  activeLoanCount: number;
  principalDue: number;
  interestDue: number;
  totalPaymentDue: number;
  cumulativeRemainingPrincipal: number;
  scheduledPrincipalDue?: number;
  scheduledInterestDue?: number;
  scheduledTotalDue?: number;
  actualPrincipalPaid?: number;
  actualInterestPaid?: number;
  actualTotalPaid?: number;
  remainingPrincipalDue?: number;
  remainingInterestDue?: number;
  remainingTotalDue?: number;
  isPaid?: boolean;
  breakdown?: CashflowLoanBreakdownItem[];
}

export interface ConsolidatedCashflowTableProps {
  projections: MonthlyProjectionRow[];
  onRecordPayment?: (
    loanId: string,
    loanName: string,
    periodNumber?: number,
    dueDate?: string,
    principalDue?: number,
    interestDue?: number,
  ) => void;
}

export const ConsolidatedCashflowTable: React.FC<
  ConsolidatedCashflowTableProps
> = ({ projections, onRecordPayment }) => {
  const { t } = useV2Translation();

  const schedule: PortfolioMonthlyPeriod[] = useMemo(
    () =>
      projections.map((p) => ({
        monthKey: p.month,
        paymentDate: p.month,
        principalDue: p.principalDue,
        interestDue: p.interestDue,
        totalPayment: p.totalPaymentDue,
        remainingPrincipal: p.cumulativeRemainingPrincipal,
        loansCount: p.activeLoanCount,
        scheduledPrincipalDue: p.scheduledPrincipalDue,
        scheduledInterestDue: p.scheduledInterestDue,
        scheduledTotalDue: p.scheduledTotalDue,
        actualPrincipalPaid: p.actualPrincipalPaid,
        actualInterestPaid: p.actualInterestPaid,
        actualTotalPaid: p.actualTotalPaid,
        remainingPrincipalDue: p.remainingPrincipalDue,
        remainingInterestDue: p.remainingInterestDue,
        remainingTotalDue: p.remainingTotalDue,
        isPaid: p.isPaid,
        breakdown: p.breakdown?.map((b) => ({
          ...b,
          remainingPrincipal: b.isPaid
            ? 0
            : Math.max(
                0,
                (b.scheduledPrincipal ?? b.principalDue) -
                  (b.actualPrincipalPaid || 0),
              ),
          remainingInterest: b.isPaid
            ? 0
            : Math.max(
                0,
                (b.scheduledInterest ?? b.interestDue) -
                  (b.actualInterestPaid || 0),
              ),
          remainingTotal: b.isPaid
            ? 0
            : Math.max(
                0,
                (b.scheduledTotal ?? b.totalPayment) - (b.actualTotalPaid || 0),
              ),
        })),
      })),
    [projections],
  );

  return (
    <PortfolioScheduleTable
      schedule={schedule}
      onRecordPayment={onRecordPayment}
      title={t("v2.loans.cashflow.tableTitle", "Chi Tiết Dòng Tiền Theo Tháng")}
      description={t(
        "v2.loans.cashflow.tableSubtitle",
        "Tổng hợp nghĩa vụ trả gốc, lãi và dư nợ còn lại theo từng tháng",
      )}
    />
  );
};
