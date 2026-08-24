import React, { useState } from "react";
import { LayoutDashboard, Download } from "lucide-react";
import { DashboardTemplate } from "@/shared/components/DashboardTemplate";
import { Button } from "@/shared/components/ui/Button";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient, useIsFetching } from "@tanstack/react-query";
import { format } from "date-fns";
import toast from "react-hot-toast";

import { garageDashboardApi } from "../api/garageDashboardApi";
import { GarageStatsCards } from "../components/GarageStatsCards";
import { GarageTrendChart } from "../components/GarageTrendChart";
import { GarageStatusDistributionChart } from "../components/GarageStatusDistributionChart";
import { GaragePaymentProgressCard } from "../components/GaragePaymentProgressCard";
import { GaragePnlSection } from "../components/GaragePnlSection";

export function GarageDashboard() {
  const { t } = useTranslation("garage");
  const queryClient = useQueryClient();
  const [isExporting, setIsExporting] = useState(false);

  const filterConfig = React.useMemo(() => {
    return {
      period: true,
      noDefaultPeriod: true,
      custom: [],
    };
  }, []);

  const filter = useFilterPanel(filterConfig, () => {});

  const isFetchingStats = useIsFetching({
    queryKey: ["garage-dashboard-stats"],
  });
  const isFetchingKpis = useIsFetching({
    queryKey: ["garage-checkpoint-kpis"],
  });
  const isRefreshing = isFetchingStats > 0 || isFetchingKpis > 0;

  // Query unified dashboard stats (trend, collectionSummary, statusDistribution)
  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: [
      "garage-dashboard-stats",
      filter.state.dateFrom,
      filter.state.dateTo,
    ],
    queryFn: () =>
      garageDashboardApi.getStats({
        date_from: filter.state.dateFrom || undefined,
        date_to: filter.state.dateTo || undefined,
      }),
  });

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      const params = {
        date_from: filter.state.dateFrom || undefined,
        date_to: filter.state.dateTo || undefined,
      };

      const blob = await garageDashboardApi.exportExcel(params);
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
  };

  return (
    <DashboardTemplate
      title={t("dashboard.title", "Tổng quan Garage")}
      desc={t(
        "dashboard.desc",
        "Báo cáo tổng quan hiệu quả hoạt động xưởng dịch vụ, doanh thu, chi phí, lợi nhuận gộp theo ngày hoàn thành và tiến độ thu tiền",
      )}
      icon={<LayoutDashboard className="h-4 w-4 text-emerald-600" />}
      filterConfig={filterConfig}
      filter={filter}
      loading={isRefreshing}
      onRefresh={handleRefresh}
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
        {/* Section 1: KPI Doanh thu Dịch vụ Cards (Tính theo ngày hoàn thành) */}
        <GarageStatsCards
          type="REVENUE"
          title="Doanh thu Dịch vụ (Đã hoàn thành công việc)"
        />

        {/* Section 2: KPI Giá vốn & Chi phí Cards */}
        <GarageStatsCards
          type="COST"
          title="Giá vốn & Chi phí Dịch vụ (Đã hoàn thành)"
        />

        {/* Section 3: Tiến độ Dòng tiền & Công nợ (Thu tiền KH & Trả tiền NCC) */}
        <GaragePaymentProgressCard
          collectionSummary={statsData?.collectionSummary}
          costPaymentSummary={statsData?.costPaymentSummary}
          trend={statsData?.trend}
          loading={isLoadingStats}
        />

        {/* Section 4: Trend & Status Distribution Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <GarageTrendChart filterState={filter.state} />
          </div>
          <div className="lg:col-span-1">
            <GarageStatusDistributionChart
              data={statsData?.statusDistribution}
              byMonth={statsData?.statusDistributionByMonth}
              availableMonths={statsData?.availableMonths}
              loading={isLoadingStats}
            />
          </div>
        </div>

        {/* Section 5: Báo cáo Lợi nhuận (P&L) Section */}
        <GaragePnlSection />
      </div>
    </DashboardTemplate>
  );
}
