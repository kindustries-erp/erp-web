import React, { useState, useMemo } from "react";
import { DonutChart, DonutLegend } from "@/shared/components/charts/DonutChart";
import { EmptyState } from "@/shared/components/EmptyState";
import { useTranslation } from "react-i18next";
import { Calendar, DollarSign, Layers } from "lucide-react";
import { Combobox, ComboboxOption } from "@/shared/components/Combobox";
import { GarageStatusDistributionItem } from "../api/garageDashboardApi";
import { cn } from "@/shared/utils";
import {
  getStatusColor,
  formatMonthLabel,
} from "./GarageConversionFunnelCard/utils/funnelConfig";
import { calculateStatusDonutItems } from "./GarageConversionFunnelCard/utils/funnelDataCalculators";
import { money, shortMoney } from "@/shared/utils/format";

interface GarageStatusDistributionChartProps {
  data?: GarageStatusDistributionItem[];
  byMonth?: Record<string, GarageStatusDistributionItem[]>;
  availableMonths?: string[];
  loading?: boolean;
}

export function GarageStatusDistributionChart({
  data = [],
  byMonth = {},
  availableMonths = [],
  loading,
}: GarageStatusDistributionChartProps) {
  const { t } = useTranslation("garage");
  const [selectedMonth, setSelectedMonth] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"revenue" | "count">("revenue");

  const activeData = useMemo(() => {
    if (selectedMonth === "ALL" || !byMonth[selectedMonth]) {
      return data;
    }
    return byMonth[selectedMonth];
  }, [selectedMonth, byMonth, data]);

  const totalCount = useMemo(
    () => activeData.reduce((sum, d) => sum + (d.count || 0), 0),
    [activeData],
  );

  const totalRevenue = useMemo(
    () => activeData.reduce((sum, d) => sum + (d.revenue || 0), 0),
    [activeData],
  );

  const isRevenue = viewMode === "revenue";

  const items = useMemo(() => {
    return calculateStatusDonutItems(activeData, isRevenue, getStatusColor);
  }, [activeData, isRevenue]);

  const monthOptions: ComboboxOption[] = useMemo(() => {
    const allCount = data.reduce((s, d) => s + d.count, 0);
    const allRev = data.reduce((s, d) => s + (d.revenue || 0), 0);
    const opts: ComboboxOption[] = [
      {
        value: "ALL",
        label: `Toàn bộ 6 tháng (${allCount} phiếu • ${shortMoney(allRev)})`,
      },
    ];
    availableMonths.forEach((m) => {
      const monthItems = byMonth[m] || [];
      const mCount = monthItems.reduce((s, d) => s + d.count, 0);
      const mRev = monthItems.reduce((s, d) => s + (d.revenue || 0), 0);
      opts.push({
        value: m,
        label: `${formatMonthLabel(m)} (${mCount} phiếu • ${shortMoney(mRev)})`,
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
    <div className="bg-surface border border-border rounded-xl card-shadow p-5 flex flex-col h-full min-h-[370px]">
      <div className="mb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-primary" />
              {t(
                "dashboard.charts.statusDistribution",
                "Phân bổ Trạng thái Phiếu DV",
              )}
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              {selectedMonth === "ALL"
                ? "Tỷ lệ trạng thái tiếp nhận & đang làm (không gồm Hủy)"
                : `Tỷ lệ trạng thái trong ${formatMonthLabel(selectedMonth)} (không gồm Hủy)`}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border">
              <button
                type="button"
                onClick={() => setViewMode("revenue")}
                className={cn(
                  "px-2 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1",
                  viewMode === "revenue"
                    ? "bg-surface text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <DollarSign className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                Tổng thu
              </button>
              <button
                type="button"
                onClick={() => setViewMode("count")}
                className={cn(
                  "px-2 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1",
                  viewMode === "count"
                    ? "bg-surface text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Layers className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                Số lượng
              </button>
            </div>

            <div className="flex items-center gap-1.5 min-w-[210px] max-w-[260px]">
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
        </div>

        <div className="mt-2.5 flex items-center gap-4 text-xs bg-muted/30 px-3 py-1.5 rounded-lg border border-border/60">
          <div>
            <span className="text-muted-foreground">Tổng phiếu: </span>
            <span className="font-semibold text-foreground">
              {totalCount} phiếu
            </span>
          </div>
          <div className="w-px h-3 bg-border" />
          <div>
            <span className="text-muted-foreground">Tổng tiền có thuế: </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {money(totalRevenue)}
            </span>
          </div>
        </div>
      </div>

      <div className="h-[180px] w-full flex items-center justify-center relative my-auto">
        <DonutChart
          items={items}
          cutout="62%"
          valueFormatter={(val) => (isRevenue ? money(val) : `${val} phiếu`)}
        />
      </div>

      <div className="border-t border-border pt-2 max-h-[130px] overflow-y-auto">
        <DonutLegend
          items={items}
          valueFormatter={(val) => {
            if (isRevenue) {
              const pct =
                totalRevenue > 0
                  ? ((val / totalRevenue) * 100).toFixed(1)
                  : "0.0";
              return `${shortMoney(val)} (${pct}%)`;
            } else {
              const pct =
                totalCount > 0 ? ((val / totalCount) * 100).toFixed(1) : "0.0";
              return `${val} phiếu (${pct}%)`;
            }
          }}
        />
      </div>
    </div>
  );
}
