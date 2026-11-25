import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { CaseProgressListParams } from "../../domain/caseProgress.type";
import { caseProgressApi } from "../caseProgressApi";
import { caseProgressKeys } from "./caseProgressKeys";

/** Toàn bộ dòng tiến độ (mọi trang) để dựng Kanban; mặc định lấy mọi trạng thái. `branchId` là external id KGara. */
export function useCaseProgressAllQuery(
  params: Omit<CaseProgressListParams, "page" | "pageSize"> = { status: "ALL" },
  enabled = true,
  branchId?: string,
) {
  return useQuery({
    queryKey: caseProgressKeys.listAll(params, branchId),
    queryFn: () => caseProgressApi.listAll(params, branchId),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
    enabled,
  });
}
