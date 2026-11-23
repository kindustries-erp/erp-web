import React, { useMemo } from "react";
import { V2StandardTable } from "@/v2/shared/components/organisms/v2-standard-table";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { exportPortfolioScheduleCsv } from "../../../domain/rules/loan-format.rule";
import type { PortfolioMonthlyPeriod } from "../../../domain/types/loan.types";
import { PortfolioBreakdownRow } from "./PortfolioBreakdownRow";
import { PortfolioScheduleHeader } from "./PortfolioScheduleHeader";
import { buildPortfolioScheduleColumns } from "./PortfolioScheduleTable.columns";
import type { PortfolioScheduleTableProps } from "./PortfolioScheduleTable.type";

/**
 * Bảng Lịch Trả Nợ Danh Mục Theo Tháng dùng chung V2StandardTable chuẩn hệ thống.
 * Hỗ trợ mở rộng dòng (Expand Row) xem chi tiết từng khoản vay cấu thành.
 */
export const PortfolioScheduleTable: React.FC<PortfolioScheduleTableProps> = ({
  schedule,
  title,
  description,
  className = "",
  onRecordPayment,
}) => {
  const { t } = useV2Translation();

  const hasAnyBreakdown = useMemo(
    () => schedule.some((p) => Boolean(p.breakdown && p.breakdown.length > 0)),
    [schedule],
  );

  const columns = useMemo(
    () => buildPortfolioScheduleColumns(t, hasAnyBreakdown),
    [t, hasAnyBreakdown],
  );

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

      <div className="p-4">
        <V2StandardTable<PortfolioMonthlyPeriod>
          tableId="portfolio-monthly-schedule-table"
          mode="client"
          columns={columns}
          items={schedule}
          getRowKey={(row) => row.monthKey}
          initialQuery={{ pageSize: 12 }}
          containerClassName="max-h-[560px]"
          enableColumnVisibility={false}
          canExpandRow={(row) =>
            Boolean(row.breakdown && row.breakdown.length > 0)
          }
          renderExpandedRow={(row) =>
            row.breakdown && row.breakdown.length > 0 ? (
              <PortfolioBreakdownRow
                items={row.breakdown}
                onRecordPayment={onRecordPayment}
              />
            ) : null
          }
          emptyLabel={t(
            "v2.loans.table.emptySchedule",
            "Chưa có dữ liệu lịch trả nợ.",
          )}
        />
      </div>
    </div>
  );
};
PortfolioScheduleTable.displayName = "PortfolioScheduleTable";
