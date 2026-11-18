import React from "react";
import { TrendingUp, Calendar, Clock } from "lucide-react";
import { GarageCheckpointDrawer } from "../GarageCheckpointDrawer";
import { StatsKpiCardItem } from "./components/StatsKpiCardItem";
import { useGarageStatsCardsLogic } from "./useGarageStatsCardsLogic";

/**
 * Component hiển thị hàng 3 Thẻ thống kê đầu trang Dashboard Garage - Ultra-Compact:
 * 1. Xe Tháng này
 * 2. Xe Tuần này
 * 3. Xe Hôm nay
 *
 * Mỗi thẻ tích hợp:
 * - Số lượng xe to rõ
 * - Mini Donut Chart các giai đoạn tiếp nhận xe (click phân đoạn để lọc mở drawer)
 * - Tiến độ thu tiền thực tế (Phải thu, Đã thu, Còn nợ & progress bar)
 * - Click vào thẻ để mở drawer tất cả vụ việc trong kỳ
 */
export function GarageStatsCards() {
  const {
    t,
    statsData,
    statsLoading,
    checkpointDrawer,
    openMonthCheckpoint,
    openMonthCheckpointStage,
    openWeekCheckpoint,
    openWeekCheckpointStage,
    openDayCheckpoint,
    openDayCheckpointStage,
    closeCheckpointDrawer,
  } = useGarageStatsCardsLogic();

  return (
    <div className="flex flex-col gap-4">
      {/* Lưới 3 thẻ KPI theo kỳ: Tháng, Tuần, Hôm nay */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {/* 1. Thẻ Xe Tháng này */}
        <StatsKpiCardItem
          label={t("dashboard.kpis.monthLabel", "Xe Tháng này")}
          icon={<TrendingUp className="w-3.5 h-3.5 text-primary" />}
          data={statsData?.month}
          loading={statsLoading}
          onCardClick={openMonthCheckpoint}
          onStageClick={openMonthCheckpointStage}
        />

        {/* 2. Thẻ Xe Tuần này */}
        <StatsKpiCardItem
          label={t("dashboard.kpis.weekLabel", "Xe Tuần này")}
          icon={<Calendar className="w-3.5 h-3.5 text-primary" />}
          data={statsData?.week}
          loading={statsLoading}
          onCardClick={openWeekCheckpoint}
          onStageClick={openWeekCheckpointStage}
        />

        {/* 3. Thẻ Xe Hôm nay */}
        <StatsKpiCardItem
          label={t("dashboard.kpis.dayLabel", "Xe Hôm nay")}
          icon={<Clock className="w-3.5 h-3.5 text-primary" />}
          data={statsData?.day}
          loading={statsLoading}
          onCardClick={openDayCheckpoint}
          onStageClick={openDayCheckpointStage}
        />
      </div>

      {/* Drawer xem chi tiết danh sách xe trong kỳ (hoặc theo giai đoạn đã chọn) */}
      <GarageCheckpointDrawer
        open={checkpointDrawer.open}
        onClose={closeCheckpointDrawer}
        dateFrom={checkpointDrawer.dateFrom}
        dateTo={checkpointDrawer.dateTo}
        periodLabel={checkpointDrawer.periodLabel}
        initialStatus={checkpointDrawer.initialStatus}
        isFunnel={checkpointDrawer.isFunnel}
      />
    </div>
  );
}
