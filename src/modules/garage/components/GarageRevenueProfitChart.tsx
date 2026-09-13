import React from "react";
import { BarChart } from "@/shared/components/charts/BarChart";
import { EmptyState } from "@/shared/components/EmptyState";
import { useTranslation } from "react-i18next";

interface GarageRevenueProfitChartProps {
  data: Array<{
    name: string;
    revenue: number;
    cost: number;
    profit: number;
  }>;
  loading?: boolean;
}

export function GarageRevenueProfitChart({
  data,
  loading,
}: GarageRevenueProfitChartProps) {
  const { t } = useTranslation("garage");

  // Take up to 12 items for clean display
  const chartData = data.slice(0, 12);

  if (!loading && (!chartData || chartData.length === 0)) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg border shadow-sm p-5 h-[340px] flex flex-col justify-center items-center">
        <EmptyState
          message={t(
            "dashboard.charts.noChartData",
            "Chưa có dữ liệu biểu đồ trong khoảng thời gian này",
          )}
          size="sm"
        />
      </div>
    );
  }

  const labels = chartData.map((d) => d.name);
  const revenueData = chartData.map((d) => d.revenue);
  const costData = chartData.map((d) => d.cost);
  const profitData = chartData.map((d) => d.profit);

  const datasets = [
    {
      label: t("dashboard.charts.revenue", "Doanh thu"),
      data: revenueData,
      color: "#3b82f6", // Blue
    },
    {
      label: t("dashboard.charts.cost", "Giá vốn"),
      data: costData,
      color: "#f43f5e", // Rose
    },
    {
      label: t("dashboard.charts.profit", "Lợi nhuận gộp"),
      data: profitData,
      color: "#10b981", // Emerald
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border shadow-sm p-5 flex flex-col h-[340px]">
      <div className="mb-3">
        <h4 className="text-sm font-semibold text-foreground">
          {t(
            "dashboard.charts.revenueProfitTrend",
            "Xu hướng Doanh thu & Lợi nhuận gộp",
          )}
        </h4>
        <p className="text-xs text-muted-foreground mt-0.5">
          {t(
            "dashboard.charts.revenueProfitTrendDesc",
            "So sánh doanh thu, giá vốn và lợi nhuận gộp theo từng vụ việc",
          )}
        </p>
      </div>

      <div className="flex-1 w-full min-h-0">
        <BarChart
          labels={labels}
          datasets={datasets}
          yCallback={(val) => {
            const num = Number(val);
            if (num >= 1000000) return `${(num / 1000000).toFixed(0)}M`;
            if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
            return String(val);
          }}
        />
      </div>
    </div>
  );
}
