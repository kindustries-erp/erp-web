import React from "react";
import { TrendingUp, Calendar } from "lucide-react";
import { Combobox } from "@/shared/components/Combobox";
import { EmptyState } from "@/shared/components/EmptyState";

import type { GarageConversionFunnelCardProps } from "./types";
import { useGarageConversionFunnelLogic } from "./useGarageConversionFunnelLogic";
import { FunnelOverviewCards } from "./components/FunnelOverviewCards";
import { FunnelChartsGrid } from "./components/FunnelChartsGrid";
import { FunnelSpreadsheetTable } from "./components/FunnelSpreadsheetTable";
import { GarageCheckpointDrawer } from "../GarageCheckpointDrawer";

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
    quotation,
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
    classificationDrawer,
    handleClassificationClick,
    handleStageClick,
    closeClassificationDrawer,
  } = useGarageConversionFunnelLogic(props);

  const hasData =
    loading || (activeFunnel && activeFunnel.totalIntake.count > 0);

  return (
    <div className="flex flex-col gap-4">
      {/* SECTION HEADER: BADGE (LEFT) ── HORIZONTAL DIVIDER (MIDDLE) ── PERIOD PICKER (RIGHT) */}
      <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-md border border-slate-200/80 dark:border-slate-700 shadow-sm flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-primary" />
            {t(
              "dashboard.funnel.hubTitle",
              "Pipeline Dự Thu & Phễu Chuyển Đổi Dịch Vụ",
            )}
          </h4>
          <span className="text-[11px] text-muted-foreground hidden lg:inline">
            *{" "}
            {t(
              "dashboard.funnel.hubDesc",
              "Theo dõi luồng chuyển đổi từ Tiếp nhận đến Nghiệm thu doanh thu & Dự thu theo 4 phân loại ERP",
            )}
          </span>
        </div>

        <div className="h-px bg-slate-200/80 dark:bg-slate-700 flex-1 hidden md:block" />

        {/* Enhanced Month Selector Combobox (Header Right) */}
        <div className="h-7 flex items-center bg-surface border border-border/90 rounded-md px-2 shadow-2xs shrink-0 w-full sm:w-auto">
          <div className="flex items-center justify-center w-4 h-4 rounded bg-primary/10 text-primary shrink-0 mr-1.5">
            <Calendar className="w-3 h-3" />
          </div>
          <div className="min-w-[170px] sm:min-w-[195px] flex-1">
            <Combobox
              options={monthOptions}
              value={selectedMonth}
              onChange={(val) => setSelectedMonth(val || "ALL")}
              allowClear={false}
              variant="ghost"
              placeholder={t(
                "dashboard.funnel.selectMonthPlaceholder",
                "Chọn tháng...",
              )}
              className="h-6 text-xs font-medium text-foreground px-1"
            />
          </div>
        </div>
      </div>

      {!hasData ? (
        <div className="bg-surface border border-border rounded-xl card-shadow p-5 flex flex-col justify-center items-center min-h-[260px]">
          <EmptyState
            message={t(
              "dashboard.funnel.noFunnelData",
              "Chưa có dữ liệu phễu chuyển đổi trong khoảng thời gian này",
            )}
            size="sm"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* CARD 1: 5 Cards Phễu Chuyển Đổi & Bảng Chi Tiết Phễu */}
          <div className="bg-surface border border-border rounded-xl card-shadow p-5 flex flex-col gap-4">
            <FunnelOverviewCards
              totalIntake={totalIntake}
              quotation={quotation}
              inProgress={inProgress}
              completed={completed}
              cancelled={cancelled}
              projectedToday={projectedToday}
              projectedMonth={projectedMonth}
              onStageClick={handleStageClick}
            />
            <FunnelSpreadsheetTable
              tableRows={tableRows}
              totalIntake={totalIntake}
              quotation={quotation}
              inProgress={inProgress}
              completed={completed}
              cancelled={cancelled}
              onClassificationClick={handleClassificationClick}
            />
          </div>

          {/* CARD 2: Phân Tích Xu Hướng & Cơ Cấu Chuyển Đổi (3 Biểu đồ Song Song) */}
          <div className="bg-surface border border-border rounded-xl card-shadow p-5 flex flex-col gap-4">
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
              onClassificationClick={handleClassificationClick}
            />
          </div>
        </div>
      )}

      <GarageCheckpointDrawer
        open={classificationDrawer.open}
        onClose={closeClassificationDrawer}
        dateFrom={classificationDrawer.dateFrom}
        dateTo={classificationDrawer.dateTo}
        periodLabel={classificationDrawer.periodLabel}
        classification={classificationDrawer.classification}
        classificationName={classificationDrawer.classificationName}
        initialStatus={classificationDrawer.initialStatus}
        isFunnel={classificationDrawer.isFunnel}
        branchId={classificationDrawer.branchId}
      />
    </div>
  );
}
