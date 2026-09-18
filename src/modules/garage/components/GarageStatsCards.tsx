import React, { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  subMonths,
  subWeeks,
  subDays,
} from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Activity, Receipt, TrendingUp } from "lucide-react";
import { KpiCard } from "@/shared/components/KpiCard";
import { KpiSparkline } from "@/shared/components/KpiSparkline";
import { money } from "@/shared/utils/format";
import { Badge } from "@/shared/components/ui/badge";
import { garageDashboardApi } from "../api/garageDashboardApi";
import { GarageCheckpointDrawer } from "./GarageCheckpointDrawer";

interface GarageStatsCardsProps {
  title?: string;
}

export function GarageStatsCards({ title }: GarageStatsCardsProps) {
  const { t } = useTranslation("garage");
  const [checkpointDrawer, setCheckpointDrawer] = useState<{
    open: boolean;
    dateFrom: string;
    dateTo: string;
    periodLabel: string;
  }>({
    open: false,
    dateFrom: "",
    dateTo: "",
    periodLabel: "",
  });

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["garage-checkpoint-kpis"],
    queryFn: () => garageDashboardApi.getCheckpointKpis(),
  });

  const handleMonthClick = (index: number) => {
    const monthsAgo = 5 - index;
    const date = subMonths(new Date(), monthsAgo);
    const startStr = format(startOfMonth(date), "yyyy-MM-dd");
    const endStr = format(endOfMonth(date), "yyyy-MM-dd");
    setCheckpointDrawer({
      open: true,
      dateFrom: startStr,
      dateTo: endStr,
      periodLabel: `Tháng ${format(date, "MM/yyyy")}`,
    });
  };

  const handleWeekClick = (index: number) => {
    const weeksAgo = 3 - index;
    const date = subWeeks(new Date(), weeksAgo);
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const end = endOfWeek(date, { weekStartsOn: 1 });
    const startStr = format(start, "yyyy-MM-dd");
    const endStr = format(end, "yyyy-MM-dd");
    setCheckpointDrawer({
      open: true,
      dateFrom: startStr,
      dateTo: endStr,
      periodLabel: `Tuần ${format(start, "dd/MM")} - ${format(end, "dd/MM")}`,
    });
  };

  const handleDayClick = (index: number) => {
    const daysAgo = 6 - index;
    const date = subDays(new Date(), daysAgo);
    const dateStr = format(date, "yyyy-MM-dd");
    setCheckpointDrawer({
      open: true,
      dateFrom: dateStr,
      dateTo: dateStr,
      periodLabel: `Ngày ${format(date, "dd/MM/yyyy")}`,
    });
  };

  const month = statsData?.month;
  const week = statsData?.week;
  const day = statsData?.day;

  // Month calculations
  const mRev = month?.totalRevenue || 0;
  const mCost = month?.totalCost || 0;
  const mProfit = month?.totalProfit || mRev - mCost;
  const mCostRate = mRev > 0 ? ((mCost / mRev) * 100).toFixed(1) : "0.0";
  const mMargin = mRev > 0 ? ((mProfit / mRev) * 100).toFixed(1) : "0.0";

  // Week calculations
  const wRev = week?.totalRevenue || 0;
  const wCost = week?.totalCost || 0;
  const wProfit = week?.totalProfit || wRev - wCost;
  const wCostRate = wRev > 0 ? ((wCost / wRev) * 100).toFixed(1) : "0.0";
  const wMargin = wRev > 0 ? ((wProfit / wRev) * 100).toFixed(1) : "0.0";

  // Day calculations
  const dRev = day?.totalRevenue || 0;
  const dCost = day?.totalCost || 0;
  const dProfit = day?.totalProfit || dRev - dCost;
  const dCostRate = dRev > 0 ? ((dCost / dRev) * 100).toFixed(1) : "0.0";
  const dMargin = dRev > 0 ? ((dProfit / dRev) * 100).toFixed(1) : "0.0";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-md border border-slate-200/80 dark:border-slate-700 shadow-sm flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-primary" />
          {title ||
            t(
              "dashboard.kpis.sectionTitle",
              "Hiệu quả Dịch vụ (Đã hoàn thành công việc)",
            )}
        </h4>
        <div className="h-px bg-slate-200/80 dark:bg-slate-700 flex-1" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Month Card */}
        <KpiCard
          loading={statsLoading}
          label={t("dashboard.kpis.monthLabel", "Doanh thu Tháng này")}
          value={money(mRev)}
          badge={
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 font-medium border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60"
            >
              {month?.totalCount || 0}{" "}
              {t("dashboard.kpis.vehiclesCompleted", "xe hoàn tất")}
            </Badge>
          }
          rightNode={
            <KpiSparkline
              data={month?.revenueChart || [0, 0, 0, 0, 0, 0]}
              customTooltipItems={[
                {
                  label: t("dashboard.kpis.revenueNet", "Doanh thu thuần"),
                  data: month?.revenueChart || [],
                },
                {
                  label: t("dashboard.kpis.costGross", "Giá vốn"),
                  data: month?.costChart || [],
                },
                {
                  label: t("dashboard.kpis.grossProfitShort", "Lãi gộp"),
                  data: month?.profitChart || [],
                },
              ]}
              labels={month?.labels || []}
              onClick={handleMonthClick}
            />
          }
          bottomNode={
            <div className="mt-1 pt-2 border-t border-border/60 grid grid-cols-2 gap-2">
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                  <Receipt className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <span>{t("dashboard.kpis.costGross", "Giá vốn")}</span>
                </div>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-[13.5px] font-bold text-foreground font-mono tabular-nums leading-tight">
                    {money(mCost)}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono font-medium">
                    ({mCostRate}%)
                  </span>
                </div>
              </div>
              <div className="flex flex-col min-w-0 text-right items-end">
                <div className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span>{t("dashboard.kpis.grossProfitShort", "Lãi gộp")}</span>
                </div>
                <div className="flex items-baseline gap-1 mt-0.5 justify-end">
                  <span className="text-[13.5px] font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums leading-tight">
                    {money(mProfit)}
                  </span>
                  <span className="text-[11px] text-emerald-600/85 dark:text-emerald-400/85 font-mono font-medium">
                    ({mMargin}%)
                  </span>
                </div>
              </div>
            </div>
          }
        />

        {/* Week Card */}
        <KpiCard
          loading={statsLoading}
          label={t("dashboard.kpis.weekLabel", "Doanh thu Tuần này")}
          value={money(wRev)}
          badge={
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 font-medium border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60"
            >
              {week?.totalCount || 0}{" "}
              {t("dashboard.kpis.vehiclesCompleted", "xe hoàn tất")}
            </Badge>
          }
          rightNode={
            <KpiSparkline
              data={week?.revenueChart || [0, 0, 0, 0]}
              customTooltipItems={[
                {
                  label: t("dashboard.kpis.revenueNet", "Doanh thu thuần"),
                  data: week?.revenueChart || [],
                },
                {
                  label: t("dashboard.kpis.costGross", "Giá vốn"),
                  data: week?.costChart || [],
                },
                {
                  label: t("dashboard.kpis.grossProfitShort", "Lãi gộp"),
                  data: week?.profitChart || [],
                },
              ]}
              labels={week?.labels || []}
              onClick={handleWeekClick}
            />
          }
          bottomNode={
            <div className="mt-1 pt-2 border-t border-border/60 grid grid-cols-2 gap-2">
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                  <Receipt className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <span>{t("dashboard.kpis.costGross", "Giá vốn")}</span>
                </div>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-[13.5px] font-bold text-foreground font-mono tabular-nums leading-tight">
                    {money(wCost)}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono font-medium">
                    ({wCostRate}%)
                  </span>
                </div>
              </div>
              <div className="flex flex-col min-w-0 text-right items-end">
                <div className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span>{t("dashboard.kpis.grossProfitShort", "Lãi gộp")}</span>
                </div>
                <div className="flex items-baseline gap-1 mt-0.5 justify-end">
                  <span className="text-[13.5px] font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums leading-tight">
                    {money(wProfit)}
                  </span>
                  <span className="text-[11px] text-emerald-600/85 dark:text-emerald-400/85 font-mono font-medium">
                    ({wMargin}%)
                  </span>
                </div>
              </div>
            </div>
          }
        />

        {/* Day Card */}
        <KpiCard
          loading={statsLoading}
          label={t("dashboard.kpis.dayLabel", "Doanh thu Hôm nay")}
          value={money(dRev)}
          badge={
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 font-medium border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60"
            >
              {day?.totalCount || 0}{" "}
              {t("dashboard.kpis.vehiclesCompleted", "xe hoàn tất")}
            </Badge>
          }
          rightNode={
            <KpiSparkline
              data={day?.revenueChart || [0, 0, 0, 0, 0, 0, 0]}
              customTooltipItems={[
                {
                  label: t("dashboard.kpis.revenueNet", "Doanh thu thuần"),
                  data: day?.revenueChart || [],
                },
                {
                  label: t("dashboard.kpis.costGross", "Giá vốn"),
                  data: day?.costChart || [],
                },
                {
                  label: t("dashboard.kpis.grossProfitShort", "Lãi gộp"),
                  data: day?.profitChart || [],
                },
              ]}
              labels={day?.labels || []}
              onClick={handleDayClick}
            />
          }
          bottomNode={
            <div className="mt-1 pt-2 border-t border-border/60 grid grid-cols-2 gap-2">
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                  <Receipt className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <span>{t("dashboard.kpis.costGross", "Giá vốn")}</span>
                </div>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-[13.5px] font-bold text-foreground font-mono tabular-nums leading-tight">
                    {money(dCost)}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono font-medium">
                    ({dCostRate}%)
                  </span>
                </div>
              </div>
              <div className="flex flex-col min-w-0 text-right items-end">
                <div className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span>{t("dashboard.kpis.grossProfitShort", "Lãi gộp")}</span>
                </div>
                <div className="flex items-baseline gap-1 mt-0.5 justify-end">
                  <span className="text-[13.5px] font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums leading-tight">
                    {money(dProfit)}
                  </span>
                  <span className="text-[11px] text-emerald-600/85 dark:text-emerald-400/85 font-mono font-medium">
                    ({dMargin}%)
                  </span>
                </div>
              </div>
            </div>
          }
        />
      </div>

      <GarageCheckpointDrawer
        open={checkpointDrawer.open}
        onClose={() =>
          setCheckpointDrawer((prev) => ({ ...prev, open: false }))
        }
        dateFrom={checkpointDrawer.dateFrom}
        dateTo={checkpointDrawer.dateTo}
        periodLabel={checkpointDrawer.periodLabel}
      />
    </div>
  );
}
