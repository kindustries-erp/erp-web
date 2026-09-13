import React, { useState, useMemo } from "react";
import { DonutChart, DonutLegend } from "@/shared/components/charts/DonutChart";
import { EmptyState } from "@/shared/components/EmptyState";
import { useTranslation } from "react-i18next";
import { Calendar } from "lucide-react";
import { Combobox, ComboboxOption } from "@/shared/components/Combobox";
import { GarageStatusDistributionItem } from "../api/garageDashboardApi";

interface GarageStatusDistributionChartProps {
  data?: GarageStatusDistributionItem[];
  byMonth?: Record<string, GarageStatusDistributionItem[]>;
  availableMonths?: string[];
  loading?: boolean;
}

const getStatusColor = (name: string, index: number) => {
  const lower = name.toLowerCase();
  if (
    lower.includes("kết thúc") ||
    lower.includes("hoàn tất") ||
    lower.includes("xong")
  ) {
    return "#10b981"; // Emerald
  }
  if (
    lower.includes("đang thực hiện") ||
    lower.includes("đang sửa") ||
    lower.includes("tiến hành")
  ) {
    return "#3b82f6"; // Blue
  }
  if (lower.includes("tiếp nhận") || lower.includes("mới")) {
    return "#6366f1"; // Indigo
  }
  if (lower.includes("báo giá") || lower.includes("chờ duyệt")) {
    return "#f59e0b"; // Amber
  }
  if (lower.includes("hủy") || lower.includes("từ chối")) {
    return "#ef4444"; // Red
  }
  const fallbackColors = [
    "#8b5cf6",
    "#06b6d4",
    "#ec4899",
    "#64748b",
    "#84cc16",
  ];
  return fallbackColors[index % fallbackColors.length];
};

export function GarageStatusDistributionChart({
  data = [],
  byMonth = {},
  availableMonths = [],
  loading,
}: GarageStatusDistributionChartProps) {
  const { t } = useTranslation("garage");
  const [selectedMonth, setSelectedMonth] = useState<string>("ALL");

  // Dữ liệu hiển thị dựa trên tháng được chọn
  const activeData = useMemo(() => {
    if (selectedMonth === "ALL" || !byMonth[selectedMonth]) {
      return data;
    }
    return byMonth[selectedMonth];
  }, [selectedMonth, byMonth, data]);

  const totalCount = useMemo(
    () => activeData.reduce((sum, d) => sum + d.count, 0),
    [activeData],
  );

  const items = useMemo(
    () =>
      activeData.map((d, index) => ({
        label: d.statusName,
        value: d.count,
        color: getStatusColor(d.statusName, index),
      })),
    [activeData],
  );

  const formatMonthLabel = (m: string) => {
    const parts = m.split("-");
    if (parts.length === 2) {
      return `Tháng ${parts[1]}/${parts[0]}`;
    }
    return m;
  };

  const monthOptions: ComboboxOption[] = useMemo(() => {
    const allCount = data.reduce((s, d) => s + d.count, 0);
    const opts: ComboboxOption[] = [
      {
        value: "ALL",
        label: `Toàn bộ 6 tháng (${allCount} phiếu)`,
      },
    ];
    availableMonths.forEach((m) => {
      const mCount = (byMonth[m] || []).reduce((s, d) => s + d.count, 0);
      opts.push({
        value: m,
        label: `${formatMonthLabel(m)} (${mCount} phiếu)`,
      });
    });
    return opts;
  }, [data, availableMonths, byMonth]);

  if (!loading && (!activeData || activeData.length === 0)) {
    return (
      <div className="bg-surface border border-border rounded-xl card-shadow p-5 h-full min-h-[340px] flex flex-col justify-center items-center">
        <EmptyState
          message={t(
            "dashboard.charts.noChartData",
            "Chưa có dữ liệu trạng thái trong khoảng thời gian này",
          )}
          size="sm"
        />
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-xl card-shadow p-5 flex flex-col h-full min-h-[340px]">
      <div className="mb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h4 className="text-sm font-semibold text-foreground">
            {t(
              "dashboard.charts.statusDistribution",
              "Phân bổ Trạng thái Phiếu DV",
            )}
          </h4>

          {/* Month Selector Combobox */}
          <div className="flex items-center gap-1.5 min-w-[200px] max-w-[240px]">
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
        <p className="text-xs text-muted-foreground mt-0.5">
          {selectedMonth === "ALL"
            ? "Tỷ lệ trạng thái tiếp nhận trong 6 tháng gần nhất"
            : `Tỷ lệ trạng thái tiếp nhận trong ${formatMonthLabel(selectedMonth)}`}
        </p>
      </div>

      <div className="h-[180px] w-full flex items-center justify-center relative my-auto">
        <DonutChart
          items={items}
          cutout="62%"
          valueFormatter={(val) => `${val} phiếu`}
        />
      </div>

      <div className="border-t pt-2 max-h-[120px] overflow-y-auto">
        <DonutLegend
          items={items}
          valueFormatter={(val) => {
            const pct =
              totalCount > 0 ? ((val / totalCount) * 100).toFixed(1) : "0.0";
            return `${val} phiếu (${pct}%)`;
          }}
        />
      </div>
    </div>
  );
}
