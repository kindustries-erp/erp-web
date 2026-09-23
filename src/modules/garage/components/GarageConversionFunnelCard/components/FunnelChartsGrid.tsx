import React from "react";
import { useTranslation } from "react-i18next";
import { BarChart3 } from "lucide-react";
import { Switch } from "@/shared/components/ui/switch";
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
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-primary" />
            {t(
              "dashboard.funnel.chartsSectionTitle",
              "Phân Tích Xu Hướng & Cơ Cấu Chuyển Đổi",
            )}
          </span>
          <span className="text-[11px] text-muted-foreground hidden sm:inline">
            •{" "}
            {selectedMonth === "ALL"
              ? t("dashboard.funnel.allSixMonthsView", "Toàn bộ 6 tháng")
              : formatMonthLabel(selectedMonth)}
          </span>
        </div>

        {/* View Mode Toggle Switch (Invoice Dashboard Style) */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <span
            className={cn(
              "text-xs cursor-pointer select-none transition-colors",
              isAmount
                ? "font-semibold text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
            onClick={() => setViewMode("AMOUNT")}
          >
            {t("dashboard.funnel.viewByAmount", "Giá trị (VND)")}
          </span>
          <Switch
            checked={!isAmount}
            onCheckedChange={(checked) =>
              setViewMode(checked ? "COUNT" : "AMOUNT")
            }
            aria-label="Chuyển đổi xem Giá trị hoặc Số lượng"
          />
          <span
            className={cn(
              "text-xs cursor-pointer select-none transition-colors",
              !isAmount
                ? "font-semibold text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
            onClick={() => setViewMode("COUNT")}
          >
            {t("dashboard.funnel.viewByCount", "Số lượng (Xe)")}
          </span>
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
