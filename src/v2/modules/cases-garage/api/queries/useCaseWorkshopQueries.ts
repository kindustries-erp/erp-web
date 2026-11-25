import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { CaseWorkshopBoardParams } from "../../domain/caseWorkshop.type";
import { caseWorkshopApi } from "../caseWorkshopApi";
import { caseWorkshopKeys } from "./caseWorkshopKeys";

/**
 * Board xưởng; tự làm mới mỗi phút để thấy cập nhật của người khác. Không chọn chi nhánh thì lấy mọi chi nhánh.
 * Chỉ giữ dữ liệu cũ khi đổi bộ lọc trong cùng chi nhánh; đổi chi nhánh thì không hiện thẻ của phạm vi cũ.
 */
export function useCaseWorkshopBoardQuery(
  params: CaseWorkshopBoardParams,
  branchId?: string,
) {
  return useQuery({
    queryKey: caseWorkshopKeys.board(params, branchId),
    queryFn: () => caseWorkshopApi.board(params, branchId),
    placeholderData: (prev, prevQuery) =>
      prevQuery?.queryKey[2] === (branchId ?? null)
        ? keepPreviousData(prev)
        : undefined,
    staleTime: 15_000,
    refetchInterval: 60_000,
  });
}

export function useCaseWorkshopTimelineQuery(
  caseId: string | null,
  branchId?: string,
) {
  return useQuery({
    queryKey: caseWorkshopKeys.timeline(caseId ?? "", branchId),
    queryFn: () => caseWorkshopApi.timeline(caseId as string, branchId),
    enabled: Boolean(caseId),
    staleTime: 10_000,
  });
}

export function useWorkshopWorkersQuery(search: string, branchId?: string) {
  return useQuery({
    queryKey: caseWorkshopKeys.workers(search, branchId),
    queryFn: () => caseWorkshopApi.workers(search, branchId),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
  });
}

/** Xe để đưa vào bảng; chỉ gọi khi đã gõ từ 2 ký tự. */
export function useWorkshopCandidatesQuery(
  search: string,
  branchId?: string,
  enabled = true,
) {
  const term = search.trim();
  return useQuery({
    queryKey: caseWorkshopKeys.candidates(term, branchId),
    queryFn: () => caseWorkshopApi.candidates(term, branchId),
    enabled: enabled && term.length >= 2,
    placeholderData: keepPreviousData,
    staleTime: 10_000,
  });
}
