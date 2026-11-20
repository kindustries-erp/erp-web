import { useQuery } from "@tanstack/react-query";
import type { CasesDashboardRangeParams } from "../../domain/casesDashboard.type";
import { casesDashboardApi } from "../casesDashboardApi";
import { casesDashboardKeys } from "./casesDashboardKeys";

/** Phễu giai đoạn theo khoảng ngày (mặc định tháng hiện tại phía backend). */
export function useCasesDashboardFunnelQuery(
  params: CasesDashboardRangeParams = {},
) {
  return useQuery({
    queryKey: casesDashboardKeys.funnel(params),
    queryFn: () => casesDashboardApi.getFunnel(params),
    staleTime: 30_000,
  });
}
