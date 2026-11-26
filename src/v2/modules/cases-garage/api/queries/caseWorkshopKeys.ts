import type { CaseWorkshopBoardParams } from "../../domain/caseWorkshop.type";

/** Khóa React Query của trang tiến độ xưởng; mọi khóa bắt đầu bằng `cases-garage-workshop`. */
export const caseWorkshopKeys = {
  all: ["cases-garage-workshop"] as const,
  boards: () => [...caseWorkshopKeys.all, "board"] as const,
  board: (params: CaseWorkshopBoardParams, branchId?: string) =>
    [...caseWorkshopKeys.boards(), branchId ?? null, params] as const,
  timeline: (caseId: string, branchId?: string) =>
    [...caseWorkshopKeys.all, "timeline", branchId ?? null, caseId] as const,
  candidates: (search: string, branchId?: string) =>
    [...caseWorkshopKeys.all, "candidates", branchId ?? null, search] as const,
  workers: (search: string, branchId?: string) =>
    [...caseWorkshopKeys.all, "workers", branchId ?? null, search] as const,
};
