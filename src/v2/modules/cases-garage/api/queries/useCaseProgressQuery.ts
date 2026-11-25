import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { CaseProgressListParams } from "../../domain/caseProgress.type";
import { caseProgressApi } from "../caseProgressApi";
import { caseProgressKeys } from "./caseProgressKeys";

/** Danh sách tiến độ xe (nguồn dữ liệu Kanban); giữ dữ liệu cũ khi đổi tham số để không nhấp nháy. */
export function useCaseProgressQuery(
  params: CaseProgressListParams = {},
  enabled = true,
) {
  return useQuery({
    queryKey: caseProgressKeys.list(params),
    queryFn: () => caseProgressApi.list(params),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
    enabled,
  });
}
