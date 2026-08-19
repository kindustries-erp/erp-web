import React from "react";
import { DonutChart } from "@/shared/components/charts/DonutChart";
import { EmptyState } from "@/shared/components/EmptyState";
import { useTranslation } from "react-i18next";

interface GarageStatusDistributionChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
  loading?: boolean;
}

const COLORS = [
  "#10b981", // Emerald (Kết thúc)
  "#3b82f6", // Blue (Đang làm / Tiếp nhận)
  "#f59e0b", // Amber (Báo giá)
  "#8b5cf6", // Purple
  "#ef4444", // Red (Hủy)
  "#6b7280", // Gray (Khác)
];

export function GarageStatusDistributionChart({
  data,
  loading,
}: GarageStatusDistributionChartProps) {
  const { t } = useTranslation("garage");

  if (!loading && (!data || data.length === 0)) {
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

  const items = data.map((d, index) => ({
    label: d.name,
    value: d.value,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border shadow-sm p-5 flex flex-col h-[340px]">
      <div className="mb-3">
        <h4 className="text-sm font-semibold text-foreground">
          {t(
            "dashboard.charts.statusDistribution",
            "Phân bổ Trạng thái Phiếu dịch vụ",
          )}
        </h4>
        <p className="text-xs text-muted-foreground mt-0.5">
          {t(
            "dashboard.charts.statusDistributionDesc",
            "Tỷ lệ các trạng thái phiếu tiếp nhận trong xưởng",
          )}
        </p>
      </div>

      <div className="flex-1 w-full min-h-0 flex items-center justify-center">
        <DonutChart
          items={items}
          cutout="60%"
          valueFormatter={(val) => `${val} phiếu`}
        />
      </div>
    </div>
  );
}
