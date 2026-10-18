import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient, useIsFetching } from "@tanstack/react-query";
import { useGarageHeaderActions } from "../../components/GarageHeaderActions";
import { garageDashboardApi } from "../../api/garageDashboardApi";
import type { GarageDashboardProps } from "./types";

export function useGarageDashboardLogic(props: GarageDashboardProps = {}) {
  const { tabs, activeTab, onTabChange } = props;
  const { t } = useTranslation("garage");
  const queryClient = useQueryClient();
  const headerActions = useGarageHeaderActions();

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
    headerActions,
    handleRefresh,
    statsData,
    isLoadingStats,
    kpisData,
    isLoadingKpis,
  };
}
