import React from "react";
import { Download, LayoutDashboard } from "lucide-react";
import { DashboardTemplate } from "@/shared/components/DashboardTemplate";
import { Button } from "@/shared/components/ui/Button";

import { GarageStatsCards } from "../../components/GarageStatsCards";
import { GarageTrendChart } from "../../components/GarageTrendChart";
import { GarageConversionFunnelCard } from "../../components/GarageConversionFunnelCard";
import { GaragePaymentProgressCard } from "../../components/GaragePaymentProgressCard";
import { GaragePnlSection } from "../../components/GaragePnlSection";

import type { GarageDashboardProps } from "./types";
import { useGarageDashboardLogic } from "./useGarageDashboardLogic";

export function GarageDashboard(props: GarageDashboardProps = {}) {
  const {
    t,
    tabs,
    activeTab,
    onTabChange,
    isRefreshing,
    isExporting,
    handleExportExcel,
    handleRefresh,
    statsData,
    isLoadingStats,
    kpisData,
    isLoadingKpis,
  } = useGarageDashboardLogic(props);

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
      extraActions={
        <Button
          onClick={handleExportExcel}
          disabled={isExporting}
          variant="outline"
          className="h-8 gap-1"
        >
          <Download className="h-4 w-4" />
          Xuất Excel
        </Button>
      }
    >
      <div className="flex flex-col gap-6 mb-8">
        {/* Section 1: KPI Hiệu quả Dịch vụ & Tiến độ thu tiền thực tế */}
        <GarageStatsCards />

        {/* Section 2: Pipeline Dự Thu & Phễu Chuyển Đổi Dịch Vụ (Hub 3 Tầng & Donut Phân Bổ Đồng Bộ) */}
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

        {/* Section 3: Xu hướng Doanh thu & Chi phí */}
        <div className="w-full">
          <GarageTrendChart />
        </div>

        {/* Section 4: Báo cáo Lợi nhuận (P&L) Section */}
        <GaragePnlSection />

        {/* Section 5: Tiến độ Dòng tiền & Công nợ (Thu tiền KH & Trả tiền NCC) */}
        <GaragePaymentProgressCard
          collectionSummary={statsData?.collectionSummary}
          costPaymentSummary={statsData?.costPaymentSummary}
          trend={statsData?.trend}
          loading={isLoadingStats}
        />
      </div>
    </DashboardTemplate>
  );
}
