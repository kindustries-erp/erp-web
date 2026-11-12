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
  breakdown?: CashflowLoanBreakdownItem[];
}

export const ConsolidatedCashflowTable: React.FC<{
  projections: MonthlyProjectionRow[];
}> = ({ projections }) => {
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
        breakdown: p.breakdown,
      })),
    [projections],
  );

  return (
    <PortfolioScheduleTable
      schedule={schedule}
      title={t("v2.loans.cashflow.tableTitle", "Chi Tiết Dòng Tiền Theo Tháng")}
      description={t(
        "v2.loans.cashflow.tableSubtitle",
        "Tổng hợp nghĩa vụ trả gốc, lãi và dư nợ còn lại theo từng tháng",
      )}
    />
  );
};
