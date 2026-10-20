import React from "react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { RotateCcw } from "lucide-react";
import type { ForecastScheduleRow } from "../types";

export interface TimeHorizonScheduleTableProps {
  rows: ForecastScheduleRow[];
  totalRowsCount: number;
  columns: DataTableColumn<ForecastScheduleRow>[];
  summaryRow: Record<string, React.ReactNode>;
  activeFilterCount: number;
  onResetFilters: () => void;
  t: (key: string, fallback?: any) => string;
}

export function TimeHorizonScheduleTable({
  rows,
  totalRowsCount,
  columns,
  summaryRow,
  activeFilterCount,
  onResetFilters,
  t,
}: TimeHorizonScheduleTableProps) {
  return (
    <DrawerSection
      title={
        <div className="flex items-center justify-between w-full pr-2">
          <span>
            {t(
              "debts:horizonDrawer.forecastScheduleTableTitle",
              "Bảng Kê Lịch Trình Thu/Chi Dự Kiến theo Ngày",
            )}{" "}
            ({rows.length} / {totalRowsCount})
          </span>
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onResetFilters();
              }}
              className="h-5 px-1.5 text-[10px] font-medium text-destructive hover:bg-destructive/10 flex items-center gap-1 rounded border border-destructive/20 cursor-pointer"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>
                {t("common:clearFilters", "Xóa bộ lọc")} ({activeFilterCount})
              </span>
            </button>
          )}
        </div>
      }
      collapsible
      defaultCollapsed={false}
      bodyClassName="p-0"
    >
      <DataTable<ForecastScheduleRow>
        tableId="time-horizon-forecast-schedule-table"
        items={rows}
        columns={columns}
        variant="spreadsheet"
        enableColumnResizing={true}
        getRowKey={(r) => r.dateKey}
        summaryRow={summaryRow}
        containerClassName="max-h-[380px] overflow-y-auto scrollbar-thin"
        emptyLabel={t(
          "debts:horizonDrawer.emptyScheduleData",
          "Không có dữ liệu lịch trình phù hợp",
        )}
      />
    </DrawerSection>
  );
}
