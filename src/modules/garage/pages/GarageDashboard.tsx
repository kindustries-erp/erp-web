import React, { useState } from "react";
import { Download, LayoutDashboard } from "lucide-react";
import { DashboardTemplate } from "@/shared/components/DashboardTemplate";
import { Button } from "@/shared/components/ui/Button";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient, useIsFetching } from "@tanstack/react-query";
import { format } from "date-fns";
import toast from "react-hot-toast";

import type { TabItem } from "@/shared/components/PageLayout";

import { garageDashboardApi } from "../api/garageDashboardApi";
import { GarageStatsCards } from "../components/GarageStatsCards";
import { GarageTrendChart } from "../components/GarageTrendChart";
import { GarageClassificationDistributionChart } from "../components/GarageClassificationDistributionChart";
import { GaragePaymentProgressCard } from "../components/GaragePaymentProgressCard";
import { GaragePnlSection } from "../components/GaragePnlSection";

export interface GarageDashboardProps {
  tabs?: TabItem[];
  activeTab?: string;
  onTabChange?: (val: string) => void;
}

export function GarageDashboard({
  tabs,
  activeTab,
  onTabChange,
}: GarageDashboardProps = {}) {
  const { t } = useTranslation("garage");
  const queryClient = useQueryClient();
  const [isExporting, setIsExporting] = useState(false);

  const isFetchingStats = useIsFetching({
    queryKey: ["garage-dashboard-stats"],
  });
  const isFetchingKpis = useIsFetching({
    queryKey: ["garage-checkpoint-kpis"],
  });
  const isRefreshing = isFetchingStats > 0 || isFetchingKpis > 0;

  // Query unified dashboard stats (trend, collectionSummary, classificationDistribution)
  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ["garage-dashboard-stats"],
    queryFn: () => garageDashboardApi.getStats(),
  });

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      const blob = await garageDashboardApi.exportExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const timestamp = format(new Date(), "yyyyMMdd_HHmmss");
      a.download = `Bao_cao_Tong_quan_Garage_${timestamp}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Đã tải xuống file báo cáo Garage");
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi xuất báo cáo Garage");
    } finally {
      setIsExporting(false);
    }
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["garage-checkpoint-kpis"] });
    queryClient.invalidateQueries({ queryKey: ["garage-dashboard-stats"] });
    queryClient.invalidateQueries({ queryKey: ["garage-pnl-report"] });
    queryClient.invalidateQueries({
      queryKey: ["garage-dashboard-stats-chart"],
    });
  };

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
        {/* Section 1: KPI Hiệu quả Dịch vụ Cards (Tính theo ngày hoàn thành) */}
        <GarageStatsCards />

        {/* Section 2: Trend & Classification Distribution Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <GarageTrendChart />
          </div>
          <div className="lg:col-span-1">
            <GarageClassificationDistributionChart
              data={statsData?.classificationDistribution}
              byMonth={statsData?.classificationDistributionByMonth}
              availableMonths={statsData?.availableMonths}
              loading={isLoadingStats}
            />
          </div>
        </div>

        {/* Section 3: Báo cáo Lợi nhuận (P&L) Section */}
        <GaragePnlSection />

        {/* Section 4: Tiến độ Dòng tiền & Công nợ (Thu tiền KH & Trả tiền NCC) */}
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
