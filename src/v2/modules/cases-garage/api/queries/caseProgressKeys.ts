import type { CaseProgressListParams } from "../../domain/caseProgress.type";

/** Khóa React Query của tiến độ xe `cases-garage`; mọi khóa bắt đầu bằng `cases-garage-progress`. */
export const caseProgressKeys = {
  all: ["cases-garage-progress"] as const,
  list: (params: CaseProgressListParams = {}) =>
    [...caseProgressKeys.all, "list", params] as const,
  listAll: (
    params: Omit<CaseProgressListParams, "page" | "pageSize"> = {},
    branchId?: string,
  ) => [...caseProgressKeys.all, "list-all", params, branchId ?? null] as const,
};
