import React, { useState } from "react";
import { Download } from "lucide-react";
import { V2Badge, V2Button } from "@/v2/shared/components";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/v2/shared/ui";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { exportAmortizationScheduleCsv } from "./AmortizationScheduleTable.helper";
import { AmortizationScheduleRow } from "./AmortizationScheduleTable.row";
import { AmortizationScheduleFooter } from "./AmortizationScheduleTable.footer";
import type { AmortizationScheduleTableProps } from "./AmortizationScheduleTable.type";

export const AmortizationScheduleTable: React.FC<
  AmortizationScheduleTableProps
> = ({
  schedule,
  contractSchedule,
  className = "",
  showExportButton = true,
  paidPeriodNumbers,
  onRecordPeriod,
}) => {
  const { t } = useV2Translation();
  const [viewMode, setViewMode] = useState<"effective" | "contract">(
    "effective",
  );

  const activeSchedule =
    viewMode === "contract" && contractSchedule && contractSchedule.length > 0
      ? contractSchedule
      : schedule;

  const handleExportCsv = () => {
    exportAmortizationScheduleCsv(activeSchedule, [
      t("v2.loans.table.period", "Kỳ"),
      t("v2.loans.table.dueDate", "Ngày đến hạn"),
      t("v2.loans.table.beginningBalance", "Dư nợ đầu kỳ"),
      t("v2.loans.table.principalDue", "Gốc phải trả"),
      t("v2.loans.table.interestDue", "Lãi phải trả"),
      t("v2.loans.table.totalDue", "Tổng phải trả"),
      t("v2.loans.table.endingBalance", "Dư nợ cuối kỳ"),
    ]);
  };

  const showActions = Boolean(onRecordPeriod || paidPeriodNumbers);
  const hasContractSchedule = Boolean(
    contractSchedule && contractSchedule.length > 0,
  );

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <V2Badge
            variant="outline"
            className="text-xs font-normal text-muted-foreground"
          >
            {activeSchedule.length} {t("v2.loans.table.periodsCount", "kỳ")}
          </V2Badge>
          {hasContractSchedule && (
            <div className="inline-flex rounded-lg border border-border bg-muted/30 p-0.5 gap-1">
              <V2Button
                type="button"
                size="xs"
                variant={viewMode === "effective" ? "secondary" : "ghost"}
                onClick={() => setViewMode("effective")}
                className="h-6 px-2 text-xs font-medium"
              >
                {t("v2.loans.table.effectiveView", "Lịch thực tế & tính lại")}
              </V2Button>
              <V2Button
                type="button"
                size="xs"
                variant={viewMode === "contract" ? "secondary" : "ghost"}
                onClick={() => setViewMode("contract")}
                className="h-6 px-2 text-xs font-medium"
              >
                {t("v2.loans.table.contractView", "Lịch theo hợp đồng")}
              </V2Button>
            </div>
          )}
        </div>

        {showExportButton && (
          <V2Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {t("v2.loans.table.exportExcel", "Xuất CSV")}
          </V2Button>
        )}
      </div>

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
            {activeSchedule.map((row, index) => (
              <AmortizationScheduleRow
                key={row.periodNumber}
                row={row}
                index={index}
                showActions={showActions}
                isPaid={Boolean(
                  row.isPaid || paidPeriodNumbers?.has(row.periodNumber),
                )}
                onRecordPeriod={onRecordPeriod}
              />
            ))}
          </TableBody>
          <AmortizationScheduleFooter
            schedule={activeSchedule}
            showActions={showActions}
          />
        </Table>
      </div>
    </div>
  );
};
AmortizationScheduleTable.displayName = "AmortizationScheduleTable";
