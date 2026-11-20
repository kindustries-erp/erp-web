import { useQuery } from "@tanstack/react-query";
import { casesDashboardApi } from "../casesDashboardApi";
import { casesDashboardKeys } from "./casesDashboardKeys";

/** KPI tháng/tuần/ngày và dự thu quanh ngày gốc (mặc định hôm nay). */
export function useCasesDashboardPeriodKpisQuery(date?: string) {
  return useQuery({
    queryKey: casesDashboardKeys.periodKpis(date),
    queryFn: () => casesDashboardApi.getPeriodKpis(date),
    staleTime: 30_000,
  });
}
