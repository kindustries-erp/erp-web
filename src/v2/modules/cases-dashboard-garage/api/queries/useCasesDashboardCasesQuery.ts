import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { CasesDashboardCasesParams } from "../../domain/casesDashboard.type";
import { casesDashboardApi } from "../casesDashboardApi";
import { casesDashboardKeys } from "./casesDashboardKeys";

/** Danh sách lệnh (drill-down); giữ dữ liệu trang cũ khi đổi trang để không nhấp nháy. */
export function useCasesDashboardCasesQuery(
  params: CasesDashboardCasesParams = {},
  enabled = true,
) {
  return useQuery({
    queryKey: casesDashboardKeys.cases(params),
    queryFn: () => casesDashboardApi.listCases(params),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
    enabled,
  });
}
