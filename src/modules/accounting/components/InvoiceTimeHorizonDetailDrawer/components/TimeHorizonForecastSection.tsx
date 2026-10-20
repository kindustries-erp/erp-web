import React from "react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { BarChart } from "@/shared/components/charts/BarChart";
import { LineChart } from "@/shared/components/charts/LineChart";
import { DonutChart, DonutLegend } from "@/shared/components/charts/DonutChart";
import { ChartSkeleton } from "@/shared/components/ChartSkeleton";
import { TimeHorizonScheduleTable } from "./TimeHorizonScheduleTable";
import { money } from "@/shared/utils/format";
import type { DataTableColumn } from "@/shared/components/DataTable";
import type { ForecastScheduleRow } from "../types";

export interface TimeHorizonForecastSectionProps {
  isLoading: boolean;
  dailyForecastBarData: { labels: string[]; datasets: any[] };
  cumulativeForecastData: { labels: string[]; datasets: any[] };
  forecastCompositionItems: Array<{
    label: string;
    value: number;
    color: string;
  }>;
  scheduleRows: ForecastScheduleRow[];
  totalScheduleRowsCount: number;
  scheduleColumns: DataTableColumn<ForecastScheduleRow>[];
  scheduleSummaryRow: Record<string, React.ReactNode>;
  scheduleActiveFilterCount: number;
  onResetScheduleFilters: () => void;
  t: (key: string, fallback?: any) => string;
}

export function TimeHorizonForecastSection({
  isLoading,
  dailyForecastBarData,
  cumulativeForecastData,
  forecastCompositionItems,
  scheduleRows,
  totalScheduleRowsCount,
  scheduleColumns,
  scheduleSummaryRow,
  scheduleActiveFilterCount,
  onResetScheduleFilters,
  t,
}: TimeHorizonForecastSectionProps) {
  return (
    <div className="space-y-4 pt-1">
      {/* HÀNG 1: BIỂU ĐỒ DỰ BÁO NGÀY & DÒNG TIỀN TÍCH LŨY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Biểu đồ Cột: Dự thu vs Dự chi theo Ngày */}
        <DrawerSection
          title={t(
            "debts:horizonDrawer.forecastDailyTimelineTitle",
            "Lịch trình Dự thu / Dự chi theo Ngày",
          )}
          collapsible
          defaultCollapsed={false}
        >
          <div className="relative h-[240px] w-full pt-1">
            {isLoading ? (
              <ChartSkeleton />
            ) : dailyForecastBarData.labels.length > 0 ? (
              <BarChart
                labels={dailyForecastBarData.labels}
                datasets={dailyForecastBarData.datasets}
                showLegend={true}
                yCallback={(v) => money(Number(v))}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground italic">
                {t("common:noData", "Không có dữ liệu biểu đồ")}
              </div>
            )}
          </div>
        </DrawerSection>

        {/* Biểu đồ Đường: Dòng tiền Dự báo Tích lũy */}
        <DrawerSection
          title={t(
            "debts:horizonDrawer.forecastCumulativeTitle",
            "Dòng tiền Dự báo Tích lũy & Vị thế Ròng",
          )}
          collapsible
          defaultCollapsed={false}
        >
          <div className="relative h-[240px] w-full pt-1">
            {isLoading ? (
              <ChartSkeleton />
            ) : cumulativeForecastData.labels.length > 0 ? (
              <LineChart
                labels={cumulativeForecastData.labels}
                datasets={cumulativeForecastData.datasets}
                showLegend={true}
                yCallback={(v) => money(Number(v))}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground italic">
                {t("common:noData", "Không có dữ liệu biểu đồ")}
              </div>
            )}
          </div>
        </DrawerSection>
      </div>

      {/* HÀNG 2: BÓC TÁCH CƠ CẤU NGUỒN TIỀN DỰ BÁO */}
      {(isLoading || forecastCompositionItems.length > 0) && (
        <DrawerSection
          title={t(
            "debts:horizonDrawer.forecastCompositionTitle",
            "Cơ cấu Nguồn Tiền Dự báo",
          )}
          collapsible
          defaultCollapsed={false}
        >
          <div className="relative h-[200px] w-full pt-1">
            {isLoading ? (
              <ChartSkeleton />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center h-full">
                <div className="h-[180px] flex items-center justify-center">
                  <DonutChart
                    items={forecastCompositionItems}
                    cutout="65%"
                    valueFormatter={(v) => money(Number(v))}
                  />
                </div>
                <div className="space-y-2">
                  <DonutLegend
                    items={forecastCompositionItems}
                    valueFormatter={money}
                  />
                </div>
              </div>
            )}
          </div>
        </DrawerSection>
      )}

      {/* HÀNG 3: BẢNG KÊ LỊCH TRÌNH THU/CHI THEO NGÀY */}
      <TimeHorizonScheduleTable
        rows={scheduleRows}
        totalRowsCount={totalScheduleRowsCount}
        columns={scheduleColumns}
        summaryRow={scheduleSummaryRow}
        activeFilterCount={scheduleActiveFilterCount}
        onResetFilters={onResetScheduleFilters}
        t={t}
      />
    </div>
  );
}
