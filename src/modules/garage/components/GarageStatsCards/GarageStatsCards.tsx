import React from "react";
import { TrendingUp, Calendar, Clock } from "lucide-react";
import { GarageCheckpointDrawer } from "../GarageCheckpointDrawer";
import { StatsKpiCardItem } from "./components/StatsKpiCardItem";
import { useGarageStatsCardsLogic } from "./useGarageStatsCardsLogic";

export function GarageStatsCards() {
  const {
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
  } = useGarageStatsCardsLogic();

  return (
    <div className="flex flex-col gap-4">
      {/* 3 Realized KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {/* 1. Month Card */}
        <StatsKpiCardItem
          label={t("dashboard.kpis.monthLabel", "Doanh thu Tháng này")}
          icon={<TrendingUp className="w-3.5 h-3.5 text-primary" />}
          data={statsData?.month}
          loading={statsLoading}
          defaultChartLength={6}
          revenueNetLabel={t("dashboard.kpis.revenueNet", "Doanh thu thuần")}
          grossProfitShortLabel={t(
            "dashboard.kpis.grossProfitShort",
            "Lãi gộp",
          )}
          vehiclesCompletedLabel={t(
            "dashboard.kpis.vehiclesCompleted",
            "xe hoàn tất",
          )}
          onCardClick={openMonthCheckpoint}
          onSparklineClick={handleMonthClick}
        />

        {/* 2. Week Card */}
        <StatsKpiCardItem
          label={t("dashboard.kpis.weekLabel", "Doanh thu Tuần này")}
          icon={<Calendar className="w-3.5 h-3.5 text-primary" />}
          data={statsData?.week}
          loading={statsLoading}
          defaultChartLength={4}
          revenueNetLabel={t("dashboard.kpis.revenueNet", "Doanh thu thuần")}
          grossProfitShortLabel={t(
            "dashboard.kpis.grossProfitShort",
            "Lãi gộp",
          )}
          vehiclesCompletedLabel={t(
            "dashboard.kpis.vehiclesCompleted",
            "xe hoàn tất",
          )}
          onCardClick={openWeekCheckpoint}
          onSparklineClick={handleWeekClick}
        />

        {/* 3. Day Card */}
        <StatsKpiCardItem
          label={t("dashboard.kpis.dayLabel", "Doanh thu Hôm nay")}
          icon={<Clock className="w-3.5 h-3.5 text-primary" />}
          data={statsData?.day}
          loading={statsLoading}
          defaultChartLength={7}
          revenueNetLabel={t("dashboard.kpis.revenueNet", "Doanh thu thuần")}
          grossProfitShortLabel={t(
            "dashboard.kpis.grossProfitShort",
            "Lãi gộp",
          )}
          vehiclesCompletedLabel={t(
            "dashboard.kpis.vehiclesCompleted",
            "xe hoàn tất",
          )}
          onCardClick={openDayCheckpoint}
          onSparklineClick={handleDayClick}
        />
      </div>

      <GarageCheckpointDrawer
        open={checkpointDrawer.open}
        onClose={closeCheckpointDrawer}
        dateFrom={checkpointDrawer.dateFrom}
        dateTo={checkpointDrawer.dateTo}
        periodLabel={checkpointDrawer.periodLabel}
      />
    </div>
  );
}
