import { useCallback, useState } from "react";
import { useCasesDashboardCasesQuery } from "../api/queries/useCasesDashboardCasesQuery";
import { useCasesDashboardFunnelQuery } from "../api/queries/useCasesDashboardFunnelQuery";
import { useCasesDashboardPeriodKpisQuery } from "../api/queries/useCasesDashboardPeriodKpisQuery";
import type { CasesDashboardFunnelStage } from "../domain/casesDashboard.type";

export const CASES_LIST_PAGE_SIZE = 20;

/** Dữ liệu và trạng thái của trang dashboard garage; danh sách lệnh chỉ tải khi chọn một giai đoạn. */
export function useCasesDashboardGarage() {
  const kpiQuery = useCasesDashboardPeriodKpisQuery();
  const funnelQuery = useCasesDashboardFunnelQuery();
  const [selectedStage, setSelectedStage] =
    useState<CasesDashboardFunnelStage | null>(null);
  const [page, setPage] = useState(1);
  const casesQuery = useCasesDashboardCasesQuery(
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
    kpi: kpiQuery.data,
    funnel: funnelQuery.data,
    isLoading: kpiQuery.isLoading || funnelQuery.isLoading,
    hasError: kpiQuery.isError || funnelQuery.isError,
    selectedStage,
    openStage,
    closeStage,
    cases: casesQuery.data,
    casesLoading: casesQuery.isFetching,
    page,
    setPage,
  };
}
