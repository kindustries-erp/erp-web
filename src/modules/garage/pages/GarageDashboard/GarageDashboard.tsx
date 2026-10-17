import React from "react";
import { DownloadCloud, LayoutDashboard } from "lucide-react";
import { DashboardTemplate } from "@/shared/components/DashboardTemplate";

import { GarageStatsCards } from "../../components/GarageStatsCards";
import { GarageConversionFunnelCard } from "../../components/GarageConversionFunnelCard";
import { GaragePnlSection } from "../../components/GaragePnlSection";
import { GarageHeaderActionDrawers } from "../../components/GarageHeaderActions";
import { useGarageStore } from "../../store/garageStore";

import type { GarageDashboardProps } from "./types";
import { useGarageDashboardLogic } from "./useGarageDashboardLogic";

export function GarageDashboard(props: GarageDashboardProps = {}) {
  const {
    t,
    tabs,
    activeTab,
    onTabChange,
    isRefreshing,
    headerActions,
    handleRefresh,
    statsData,
    isLoadingStats,
    kpisData,
    isLoadingKpis,
  } = useGarageDashboardLogic(props);
  const { selectedBranchId } = useGarageStore();

  return (
    <DashboardTemplate
      title={t("dashboard.title", "Tổng quan Garage")}
      desc={t(
        "dashboard.desc",
        "Báo cáo tổng quan hiệu quả hoạt động xưởng dịch vụ, doanh thu, chi phí, lợi nhuận gộp theo ngày hoàn thành và tiến độ thu tiền",
      )}
      icon={<LayoutDashboard className="h-4 w-4" />}
      loading={isRefreshing}
      onRefresh={handleRefresh}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
      onCreate={
        headerActions.canSyncGarage
          ? () => headerActions.openSync("cases")
          : undefined
      }
      createLabel={t("cases.actions.syncCases", "Đồng bộ")}
      createIcon={<DownloadCloud className="w-4 h-4 mr-1.5" />}
      createActions={headerActions.createActions}
    >
      <div className="flex flex-col gap-6 mb-8">
        {/* Section 1: KPI Hiệu quả Dịch vụ & Tiến độ thu tiền thực tế */}
        <GarageStatsCards />

        {/* Section 2: Báo cáo Lợi nhuận (P&L) Section (Header + Chart Xu Hướng + Bảng P&L) */}
        <GaragePnlSection />

        {/* Section 3: Pipeline Dự Thu & Phễu Chuyển Đổi Dịch Vụ (3 Cards Độc Lập & Period Picker) */}
        <GarageConversionFunnelCard
          funnel={statsData?.conversionFunnel}
          byMonth={statsData?.conversionFunnelByMonth}
          availableMonths={statsData?.availableMonths}
          projectedToday={kpisData?.projectedToday}
          projectedMonth={kpisData?.projectedMonth}
          statusDistribution={statsData?.statusDistribution}
          statusDistributionByMonth={statsData?.statusDistributionByMonth}
          classificationDistribution={statsData?.classificationDistribution}
          classificationDistributionByMonth={
            statsData?.classificationDistributionByMonth
          }
          loading={isLoadingStats || isLoadingKpis}
        />
      </div>

      <GarageHeaderActionDrawers
        actions={headerActions}
        defaultReportType="period-all"
        branchId={selectedBranchId}
        onSyncSuccess={handleRefresh}
      />
    </DashboardTemplate>
  );
}
