import React from "react";
import { TrendingUp, RotateCcw, Calendar } from "lucide-react";
import { Combobox } from "@/shared/components/Combobox";
import { EmptyState } from "@/shared/components/EmptyState";
import { Button } from "@/shared/components/ui/Button";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/utils";

import type { GarageConversionFunnelCardProps } from "./types";
import { useGarageConversionFunnelLogic } from "./useGarageConversionFunnelLogic";
import { formatMonthLabel } from "./utils/funnelConfig";
import { FunnelOverviewCards } from "./components/FunnelOverviewCards";
import { FunnelChartsGrid } from "./components/FunnelChartsGrid";
import { FunnelSpreadsheetTable } from "./components/FunnelSpreadsheetTable";

export function GarageConversionFunnelCard(
  props: GarageConversionFunnelCardProps,
) {
  const {
    t,
    loading,
    gridColor,
    tickColor,
    selectedMonth,
    setSelectedMonth,
    viewMode,
    setViewMode,
    isAmount,
    activeFunnel,
    monthOptions,
    totalIntake,
    inProgress,
    completed,
    cancelled,
    projectedToday,
    projectedMonth,
    timelineMonths,
    timelineLabels,
    timelineDatasets,
    classificationDonutItems,
    totalClassificationVal,
    statusDonutItems,
    totalStatusVal,
    tableRows,
  } = useGarageConversionFunnelLogic(props);

  if (!loading && (!activeFunnel || activeFunnel.totalIntake.count === 0)) {
    return (
      <div className="bg-surface border border-border rounded-xl card-shadow p-5 flex flex-col justify-center items-center min-h-[300px]">
        <EmptyState
          message={t(
            "dashboard.funnel.noFunnelData",
            "Chưa có dữ liệu phễu chuyển đổi trong khoảng thời gian này",
          )}
          size="sm"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* SECTION HEADER BADGE */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-md border border-slate-200/80 dark:border-slate-700 shadow-sm flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-primary" />
            {t(
              "dashboard.funnel.hubTitle",
              "Pipeline Dự Thu & Phễu Chuyển Đổi Dịch Vụ",
            )}
          </h4>
          <span className="text-[11px] text-muted-foreground hidden sm:inline">
            *{" "}
            {t(
              "dashboard.funnel.hubDesc",
              "Theo dõi luồng chuyển đổi từ Tiếp nhận đến Nghiệm thu doanh thu & Dự thu theo 4 phân loại ERP",
            )}
          </span>
        </div>
        <div className="h-px bg-slate-200/80 dark:bg-slate-700 flex-1 hidden md:block" />
      </div>

      {/* MAIN CONTAINER CARD */}
      <div className="bg-surface border border-border rounded-xl card-shadow p-5 flex flex-col gap-5">
        {/* Header Filter Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground font-medium">
              {t("dashboard.funnel.monthFilterLabel", "Đang xem chi tiết:")}
            </span>
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-semibold px-2 py-0.5",
                selectedMonth === "ALL"
                  ? "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300"
                  : "bg-primary/10 text-primary border-primary/30",
              )}
            >
              {selectedMonth === "ALL"
                ? t("dashboard.funnel.allSixMonthsView", "Toàn bộ 6 tháng")
                : formatMonthLabel(selectedMonth)}
            </Badge>
            {selectedMonth !== "ALL" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedMonth("ALL")}
                className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1"
                title={t(
                  "dashboard.funnel.resetToAllMonths",
                  "Xem toàn bộ 6 tháng",
                )}
              >
                <RotateCcw className="w-3 h-3" />
                {t("dashboard.funnel.resetToAllMonths", "Xem toàn bộ 6 tháng")}
              </Button>
            )}
          </div>

          {/* Month Selector Combobox (Header Right) */}
          <div className="flex items-center gap-1.5 min-w-[210px] max-w-[260px]">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <div className="flex-1">
              <Combobox
                options={monthOptions}
                value={selectedMonth}
                onChange={(val) => setSelectedMonth(val || "ALL")}
                allowClear={false}
                placeholder="Chọn tháng..."
                className="h-7 text-xs"
              />
            </div>
          </div>
        </div>

        {/* TẦNG 1: 4 Cards Phễu Chuyển Đổi & Thanh Tỷ Lệ */}
        <FunnelOverviewCards
          totalIntake={totalIntake}
          inProgress={inProgress}
          completed={completed}
          cancelled={cancelled}
          projectedToday={projectedToday}
          projectedMonth={projectedMonth}
        />

        {/* TẦNG 2: 3 Biểu đồ Song Song */}
        <FunnelChartsGrid
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          viewMode={viewMode}
          setViewMode={setViewMode}
          isAmount={isAmount}
          timelineMonths={timelineMonths}
          timelineLabels={timelineLabels}
          timelineDatasets={timelineDatasets}
          classificationDonutItems={classificationDonutItems}
          totalClassificationVal={totalClassificationVal}
          statusDonutItems={statusDonutItems}
          totalStatusVal={totalStatusVal}
          gridColor={gridColor}
          tickColor={tickColor}
        />

        {/* TẦNG 3: Bảng Spreadsheet 4 Phân Loại ERP */}
        <FunnelSpreadsheetTable
          tableRows={tableRows}
          totalIntake={totalIntake}
          inProgress={inProgress}
          completed={completed}
          cancelled={cancelled}
        />
      </div>
    </div>
  );
}
