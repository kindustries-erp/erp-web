import React from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2Text } from "@/v2/shared/components";
import { formatVndCurrency } from "@/v2/core/loans";

export interface MonthlyProjectionRow {
  month: string;
  activeLoanCount: number;
  principalDue: number;
  interestDue: number;
  totalPaymentDue: number;
  cumulativeRemainingPrincipal: number;
}

export const ConsolidatedCashflowTable: React.FC<{
  projections: MonthlyProjectionRow[];
}> = ({ projections }) => {
  const { t } = useV2Translation();

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
      <div className="p-4 border-b border-border">
        <V2Text variant="h3" className="font-semibold text-base">
          {t("v2.loans.cashflow.tableTitle", "Chi Tiết Dòng Tiền Theo Tháng")}
        </V2Text>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted text-muted-foreground border-b border-border text-left">
            <tr>
              <th className="px-4 py-3">
                {t("v2.loans.table.month", "Tháng")}
              </th>
              <th className="px-4 py-3 text-center">
                {t("v2.loans.table.activeLoans", "Số HĐ")}
              </th>
              <th className="px-4 py-3 text-right">
                {t("v2.loans.table.principalDue", "Gốc phải trả")}
              </th>
              <th className="px-4 py-3 text-right">
                {t("v2.loans.table.interestDue", "Lãi phải trả")}
              </th>
              <th className="px-4 py-3 text-right">
                {t("v2.loans.table.totalDue", "Tổng tiền kỳ")}
              </th>
              <th className="px-4 py-3 text-right">
                {t("v2.loans.table.cumulativeRemaining", "Dư nợ còn lại")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {projections.map((p) => (
              <tr key={p.month} className="hover:bg-muted/40 transition-colors">
                <td className="px-4 py-2.5 font-medium">{p.month}</td>
                <td className="px-4 py-2.5 text-center">{p.activeLoanCount}</td>
                <td className="px-4 py-2.5 text-right text-emerald-600 dark:text-emerald-400 font-medium font-mono">
                  {formatVndCurrency(p.principalDue)}
                </td>
                <td className="px-4 py-2.5 text-right text-amber-600 dark:text-amber-400 font-mono">
                  {formatVndCurrency(p.interestDue)}
                </td>
                <td className="px-4 py-2.5 text-right font-bold text-foreground font-mono">
                  {formatVndCurrency(p.totalPaymentDue)}
                </td>
                <td className="px-4 py-2.5 text-right text-muted-foreground font-mono">
                  {formatVndCurrency(p.cumulativeRemainingPrincipal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
