import React, { useState } from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2Badge, V2Button, V2Text } from "@/v2/shared/components";
import { ChevronDown, ChevronRight, Download } from "lucide-react";
import { PortfolioMonthlyPeriod } from "@/v2/core/loans";
import {
  exportPortfolioScheduleCsv,
  formatVndCurrency,
} from "@/v2/core/loans/domain/rules/loan-format.rule";
import { PortfolioBreakdownRow } from "./PortfolioBreakdownRow";

export interface PortfolioScheduleTableProps {
  schedule: PortfolioMonthlyPeriod[];
  className?: string;
}

export const PortfolioScheduleTable: React.FC<PortfolioScheduleTableProps> = ({
  schedule,
  className = "",
}) => {
  const { t } = useV2Translation();
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>(
    {},
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
    <div className={`space-y-3 ${className}`}>
      <div className="flex justify-between items-center">
        <div>
          <V2Text as="h3" variant="h4" weight="semibold">
            {t(
              "v2.loans.table.portfolioScheduleTitle",
              "Lịch Trả Nợ Danh Mục Theo Tháng",
            )}
          </V2Text>
          <V2Text variant="caption" color="muted">
            {t(
              "v2.loans.table.portfolioScheduleDesc",
              "Bấm vào từng tháng để xem chi tiết khoản vay cấu thành",
            )}
          </V2Text>
        </div>
        <div className="flex items-center gap-2">
          <V2Badge variant="outline" className="text-xs font-normal">
            {schedule.length}{" "}
            {t("v2.loans.table.monthsCount", "tháng dự phóng")}
          </V2Badge>
          <V2Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {t("v2.loans.table.exportCsv", "Xuất CSV")}
          </V2Button>
        </div>
      </div>

      <div className="max-h-[560px] overflow-y-auto overflow-x-auto rounded-xl border border-border bg-card relative">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="sticky top-0 z-10 bg-muted/95 backdrop-blur-sm shadow-[0_1px_0_0_hsl(var(--border))]">
            <tr className="text-xs font-semibold uppercase text-muted-foreground">
              <th className="py-3 px-3 w-10"></th>
              <th className="py-3 px-3">
                {t("v2.loans.table.month", "Tháng")}
              </th>
              <th className="py-3 px-3">
                {t("v2.loans.table.dueDate", "Ngày thanh toán")}
              </th>
              <th className="py-3 px-3 text-right">
                {t("v2.loans.table.principalDue", "Gốc phải trả")}
              </th>
              <th className="py-3 px-3 text-right">
                {t("v2.loans.table.interestDue", "Lãi phải trả")}
              </th>
              <th className="py-3 px-3 text-right">
                {t("v2.loans.table.totalDue", "Tổng phải trả")}
              </th>
              <th className="py-3 px-3 text-right">
                {t("v2.loans.table.endingBalance", "Dư nợ còn lại")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {schedule.map((p) => {
              const isExpanded = Boolean(expandedMonths[p.monthKey]);
              return (
                <React.Fragment key={p.monthKey}>
                  <tr
                    onClick={() => toggleMonth(p.monthKey)}
                    className="hover:bg-muted/30 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-3 text-center text-muted-foreground">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 inline" />
                      ) : (
                        <ChevronRight className="h-4 w-4 inline" />
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-foreground">
                      {p.monthKey}
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground">
                      {p.paymentDate}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {formatVndCurrency(p.principalDue)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-amber-500 font-medium">
                      {formatVndCurrency(p.interestDue)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-foreground">
                      {formatVndCurrency(p.totalPayment)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-muted-foreground">
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
          <tfoot className="sticky bottom-0 z-10 bg-muted/95 backdrop-blur-sm shadow-[0_-1px_0_0_hsl(var(--border))]">
            <tr className="font-bold text-xs uppercase">
              <td colSpan={3} className="py-3 px-4">
                {t("v2.loans.table.totalSummary", "Tổng cộng")}
              </td>
              <td className="py-3 px-3 text-right">
                {formatVndCurrency(totalPrincipal)}
              </td>
              <td className="py-3 px-3 text-right text-amber-500">
                {formatVndCurrency(totalInterest)}
              </td>
              <td className="py-3 px-3 text-right text-primary">
                {formatVndCurrency(totalPayment)}
              </td>
              <td className="py-3 px-3 text-right text-muted-foreground">-</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
PortfolioScheduleTable.displayName = "PortfolioScheduleTable";
