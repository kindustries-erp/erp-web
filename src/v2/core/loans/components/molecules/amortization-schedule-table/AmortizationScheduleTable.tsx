import React from "react";
import { Download } from "lucide-react";
import { V2Badge, V2Button } from "@/v2/shared/components";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/v2/shared/ui";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { formatVndCurrency } from "../../../domain/rules/loan-format.rule";
import { exportAmortizationScheduleCsv } from "./AmortizationScheduleTable.helper";
import { AmortizationScheduleRow } from "./AmortizationScheduleTable.row";
import type { AmortizationScheduleTableProps } from "./AmortizationScheduleTable.type";

export const AmortizationScheduleTable: React.FC<
  AmortizationScheduleTableProps
> = ({
  schedule,
  className = "",
  showExportButton = true,
  paidPeriodNumbers,
  onRecordPeriod,
}) => {
  const { t } = useV2Translation();

  const handleExportCsv = () => {
    exportAmortizationScheduleCsv(schedule, [
      t("v2.loans.table.period", "Kỳ"),
      t("v2.loans.table.dueDate", "Ngày đến hạn"),
      t("v2.loans.table.beginningBalance", "Dư nợ đầu kỳ"),
      t("v2.loans.table.principalDue", "Gốc phải trả"),
      t("v2.loans.table.interestDue", "Lãi phải trả"),
      t("v2.loans.table.totalDue", "Tổng phải trả"),
      t("v2.loans.table.endingBalance", "Dư nợ cuối kỳ"),
    ]);
  };

  const totalPrincipal = schedule.reduce((sum, p) => sum + p.principalDue, 0);
  const totalInterest = schedule.reduce((sum, p) => sum + p.interestDue, 0);
  const totalPayment = schedule.reduce((sum, p) => sum + p.totalPaymentDue, 0);
  const showActions = Boolean(onRecordPeriod || paidPeriodNumbers);

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

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Table className="text-left text-sm border-collapse">
          <TableHeader>
            <TableRow className="border-b border-border bg-muted/40 text-xs font-semibold uppercase text-muted-foreground hover:bg-muted/40">
              <TableHead className="h-auto py-3 px-4 text-center">
                {t("v2.loans.table.period", "Kỳ")}
              </TableHead>
              <TableHead className="h-auto py-3 px-4">
                {t("v2.loans.table.dueDate", "Ngày đến hạn")}
              </TableHead>
              <TableHead className="h-auto py-3 px-4 text-right">
                {t("v2.loans.table.beginningBalance", "Dư nợ đầu kỳ")}
              </TableHead>
              <TableHead className="h-auto py-3 px-4 text-right">
                {t("v2.loans.table.principalDue", "Gốc phải trả")}
              </TableHead>
              <TableHead className="h-auto py-3 px-4 text-right">
                {t("v2.loans.table.interestDue", "Lãi phải trả")}
              </TableHead>
              <TableHead className="h-auto py-3 px-4 text-right">
                {t("v2.loans.table.totalDue", "Tổng phải trả")}
              </TableHead>
              <TableHead className="h-auto py-3 px-4 text-right">
                {t("v2.loans.table.endingBalance", "Dư nợ cuối kỳ")}
              </TableHead>
              {showActions && (
                <TableHead className="h-auto py-3 px-3 text-center">
                  {t("v2.common.actions", "Trạng thái")}
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border">
            {schedule.map((row, index) => (
              <AmortizationScheduleRow
                key={row.periodNumber}
                row={row}
                index={index}
                showActions={showActions}
                isPaid={Boolean(paidPeriodNumbers?.has(row.periodNumber))}
                onRecordPeriod={onRecordPeriod}
              />
            ))}
          </TableBody>
          <TableFooter className="border-t-2 border-border bg-muted/60 font-bold">
            <TableRow className="hover:bg-muted/60">
              <TableCell
                colSpan={3}
                className="py-3 px-4 text-center uppercase tracking-wide text-xs"
              >
                {t("v2.common.total", "Tổng cộng")}
              </TableCell>
              <TableCell className="py-3 px-4 text-right font-mono tabular-nums text-primary">
                {formatVndCurrency(totalPrincipal)}
              </TableCell>
              <TableCell className="py-3 px-4 text-right font-mono tabular-nums text-amber-600 dark:text-amber-400">
                {formatVndCurrency(totalInterest)}
              </TableCell>
              <TableCell className="py-3 px-4 text-right font-mono tabular-nums text-base font-bold">
                {formatVndCurrency(totalPayment)}
              </TableCell>
              <TableCell className="py-3 px-4 text-right font-mono tabular-nums text-muted-foreground">
                0 ₫
              </TableCell>
              {showActions && <TableCell className="py-3 px-3" />}
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
};
AmortizationScheduleTable.displayName = "AmortizationScheduleTable";
