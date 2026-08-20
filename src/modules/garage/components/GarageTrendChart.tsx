import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Panel, PanelMore } from "@/shared/components/Panel";
import { ChartSkeleton } from "@/shared/components/Skeleton";
import { BarChart } from "@/shared/components/charts/BarChart";
import { money } from "@/shared/utils/format";
import { garageDashboardApi } from "../api/garageDashboardApi";

interface GarageTrendChartProps {
  filterState: {
    dateFrom?: string;
    dateTo?: string;
  };
}

export function GarageTrendChart({ filterState }: GarageTrendChartProps) {
  const { data: statsData, isLoading } = useQuery({
    queryKey: [
      "garage-dashboard-stats",
      filterState.dateFrom,
      filterState.dateTo,
    ],
    queryFn: () =>
      garageDashboardApi.getStats({
        date_from: filterState.dateFrom || undefined,
        date_to: filterState.dateTo || undefined,
      }),
  });

  const colorRevenue = "#059669"; // Emerald 600
  const colorCost = "#ea580c"; // Orange 600
  const lineProfit = "#0f172a"; // Slate 900

  const trend = statsData?.trend || [];
  const labels = trend.map((t) => t.label);

  const revenueData = trend.map((t) => t.revenue);
  const costData = trend.map((t) => -t.cost);
  const profitData = trend.map((t) => t.profit);

  const datasets = [
    {
      type: "line" as const,
      data: profitData,
      color: "transparent",
      borderColor: lineProfit,
      borderWidth: 2,
      fill: false,
      label: "Lợi nhuận gộp (Doanh thu - Giá vốn)",
    },
    {
      type: "bar" as const,
      data: costData,
      color: colorCost,
      label: "Giá vốn / Chi phí",
    },
    {
      type: "bar" as const,
      data: revenueData,
      color: colorRevenue,
      label: "Doanh thu Dịch vụ",
    },
  ];

  return (
    <Panel
      title="Xu hướng Doanh thu, Chi phí & Lợi nhuận gộp"
      extra={<PanelMore />}
    >
      <div className="relative h-[290px]">
        {!isLoading && labels.length > 0 ? (
          <BarChart
            labels={labels}
            yCallback={(v) => money(Number(v))}
            datasets={datasets}
          />
        ) : isLoading ? (
          <ChartSkeleton type="bar" />
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-[color:var(--muted-fg)]">
            Chưa có dữ liệu trong khoảng thời gian này
          </div>
        )}
      </div>

      <div className="flex gap-4 mt-[10px] justify-center flex-wrap">
        <LegendItem color={colorCost} label="Giá vốn / Chi phí" />
        <LegendItem color={colorRevenue} label="Doanh thu" />
        <LegendItem color={lineProfit} label="Lợi nhuận gộp" isLine={true} />
      </div>
    </Panel>
  );
}

function LegendItem({
  color,
  label,
  isLine,
}: {
  color: string;
  label: string;
  isLine?: boolean;
}) {
  return (
    <div className="flex items-center text-xs">
      {isLine ? (
        <div className="w-4 h-[2px] mr-2" style={{ backgroundColor: color }} />
      ) : (
        <div
          className="w-3 h-3 rounded-[3px] mr-2"
          style={{ backgroundColor: color }}
        />
      )}
      <span className="text-[color:var(--muted-fg)] font-medium">{label}</span>
    </div>
  );
}
