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
import { Receipt, TrendingUp, Wallet, Eye } from "lucide-react";
import { KpiCard } from "@/shared/components/KpiCard";
import { KpiSparkline } from "@/shared/components/KpiSparkline";
import { money } from "@/shared/utils/format";
import { Badge } from "@/shared/components/ui/badge";
import { garageDashboardApi } from "../api/garageDashboardApi";
import { GarageCheckpointDrawer } from "./GarageCheckpointDrawer";
import { cn } from "@/shared/utils";

export function GarageStatsCards() {
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

  const openMonthCheckpoint = () => {
    const date = new Date();
    const startStr = format(startOfMonth(date), "yyyy-MM-dd");
    const endStr = format(endOfMonth(date), "yyyy-MM-dd");
    setCheckpointDrawer({
      open: true,
      dateFrom: startStr,
      dateTo: endStr,
      periodLabel: `Tháng ${format(date, "MM/yyyy")}`,
    });
  };

  const openWeekCheckpoint = () => {
    const date = new Date();
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

  const openDayCheckpoint = () => {
    const date = new Date();
    const dateStr = format(date, "yyyy-MM-dd");
    setCheckpointDrawer({
      open: true,
      dateFrom: dateStr,
      dateTo: dateStr,
      periodLabel: `Hôm nay (${format(date, "dd/MM/yyyy")})`,
    });
  };

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
  const mBilled = month?.totalTienCoThue || mRev;
  const mPaid = month?.totalPaid || 0;
  const mReceivable = month?.totalReceivable || 0;
  const mRate =
    month?.collectionRate || (mBilled > 0 ? (mPaid / mBilled) * 100 : 0);
  const mMargin = mRev > 0 ? ((mProfit / mRev) * 100).toFixed(1) : "0.0";

  // Week calculations
  const wRev = week?.totalRevenue || 0;
  const wCost = week?.totalCost || 0;
  const wProfit = week?.totalProfit || wRev - wCost;
  const wBilled = week?.totalTienCoThue || wRev;
  const wPaid = week?.totalPaid || 0;
  const wReceivable = week?.totalReceivable || 0;
  const wRate =
    week?.collectionRate || (wBilled > 0 ? (wPaid / wBilled) * 100 : 0);
  const wMargin = wRev > 0 ? ((wProfit / wRev) * 100).toFixed(1) : "0.0";

  // Day calculations
  const dRev = day?.totalRevenue || 0;
  const dCost = day?.totalCost || 0;
  const dProfit = day?.totalProfit || dRev - dCost;
  const dBilled = day?.totalTienCoThue || dRev;
  const dPaid = day?.totalPaid || 0;
  const dReceivable = day?.totalReceivable || 0;
  const dRate =
    day?.collectionRate || (dBilled > 0 ? (dPaid / dBilled) * 100 : 0);
  const dMargin = dRev > 0 ? ((dProfit / dRev) * 100).toFixed(1) : "0.0";

  return (
    <div className="flex flex-col gap-4">
      {/* 3 Realized KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {/* 1. Month Card */}
        <div
          onClick={openMonthCheckpoint}
          className="cursor-pointer transition-transform hover:-translate-y-0.5 group"
        >
          <KpiCard
            loading={statsLoading}
            label={t("dashboard.kpis.monthLabel", "Doanh thu Tháng này")}
            value={money(mRev)}
            badge={
              <div className="flex items-center gap-1.5">
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 font-medium border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60"
                >
                  {month?.totalCount || 0}{" "}
                  {t("dashboard.kpis.vehiclesCompleted", "xe hoàn tất")}
                </Badge>
                <Eye className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
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
                    label: "Tổng phải thu (VAT)",
                    data: month?.tienCoThueChart || [],
                  },
                  {
                    label: "Đã thu",
                    data: month?.paidChart || [],
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
              <div className="mt-1 pt-2 border-t border-border/60 flex flex-col gap-2">
                {/* Realized Payment Progress */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Wallet className="w-3 h-3 text-slate-500" />
                      Tổng phải thu:{" "}
                      <strong className="text-foreground font-mono">
                        {money(mBilled)}
                      </strong>
                    </span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                      Đã thu: {mRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, mRate))}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10.5px] text-muted-foreground">
                    <span>
                      Đã thu:{" "}
                      <strong className="text-emerald-600 font-mono">
                        {money(mPaid)}
                      </strong>
                    </span>
                    <span>
                      Còn nợ:{" "}
                      <strong
                        className={cn(
                          "font-mono",
                          mReceivable > 0
                            ? "text-amber-600 font-bold"
                            : "text-emerald-600",
                        )}
                      >
                        {money(mReceivable)}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Profit & Margin */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/40 text-[11px]">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Receipt className="w-3 h-3 text-slate-500" />
                    <span>
                      Giá vốn:{" "}
                      <strong className="text-foreground font-mono">
                        {money(mCost)}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-1 text-emerald-700 dark:text-emerald-400">
                    <TrendingUp className="w-3 h-3 text-emerald-600" />
                    <span>
                      Lãi gộp:{" "}
                      <strong className="font-mono">
                        {money(mProfit)} ({mMargin}%)
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
            }
          />
        </div>

        {/* 2. Week Card */}
        <div
          onClick={openWeekCheckpoint}
          className="cursor-pointer transition-transform hover:-translate-y-0.5 group"
        >
          <KpiCard
            loading={statsLoading}
            label={t("dashboard.kpis.weekLabel", "Doanh thu Tuần này")}
            value={money(wRev)}
            badge={
              <div className="flex items-center gap-1.5">
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 font-medium border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60"
                >
                  {week?.totalCount || 0}{" "}
                  {t("dashboard.kpis.vehiclesCompleted", "xe hoàn tất")}
                </Badge>
                <Eye className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
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
                    label: "Tổng phải thu (VAT)",
                    data: week?.tienCoThueChart || [],
                  },
                  {
                    label: "Đã thu",
                    data: week?.paidChart || [],
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
              <div className="mt-1 pt-2 border-t border-border/60 flex flex-col gap-2">
                {/* Realized Payment Progress */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Wallet className="w-3 h-3 text-slate-500" />
                      Tổng phải thu:{" "}
                      <strong className="text-foreground font-mono">
                        {money(wBilled)}
                      </strong>
                    </span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                      Đã thu: {wRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, wRate))}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10.5px] text-muted-foreground">
                    <span>
                      Đã thu:{" "}
                      <strong className="text-emerald-600 font-mono">
                        {money(wPaid)}
                      </strong>
                    </span>
                    <span>
                      Còn nợ:{" "}
                      <strong
                        className={cn(
                          "font-mono",
                          wReceivable > 0
                            ? "text-amber-600 font-bold"
                            : "text-emerald-600",
                        )}
                      >
                        {money(wReceivable)}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Profit & Margin */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/40 text-[11px]">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Receipt className="w-3 h-3 text-slate-500" />
                    <span>
                      Giá vốn:{" "}
                      <strong className="text-foreground font-mono">
                        {money(wCost)}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-1 text-emerald-700 dark:text-emerald-400">
                    <TrendingUp className="w-3 h-3 text-emerald-600" />
                    <span>
                      Lãi gộp:{" "}
                      <strong className="font-mono">
                        {money(wProfit)} ({wMargin}%)
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
            }
          />
        </div>

        {/* 3. Day Card */}
        <div
          onClick={openDayCheckpoint}
          className="cursor-pointer transition-transform hover:-translate-y-0.5 group"
        >
          <KpiCard
            loading={statsLoading}
            label={t("dashboard.kpis.dayLabel", "Doanh thu Hôm nay")}
            value={money(dRev)}
            badge={
              <div className="flex items-center gap-1.5">
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 font-medium border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60"
                >
                  {day?.totalCount || 0}{" "}
                  {t("dashboard.kpis.vehiclesCompleted", "xe hoàn tất")}
                </Badge>
                <Eye className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
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
                    label: "Tổng phải thu (VAT)",
                    data: day?.tienCoThueChart || [],
                  },
                  {
                    label: "Đã thu",
                    data: day?.paidChart || [],
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
              <div className="mt-1 pt-2 border-t border-border/60 flex flex-col gap-2">
                {/* Realized Payment Progress */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Wallet className="w-3 h-3 text-slate-500" />
                      Tổng phải thu:{" "}
                      <strong className="text-foreground font-mono">
                        {money(dBilled)}
                      </strong>
                    </span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                      Đã thu: {dRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, dRate))}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10.5px] text-muted-foreground">
                    <span>
                      Đã thu:{" "}
                      <strong className="text-emerald-600 font-mono">
                        {money(dPaid)}
                      </strong>
                    </span>
                    <span>
                      Còn nợ:{" "}
                      <strong
                        className={cn(
                          "font-mono",
                          dReceivable > 0
                            ? "text-amber-600 font-bold"
                            : "text-emerald-600",
                        )}
                      >
                        {money(dReceivable)}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Profit & Margin */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/40 text-[11px]">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Receipt className="w-3 h-3 text-slate-500" />
                    <span>
                      Giá vốn:{" "}
                      <strong className="text-foreground font-mono">
                        {money(dCost)}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-1 text-emerald-700 dark:text-emerald-400">
                    <TrendingUp className="w-3 h-3 text-emerald-600" />
                    <span>
                      Lãi gộp:{" "}
                      <strong className="font-mono">
                        {money(dProfit)} ({dMargin}%)
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
            }
          />
        </div>
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
