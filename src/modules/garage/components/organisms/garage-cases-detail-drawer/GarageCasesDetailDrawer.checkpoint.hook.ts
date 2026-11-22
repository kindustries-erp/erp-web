import { useQuery } from "@tanstack/react-query";
import { garageDashboardApi } from "@/modules/garage/api/garageDashboardApi";
import type { GarageCasesScope } from "./GarageCasesDetailDrawer.type";

/** Số xe tối đa tải một lần (khớp `@Max(500)` của API). */
export const CHECKPOINT_VEHICLE_PAGE_SIZE = 500;

type CheckpointScope = Extract<GarageCasesScope, { kind: "checkpoint" }>;

/** Tải danh sách XE (group_by=vehicle) của một kỳ checkpoint. */
export function useCheckpointVehiclesQuery(
  scope: CheckpointScope | null,
  open: boolean,
) {
  return useQuery({
    queryKey: [
      "garage",
      "casesDetailCheckpoint",
      scope?.dateFrom,
      scope?.dateTo,
      scope?.branchId,
      scope?.classification,
      scope?.isFunnel,
      "vehicle",
    ],
    queryFn: () =>
      garageDashboardApi.getCheckpointVehicles({
        date_from: scope!.dateFrom,
        date_to: scope!.dateTo,
        classification: scope?.classification,
        is_funnel: scope?.isFunnel,
        page: 1,
        pageSize: CHECKPOINT_VEHICLE_PAGE_SIZE,
      }),
    enabled: Boolean(open && scope?.dateFrom && scope?.dateTo),
  });
}
