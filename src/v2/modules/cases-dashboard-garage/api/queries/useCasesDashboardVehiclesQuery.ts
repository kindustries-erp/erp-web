import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { CasesDashboardVehiclesParams } from "../../domain/casesDashboard.type";
import { casesDashboardApi } from "../casesDashboardApi";
import { casesDashboardKeys } from "./casesDashboardKeys";

/** Danh sách XE (drill-down); giữ dữ liệu trang cũ khi đổi trang để không nhấp nháy. */
export function useCasesDashboardVehiclesQuery(
  params: CasesDashboardVehiclesParams = {},
  enabled = true,
) {
  return useQuery({
    queryKey: casesDashboardKeys.vehicles(params),
    queryFn: () => casesDashboardApi.listVehicles(params),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
    enabled,
  });
}
