import React from "react";
import { useTranslation } from "react-i18next";
import { BarChart3 } from "lucide-react";
import { Chart } from "react-chartjs-2";
import "@/shared/utils/chartSetup";
import { money, shortMoney } from "@/shared/utils/format";

interface FunnelTimelineChartProps {
  timelineMonths: string[];
  timelineLabels: string[];
  timelineDatasets: any[];
  isAmount: boolean;
  setSelectedMonth: (val: string) => void;
  gridColor?: string;
  tickColor?: string;
}

export function FunnelTimelineChart({
  timelineMonths,
  timelineLabels,
  timelineDatasets,
  isAmount,
  setSelectedMonth,
  gridColor,
  tickColor,
}: FunnelTimelineChartProps) {
  const { t } = useTranslation("garage");

  return (
    <div className="col-span-12 md:col-span-2 lg:col-span-6 bg-slate-50/50 dark:bg-slate-900/30 border border-border/80 rounded-xl p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-1.5 mb-0.5">
          <BarChart3 className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">
            {t("dashboard.funnel.chartTitle", "Tiến Trình & Tỷ Lệ Hoàn Tất")}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          {t(
            "dashboard.funnel.timelineChartDesc",
            "Phân bổ 3 trạng thái và đường % hoàn tất theo từng tháng (Nhấp vào cột để lọc chi tiết)",
          )}
        </p>
      </div>

      <div className="relative h-[250px] w-full mt-2">
        <Chart
          type="bar"
          data={{
            labels: timelineLabels,
            datasets: timelineDatasets,
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              mode: "index",
              intersect: false,
            },
            onClick: (_event, elements) => {
              if (elements && elements.length > 0) {
                const clickedIndex = elements[0].index;
                const clickedMonth = timelineMonths[clickedIndex];
                if (clickedMonth) {
                  setSelectedMonth(clickedMonth);
                }
              }
            },
            plugins: {
              legend: {
                display: true,
                position: "top",
                align: "end",
                labels: {
                  boxWidth: 10,
                  boxHeight: 10,
                  usePointStyle: true,
                  pointStyle: "circle",
                  font: { size: 11 },
                  color: tickColor,
                },
              },
              tooltip: {
                callbacks: {
                  label: (context: any) => {
                    const datasetLabel = context.dataset.label || "";
                    const val = context.parsed.y;
                    if (val === null || val === undefined) return datasetLabel;
                    if (context.dataset.type === "line") {
                      return `${datasetLabel}: ${val}%`;
                    }
                    return `${datasetLabel}: ${isAmount ? money(val) : `${val} xe`}`;
                  },
                },
              },
            },
            scales: {
              x: {
                stacked: true,
                grid: { display: false },
                ticks: { font: { size: 11 }, color: tickColor },
              },
              y: {
                type: "linear",
                display: true,
                position: "left",
                stacked: true,
                grid: { color: gridColor },
                border: { display: false },
                beginAtZero: true,
                ticks: {
                  font: { size: 10 },
                  color: tickColor,
                  callback: (v: any) =>
                    isAmount ? shortMoney(Number(v)) : `${v} xe`,
                },
              },
              y1: {
                type: "linear",
                display: true,
                position: "right",
                min: 0,
                max: 100,
                grid: { display: false },
                border: { display: false },
                ticks: {
                  font: { size: 10 },
                  color: tickColor,
                  callback: (v: any) => `${v}%`,
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
}
