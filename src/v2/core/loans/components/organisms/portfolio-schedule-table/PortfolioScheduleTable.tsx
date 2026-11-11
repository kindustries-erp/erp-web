import React, { useMemo, useState } from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  exportPortfolioScheduleCsv,
  formatVndCurrency,
} from "../../../domain/rules/loan-format.rule";
import { PortfolioBreakdownRow } from "./PortfolioBreakdownRow";
import { PortfolioScheduleHeader } from "./PortfolioScheduleHeader";
import type { PortfolioScheduleTableProps } from "./PortfolioScheduleTable.type";

export const PortfolioScheduleTable: React.FC<PortfolioScheduleTableProps> = ({
  schedule,
  title,
  description,
  className = "",
}) => {
  const { t } = useV2Translation();
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>(
    {},
  );

  const hasAnyBreakdown = useMemo(
    () => schedule.some((p) => p.breakdown && p.breakdown.length > 0),
    [schedule],
  );

  const toggleMonth = (key: string) => {
    setExpandedMonths((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleExportCsv = () => {
    exportPortfolioScheduleCsv(schedule, [
      t("v2.loans.table.month", "Tháng"),
      t("v2.loans.table.dueDate", "Ngày đến hạn"),
      t("v2.loans.table.principalDue", "Gốc phải trả"),
      t("v2.loans.table.interestDue", "Lãi phải trả"),
      t("v2.loans.table.totalDue", "Tổng phải trả"),
      t("v2.loans.table.endingBalance", "Dư nợ còn lại"),
      t("v2.loans.table.activeLoans", "Số khoản"),
    ]);
  };

  const totalPrincipal = schedule.reduce((sum, p) => sum + p.principalDue, 0);
  const totalInterest = schedule.reduce((sum, p) => sum + p.interestDue, 0);
  const totalPayment = schedule.reduce((sum, p) => sum + p.totalPayment, 0);

  return (
    <div
      className={`rounded-2xl border border-border bg-card shadow-xs overflow-hidden ${className}`}
    >
      <PortfolioScheduleHeader
        title={title}
        description={description}
        hasAnyBreakdown={hasAnyBreakdown}
        monthsCount={schedule.length}
        onExportCsv={handleExportCsv}
      />

      <div className="max-h-[560px] overflow-y-auto overflow-x-auto relative">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="sticky top-0 z-10 bg-muted/90 backdrop-blur-sm border-b border-border text-xs font-semibold uppercase text-muted-foreground tracking-wider">
            <tr>
              {hasAnyBreakdown && <th className="py-3 px-3 w-10"></th>}
              <th className="py-3 px-4">
                {t("v2.loans.table.month", "Tháng")}
              </th>
              <th className="py-3 px-4">
                {hasAnyBreakdown
                  ? t("v2.loans.table.dueDate", "Ngày thanh toán")
                  : t("v2.loans.table.activeLoans", "Số HĐ")}
              </th>
              <th className="py-3 px-4 text-right">
                {t("v2.loans.table.principalDue", "Gốc phải trả")}
              </th>
              <th className="py-3 px-4 text-right">
                {t("v2.loans.table.interestDue", "Lãi phải trả")}
              </th>
              <th className="py-3 px-4 text-right">
                {t("v2.loans.table.totalDue", "Tổng phải trả")}
              </th>
              <th className="py-3 px-4 text-right">
                {t("v2.loans.table.endingBalance", "Dư nợ còn lại")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {schedule.map((p) => {
              const rowHasBreakdown = Boolean(
                p.breakdown && p.breakdown.length > 0,
              );
              const isExpanded =
                rowHasBreakdown && Boolean(expandedMonths[p.monthKey]);
              return (
                <React.Fragment key={p.monthKey}>
                  <tr
                    onClick={
                      rowHasBreakdown
                        ? () => toggleMonth(p.monthKey)
                        : undefined
                    }
                    className={`transition-colors ${
                      rowHasBreakdown ? "cursor-pointer" : ""
                    } ${
                      isExpanded
                        ? "bg-primary/5 font-semibold"
                        : "hover:bg-muted/40"
                    }`}
                  >
                    {hasAnyBreakdown && (
                      <td className="py-3 px-3 text-center text-muted-foreground">
                        {rowHasBreakdown &&
                          (isExpanded ? (
                            <ChevronDown className="h-4 w-4 inline text-primary" />
                          ) : (
                            <ChevronRight className="h-4 w-4 inline" />
                          ))}
                      </td>
                    )}
                    <td className="py-3 px-4 font-semibold text-foreground">
                      {p.monthKey}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground font-mono tabular-nums">
                      {hasAnyBreakdown ? p.paymentDate : p.loansCount}
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-600 dark:text-emerald-400 font-medium font-mono tabular-nums">
                      {formatVndCurrency(p.principalDue)}
                    </td>
                    <td className="py-3 px-4 text-right text-amber-600 dark:text-amber-400 font-mono tabular-nums">
                      {formatVndCurrency(p.interestDue)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-foreground font-mono tabular-nums">
                      {formatVndCurrency(p.totalPayment)}
                    </td>
                    <td className="py-3 px-4 text-right text-muted-foreground font-mono tabular-nums">
                      {formatVndCurrency(p.remainingPrincipal)}
                    </td>
                  </tr>
                  {isExpanded && p.breakdown && (
                    <PortfolioBreakdownRow items={p.breakdown} />
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
          <tfoot className="sticky bottom-0 z-10 bg-muted/95 backdrop-blur-sm border-t-2 border-border font-bold text-xs uppercase">
            <tr>
              <td colSpan={hasAnyBreakdown ? 3 : 2} className="py-3 px-4">
                {t("v2.loans.table.totalSummary", "Tổng cộng")}
              </td>
              <td className="py-3 px-4 text-right text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                {formatVndCurrency(totalPrincipal)}
              </td>
              <td className="py-3 px-4 text-right text-amber-600 dark:text-amber-400 font-mono tabular-nums">
                {formatVndCurrency(totalInterest)}
              </td>
              <td className="py-3 px-4 text-right text-primary font-mono tabular-nums">
                {formatVndCurrency(totalPayment)}
              </td>
              <td className="py-3 px-4 text-right text-muted-foreground font-mono">
                -
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
PortfolioScheduleTable.displayName = "PortfolioScheduleTable";
