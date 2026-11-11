import React, { useState } from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2Badge, V2Button, V2Text } from "@/v2/shared/components";
import { ChevronDown, ChevronRight, Download } from "lucide-react";
import { PortfolioMonthlyPeriod } from "@/v2/core/loans";
import { formatVndCurrency } from "@/v2/core/loans/domain/rules/loan-format.rule";

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
    const headers = [
      t("v2.loans.table.month", "Tháng"),
      t("v2.loans.table.dueDate", "Ngày đến hạn"),
      t("v2.loans.table.principalDue", "Gốc phải trả"),
      t("v2.loans.table.interestDue", "Lãi phải trả"),
      t("v2.loans.table.totalDue", "Tổng phải trả"),
      t("v2.loans.table.endingBalance", "Dư nợ còn lại"),
      t("v2.loans.table.activeLoans", "Số khoản"),
    ];

    const rows = schedule.map((p) => [
      p.monthKey,
      p.paymentDate,
      Math.round(p.principalDue),
      Math.round(p.interestDue),
      Math.round(p.totalPayment),
      Math.round(p.remainingPrincipal),
      p.loansCount,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `lich-tra-no-danh-muc-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
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
                    <tr className="bg-muted/15">
                      <td colSpan={7} className="py-2 px-6">
                        <div className="space-y-1 text-xs">
                          {p.breakdown.map((item, bIdx) => (
                            <div
                              key={bIdx}
                              className="flex justify-between py-1 border-b border-border/30 last:border-0"
                            >
                              <span className="font-medium text-foreground">
                                {item.loanName}:
                              </span>
                              <span className="text-muted-foreground">
                                Gốc: {formatVndCurrency(item.principalDue)} |
                                Lãi: {formatVndCurrency(item.interestDue)} |
                                Tổng:{" "}
                                <strong>
                                  {formatVndCurrency(item.totalPayment)}
                                </strong>
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border bg-muted/50 font-bold text-xs uppercase">
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
