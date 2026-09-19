import React, { useState, useMemo } from "react";
import { DonutChart, DonutLegend } from "@/shared/components/charts/DonutChart";
import { EmptyState } from "@/shared/components/EmptyState";
import { useTranslation } from "react-i18next";
import { Calendar } from "lucide-react";
import { Combobox, ComboboxOption } from "@/shared/components/Combobox";
import { money, shortMoney } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import { GarageClassificationDistributionItem } from "../api/garageDashboardApi";

interface GarageClassificationDistributionChartProps {
  data?: GarageClassificationDistributionItem[];
  byMonth?: Record<string, GarageClassificationDistributionItem[]>;
  availableMonths?: string[];
  loading?: boolean;
}

const getClassificationColor = (key: string) => {
  switch (key) {
    case "SUA_CHUA_CHUNG":
      return "#059669"; // Emerald
    case "KY_GUI_NOI_BO":
      return "#6366f1"; // Indigo
    case "OJ_NGOAI":
    case "OJ":
      return "#ea580c"; // Orange
    default:
      return "#64748b"; // Slate
  }
};

export function GarageClassificationDistributionChart({
  data = [],
  byMonth = {},
  availableMonths = [],
  loading,
}: GarageClassificationDistributionChartProps) {
  const { t } = useTranslation("garage");
  const [selectedMonth, setSelectedMonth] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"COUNT" | "REVENUE">("COUNT");

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

  const totalRevenue = useMemo(
    () => activeData.reduce((sum, d) => sum + (d.revenue || 0), 0),
    [activeData],
  );

  const isCount = viewMode === "COUNT";

  const items = useMemo(
    () =>
      activeData.map((d) => ({
        label: d.classificationName,
        value: isCount ? d.count : d.revenue || 0,
        color: getClassificationColor(d.classificationKey),
      })),
    [activeData, isCount],
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
        label: `${t("dashboard.charts.allSixMonths", "Toàn bộ 6 tháng")} (${allCount} phiếu)`,
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
  }, [data, availableMonths, byMonth, t]);

  if (!loading && (!activeData || activeData.length === 0)) {
    return (
      <div className="bg-surface border border-border rounded-xl card-shadow p-5 h-full min-h-[340px] flex flex-col justify-center items-center">
        <EmptyState
          message={t(
            "dashboard.charts.noChartData",
            "Chưa có dữ liệu phân bổ loại nghiệp vụ trong khoảng thời gian này",
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
              "dashboard.charts.classificationDistribution",
              "Cơ cấu Loại Nghiệp vụ",
            )}
          </h4>

          {/* Month Selector Combobox */}
          <div className="flex items-center gap-1.5 min-w-[180px] max-w-[220px]">
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

        <div className="flex items-center justify-between flex-wrap gap-2 mt-1">
          <p className="text-xs text-muted-foreground">
            {selectedMonth === "ALL"
              ? isCount
                ? "Tỷ lệ số lượng phiếu theo nghiệp vụ trong 6 tháng"
                : "Tỷ lệ doanh thu theo nghiệp vụ trong 6 tháng"
              : isCount
                ? `Tỷ lệ số lượng phiếu trong ${formatMonthLabel(selectedMonth)}`
                : `Tỷ lệ doanh thu trong ${formatMonthLabel(selectedMonth)}`}
          </p>

          {/* Switch View Mode: Count vs Revenue */}
          <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-medium border border-slate-200/80 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode("COUNT")}
              className={cn(
                "px-2 py-0.5 rounded-md transition-all cursor-pointer select-none",
                isCount
                  ? "bg-background text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t("dashboard.charts.viewByCount", "Số lượng")}
            </button>
            <button
              type="button"
              onClick={() => setViewMode("REVENUE")}
              className={cn(
                "px-2 py-0.5 rounded-md transition-all cursor-pointer select-none",
                !isCount
                  ? "bg-background text-foreground shadow-sm font-semibold text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t("dashboard.charts.viewByRevenue", "Doanh thu")}
            </button>
          </div>
        </div>
      </div>

      <div className="h-[175px] w-full flex items-center justify-center relative my-auto">
        <DonutChart
          items={items}
          cutout="62%"
          valueFormatter={(val) => (isCount ? `${val} phiếu` : money(val))}
        />
      </div>

      <div className="border-t pt-2 max-h-[125px] overflow-y-auto">
        <DonutLegend
          items={items}
          valueFormatter={(val) => {
            if (isCount) {
              const pct =
                totalCount > 0 ? ((val / totalCount) * 100).toFixed(1) : "0.0";
              return `${val} phiếu (${pct}%)`;
            } else {
              const pct =
                totalRevenue > 0
                  ? ((val / totalRevenue) * 100).toFixed(1)
                  : "0.0";
              return `${shortMoney(val)} (${pct}%)`;
            }
          }}
        />
      </div>
    </div>
  );
}
