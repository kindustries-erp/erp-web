import React from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2Badge, V2Button, V2Text } from "@/v2/shared/components";
import { Download } from "lucide-react";
import { formatVndCurrency } from "../../../domain/rules/loan-format.rule";
import { AmortizationScheduleTableProps } from "./AmortizationScheduleTable.type";

export const AmortizationScheduleTable: React.FC<
  AmortizationScheduleTableProps
> = ({ schedule, className = "", showExportButton = true }) => {
  const { t } = useV2Translation();

  const handleExportCsv = () => {
    const headers = [
      t("v2.loans.table.period", "Kỳ"),
      t("v2.loans.table.dueDate", "Ngày đến hạn"),
      t("v2.loans.table.beginningBalance", "Dư nợ đầu kỳ"),
      t("v2.loans.table.principalDue", "Gốc phải trả"),
      t("v2.loans.table.interestDue", "Lãi phải trả"),
      t("v2.loans.table.totalDue", "Tổng phải trả"),
      t("v2.loans.table.endingBalance", "Dư nợ cuối kỳ"),
    ];

    const rows = schedule.map((p) => [
      p.periodNumber,
      p.dueDate,
      Math.round(p.beginningBalance),
      Math.round(p.principalDue),
      Math.round(p.interestDue),
      Math.round(p.totalPaymentDue),
      Math.round(p.endingBalance),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bang-tinh-khoan-vay-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPrincipal = schedule.reduce((sum, p) => sum + p.principalDue, 0);
  const totalInterest = schedule.reduce((sum, p) => sum + p.interestDue, 0);
  const totalPayment = schedule.reduce((sum, p) => sum + p.totalPaymentDue, 0);

  return (
    <div className={`space-y-3 ${className}`}>
      {showExportButton && (
        <div className="flex justify-between items-center">
          <V2Badge
            variant="outline"
            className="text-xs font-normal text-muted-foreground"
          >
            {schedule.length}{" "}
            {t("v2.loans.table.periodsCount", "kỳ thanh toán")}
          </V2Badge>
          <V2Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {t("v2.loans.table.exportExcel", "Xuất bảng tính CSV")}
          </V2Button>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
              <th className="py-3 px-4 text-center">
                {t("v2.loans.table.period", "Kỳ")}
              </th>
              <th className="py-3 px-4">
                {t("v2.loans.table.dueDate", "Ngày đến hạn")}
              </th>
              <th className="py-3 px-4 text-right">
                {t("v2.loans.table.beginningBalance", "Dư nợ đầu kỳ")}
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
                {t("v2.loans.table.endingBalance", "Dư nợ cuối kỳ")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {schedule.map((row, index) => (
              <tr
                key={row.periodNumber}
                className={`hover:bg-muted/30 transition-colors ${
                  index % 2 === 1 ? "bg-muted/10" : ""
                }`}
              >
                <td className="py-2.5 px-4 text-center">
                  <V2Text variant="body" className="font-medium">
                    {row.periodNumber}
                  </V2Text>
                </td>
                <td className="py-2.5 px-4">
                  <V2Text
                    variant="caption"
                    className="text-muted-foreground font-mono"
                  >
                    {row.dueDate}
                  </V2Text>
                </td>
                <td className="py-2.5 px-4 text-right font-mono tabular-nums">
                  {formatVndCurrency(row.beginningBalance)}
                </td>
                <td className="py-2.5 px-4 text-right font-mono tabular-nums font-medium text-primary">
                  {formatVndCurrency(row.principalDue)}
                </td>
                <td className="py-2.5 px-4 text-right font-mono tabular-nums text-amber-600 dark:text-amber-400">
                  {formatVndCurrency(row.interestDue)}
                </td>
                <td className="py-2.5 px-4 text-right font-mono tabular-nums font-semibold">
                  {formatVndCurrency(row.totalPaymentDue)}
                </td>
                <td className="py-2.5 px-4 text-right font-mono tabular-nums text-muted-foreground">
                  {formatVndCurrency(row.endingBalance)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border bg-muted/60 font-bold">
              <td
                colSpan={3}
                className="py-3 px-4 text-center uppercase tracking-wide text-xs"
              >
                {t("v2.common.total", "Tổng cộng")}
              </td>
              <td className="py-3 px-4 text-right font-mono tabular-nums text-primary">
                {formatVndCurrency(totalPrincipal)}
              </td>
              <td className="py-3 px-4 text-right font-mono tabular-nums text-amber-600 dark:text-amber-400">
                {formatVndCurrency(totalInterest)}
              </td>
              <td className="py-3 px-4 text-right font-mono tabular-nums text-base font-bold">
                {formatVndCurrency(totalPayment)}
              </td>
              <td className="py-3 px-4 text-right font-mono tabular-nums text-muted-foreground">
                0 ₫
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
AmortizationScheduleTable.displayName = "AmortizationScheduleTable";
