import { useCallback, useState } from "react";
import { useCasesDashboardOverviewQuery } from "../api/queries/useCasesDashboardOverviewQuery";
import { useCasesDashboardVehiclesQuery } from "../api/queries/useCasesDashboardVehiclesQuery";
import type { CasesDashboardFunnelStage } from "../domain/casesDashboard.type";

export const CASES_LIST_PAGE_SIZE = 20;

/** Dữ liệu và trạng thái của trang dashboard garage; danh sách xe chỉ tải khi chọn một giai đoạn. */
export function useCasesDashboardGarage() {
  const overviewQuery = useCasesDashboardOverviewQuery();
  const [selectedStage, setSelectedStage] =
    useState<CasesDashboardFunnelStage | null>(null);
  const [page, setPage] = useState(1);
  const vehiclesQuery = useCasesDashboardVehiclesQuery(
    {
      stage: selectedStage ?? undefined,
      page,
      pageSize: CASES_LIST_PAGE_SIZE,
    },
    selectedStage !== null,
  );

  const openStage = useCallback((stage: CasesDashboardFunnelStage) => {
    setSelectedStage(stage);
    setPage(1);
  }, []);

  const closeStage = useCallback(() => setSelectedStage(null), []);

  return {
    kpi: overviewQuery.data?.period,
    funnel: overviewQuery.data?.funnel,
    isLoading: overviewQuery.isLoading,
    hasError: overviewQuery.isError,
    selectedStage,
    openStage,
    closeStage,
    vehicles: vehiclesQuery.data,
    vehiclesLoading: vehiclesQuery.isFetching,
    page,
    setPage,
  };
}
