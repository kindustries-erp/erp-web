import React from "react";
import { useTranslation } from "react-i18next";
import { BarChart3, DollarSign, Layers } from "lucide-react";
import { cn } from "@/shared/utils";
import { formatMonthLabel } from "../utils/funnelConfig";
import { FunnelTimelineChart } from "./FunnelTimelineChart";
import { FunnelClassificationDonutChart } from "./FunnelClassificationDonutChart";
import { FunnelStatusDonutChart } from "./FunnelStatusDonutChart";

interface DonutItem {
  label: string;
  value: number;
  color: string;
}

interface FunnelChartsGridProps {
  selectedMonth: string;
  setSelectedMonth: (val: string) => void;
  viewMode?: "AMOUNT" | "COUNT";
  setViewMode: (val: "AMOUNT" | "COUNT") => void;
  isAmount: boolean;
  timelineMonths: string[];
  timelineLabels: string[];
  timelineDatasets: any[];
  classificationDonutItems: DonutItem[];
  totalClassificationVal: number;
  statusDonutItems: DonutItem[];
  totalStatusVal: number;
  gridColor?: string;
  tickColor?: string;
}

export function FunnelChartsGrid({
  selectedMonth,
  setSelectedMonth,
  setViewMode,
  isAmount,
  timelineMonths,
  timelineLabels,
  timelineDatasets,
  classificationDonutItems,
  totalClassificationVal,
  statusDonutItems,
  totalStatusVal,
  gridColor,
  tickColor,
}: FunnelChartsGridProps) {
  const { t } = useTranslation("garage");

  return (
    <div className="flex flex-col gap-3">
      {/* Sub-header / Toolbar for Charts */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-border/60">
        <div className="flex items-center gap-2 flex-wrap">
          <BarChart3 className="w-4 h-4 text-primary" />
          <h5 className="text-xs font-semibold text-foreground">
            {t(
              "dashboard.funnel.chartsSectionTitle",
              "Phân Tích Xu Hướng & Cơ Cấu Chuyển Đổi",
            )}
          </h5>
          <span className="text-[11px] text-muted-foreground hidden sm:inline">
            •{" "}
            {selectedMonth === "ALL"
              ? t("dashboard.funnel.allSixMonthsView", "Toàn bộ 6 tháng")
              : formatMonthLabel(selectedMonth)}
          </span>
        </div>

        {/* View Mode Toggle Switch */}
        <div className="flex items-center bg-muted/70 p-0.5 rounded-lg border border-border">
          <button
            type="button"
            onClick={() => setViewMode("AMOUNT")}
            className={cn(
              "px-2.5 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1 cursor-pointer select-none",
              isAmount
                ? "bg-surface text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <DollarSign className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            {t("dashboard.funnel.viewByAmount", "Giá trị (VND)")}
          </button>
          <button
            type="button"
            onClick={() => setViewMode("COUNT")}
            className={cn(
              "px-2.5 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1 cursor-pointer select-none",
              !isAmount
                ? "bg-surface text-foreground shadow-xs font-semibold text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Layers className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
            {t("dashboard.funnel.viewByCount", "Số lượng (Xe)")}
          </button>
        </div>
      </div>

      {/* Grid 12 cột */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
        {/* CỘT 1 (6 cols): TIMELINE CHART */}
        <FunnelTimelineChart
          timelineMonths={timelineMonths}
          timelineLabels={timelineLabels}
          timelineDatasets={timelineDatasets}
          isAmount={isAmount}
          setSelectedMonth={setSelectedMonth}
          gridColor={gridColor}
          tickColor={tickColor}
        />

        {/* CỘT 2 (3 cols): DONUT CHART CƠ CẤU NGHIỆP VỤ ERP */}
        <FunnelClassificationDonutChart
          items={classificationDonutItems}
          totalValue={totalClassificationVal}
          isAmount={isAmount}
        />

        {/* CỘT 3 (3 cols): DONUT CHART PHÂN BỔ TRẠNG THÁI DV */}
        <FunnelStatusDonutChart
          items={statusDonutItems}
          totalValue={totalStatusVal}
          isAmount={isAmount}
        />
      </div>
    </div>
  );
}
