import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { CaseWorkshopBoardParams } from "../../domain/caseWorkshop.type";
import { caseWorkshopApi } from "../caseWorkshopApi";
import { caseWorkshopKeys } from "./caseWorkshopKeys";

/** Board xưởng; tự làm mới mỗi phút để thấy cập nhật của người khác. Thiếu chi nhánh thì không gọi. */
export function useCaseWorkshopBoardQuery(
  params: CaseWorkshopBoardParams,
  branchId?: string,
) {
  return useQuery({
    queryKey: caseWorkshopKeys.board(params, branchId ?? ""),
    queryFn: () => caseWorkshopApi.board(params, branchId as string),
    enabled: Boolean(branchId),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
    refetchInterval: 60_000,
  });
}

export function useCaseWorkshopTimelineQuery(
  caseId: string | null,
  branchId?: string,
) {
  return useQuery({
    queryKey: caseWorkshopKeys.timeline(caseId ?? "", branchId ?? ""),
    queryFn: () =>
      caseWorkshopApi.timeline(caseId as string, branchId as string),
    enabled: Boolean(caseId && branchId),
    staleTime: 10_000,
  });
}

export function useWorkshopWorkersQuery(search: string, branchId?: string) {
  return useQuery({
    queryKey: caseWorkshopKeys.workers(search, branchId ?? ""),
    queryFn: () => caseWorkshopApi.workers(search, branchId as string),
    enabled: Boolean(branchId),
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
    queryKey: caseWorkshopKeys.candidates(term, branchId ?? ""),
    queryFn: () => caseWorkshopApi.candidates(term, branchId as string),
    enabled: enabled && Boolean(branchId) && term.length >= 2,
    placeholderData: keepPreviousData,
    staleTime: 10_000,
  });
}
