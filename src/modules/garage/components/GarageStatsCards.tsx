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
import { KpiCard } from "@/shared/components/KpiCard";
import { KpiSparkline } from "@/shared/components/KpiSparkline";
import { money } from "@/shared/utils/format";
import { garageDashboardApi } from "../api/garageDashboardApi";
import { GarageCheckpointDrawer } from "./GarageCheckpointDrawer";

interface GarageStatsCardsProps {
  type?: "REVENUE" | "COST";
  title?: string;
}

export function GarageStatsCards({
  type = "REVENUE",
  title,
}: GarageStatsCardsProps) {
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

  const isRevenue = type === "REVENUE";
  const labelPrefix = isRevenue ? "Doanh thu" : "Giá vốn / Chi phí";
  const defaultTitle = isRevenue
    ? "Chỉ số Doanh thu & Lợi nhuận Dịch vụ"
    : "Chỉ số Giá vốn & Chi phí Dịch vụ";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-md border border-slate-200/80 dark:border-slate-700 shadow-sm">
          {title || defaultTitle}
        </h4>
        <div className="h-px bg-slate-200/80 dark:bg-slate-700 flex-1" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Month Card */}
        <KpiCard
          compact
          loading={statsLoading}
          label={`${labelPrefix} Tháng này`}
          value={
            isRevenue
              ? money(month?.totalRevenue || 0)
              : money(month?.totalCost || 0)
          }
          sub={
            isRevenue
              ? `Lãi gộp: ${money(month?.totalProfit || 0)} (${month?.totalCount || 0} xe)`
              : `Tỷ lệ giá vốn: ${
                  month?.totalRevenue
                    ? (
                        ((month?.totalCost || 0) / month.totalRevenue) *
                        100
                      ).toFixed(1)
                    : 0
                }% (${month?.totalCount || 0} xe)`
          }
          rightNode={
            <KpiSparkline
              data={
                isRevenue
                  ? month?.revenueChart || [0, 0, 0, 0, 0, 0]
                  : month?.costChart || [0, 0, 0, 0, 0, 0]
              }
              preVatData={
                isRevenue ? month?.profitChart || [0, 0, 0, 0, 0, 0] : undefined
              }
              labels={month?.labels || []}
              onClick={handleMonthClick}
            />
          }
        />

        {/* Week Card */}
        <KpiCard
          compact
          loading={statsLoading}
          label={`${labelPrefix} Tuần này`}
          value={
            isRevenue
              ? money(week?.totalRevenue || 0)
              : money(week?.totalCost || 0)
          }
          sub={
            isRevenue
              ? `Lãi gộp: ${money(week?.totalProfit || 0)} (${week?.totalCount || 0} xe)`
              : `Tỷ lệ giá vốn: ${
                  week?.totalRevenue
                    ? (
                        ((week?.totalCost || 0) / week.totalRevenue) *
                        100
                      ).toFixed(1)
                    : 0
                }% (${week?.totalCount || 0} xe)`
          }
          rightNode={
            <KpiSparkline
              data={
                isRevenue
                  ? week?.revenueChart || [0, 0, 0, 0]
                  : week?.costChart || [0, 0, 0, 0]
              }
              preVatData={
                isRevenue ? week?.profitChart || [0, 0, 0, 0] : undefined
              }
              labels={week?.labels || []}
              onClick={handleWeekClick}
            />
          }
        />

        {/* Day Card */}
        <KpiCard
          compact
          loading={statsLoading}
          label={`${labelPrefix} Hôm nay`}
          value={
            isRevenue
              ? money(day?.totalRevenue || 0)
              : money(day?.totalCost || 0)
          }
          sub={
            isRevenue
              ? `Lãi gộp: ${money(day?.totalProfit || 0)} (${day?.totalCount || 0} xe)`
              : `Tỷ lệ giá vốn: ${
                  day?.totalRevenue
                    ? (
                        ((day?.totalCost || 0) / day.totalRevenue) *
                        100
                      ).toFixed(1)
                    : 0
                }% (${day?.totalCount || 0} xe)`
          }
          rightNode={
            <KpiSparkline
              data={
                isRevenue
                  ? day?.revenueChart || [0, 0, 0, 0, 0, 0, 0]
                  : day?.costChart || [0, 0, 0, 0, 0, 0, 0]
              }
              preVatData={
                isRevenue
                  ? day?.profitChart || [0, 0, 0, 0, 0, 0, 0]
                  : undefined
              }
              labels={day?.labels || []}
              onClick={handleDayClick}
            />
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
