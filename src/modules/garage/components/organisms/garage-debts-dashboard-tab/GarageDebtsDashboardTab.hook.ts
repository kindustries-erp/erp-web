import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGarageStore } from "../../../store/garageStore";
import { useGarageDebtsDashboard } from "../../../hooks/useGarageDebtsDashboard";
import type { GarageTimeHorizonKey } from "../../../api/garageDebtsAnalyticsApi";

export function useGarageDebtsDashboardTab() {
  const queryClient = useQueryClient();
  const { selectedBranchId } = useGarageStore();
  const [selectedHorizon, setSelectedHorizon] =
    useState<GarageTimeHorizonKey | null>(null);

  const {
    summary,
    agingComparison,
    timeHorizons,
    forecastHorizons,
    cashTrend,
    isLoading,
    isFetching,
    refetch,
  } = useGarageDebtsDashboard({
    branchId: selectedBranchId || undefined,
  });

  const handleRefresh = useCallback(() => {
    void refetch();
    void queryClient.invalidateQueries({
      queryKey: ["garage-dashboard-stats"],
    });
  }, [refetch, queryClient]);

  return {
    summary,
    agingComparison,
    timeHorizons,
    forecastHorizons,
    cashTrend,
    isLoading,
    isFetching,
    handleRefresh,
    selectedHorizon,
    setSelectedHorizon,
    selectedBranchId,
  };
}
