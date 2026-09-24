import { useState } from "react";
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
import { garageDashboardApi } from "../../api/garageDashboardApi";
import type { CheckpointDrawerState } from "./types";

export function useGarageStatsCardsLogic() {
  const { t } = useTranslation("garage");
  const [checkpointDrawer, setCheckpointDrawer] =
    useState<CheckpointDrawerState>({
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

  const closeCheckpointDrawer = () => {
    setCheckpointDrawer((prev) => ({ ...prev, open: false }));
  };

  return {
    t,
    statsData,
    statsLoading,
    checkpointDrawer,
    openMonthCheckpoint,
    openWeekCheckpoint,
    openDayCheckpoint,
    handleMonthClick,
    handleWeekClick,
    handleDayClick,
    closeCheckpointDrawer,
  };
}
