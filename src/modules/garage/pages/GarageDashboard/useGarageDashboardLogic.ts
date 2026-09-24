import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient, useIsFetching } from "@tanstack/react-query";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { garageDashboardApi } from "../../api/garageDashboardApi";
import type { GarageDashboardProps } from "./types";

export function useGarageDashboardLogic(props: GarageDashboardProps = {}) {
  const { tabs, activeTab, onTabChange } = props;
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

  // Query unified dashboard stats (trend, collectionSummary, classificationDistribution, statusDistribution, conversionFunnel)
  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ["garage-dashboard-stats"],
    queryFn: () => garageDashboardApi.getStats(),
  });

  // Query checkpoint KPIs (for projectedToday & projectedMonth pipelines)
  const { data: kpisData, isLoading: isLoadingKpis } = useQuery({
    queryKey: ["garage-checkpoint-kpis"],
    queryFn: () => garageDashboardApi.getCheckpointKpis(),
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

  return {
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
  };
}
