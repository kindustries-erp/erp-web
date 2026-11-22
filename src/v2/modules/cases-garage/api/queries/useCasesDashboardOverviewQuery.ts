import { useQuery } from "@tanstack/react-query";
import type { CasesDashboardOverviewParams } from "../../domain/casesDashboard.type";
import { casesDashboardApi } from "../casesDashboardApi";
import { casesDashboardKeys } from "./casesDashboardKeys";

/** KPI các kỳ, dự thu và phễu giai đoạn trong một lần gọi (mặc định hôm nay, tháng hiện tại). */
export function useCasesDashboardOverviewQuery(
  params: CasesDashboardOverviewParams = {},
) {
  return useQuery({
    queryKey: casesDashboardKeys.overview(params),
    queryFn: () => casesDashboardApi.getOverview(params),
    staleTime: 30_000,
  });
}
