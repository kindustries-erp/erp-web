import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import type {
  CaseProgressLogItem,
  CaseWorkshopBoardParams,
  CaseWorkshopBoardResponse,
  CreateCaseProgressLogPayload,
  TrackNewWorkshopCasePayload,
  TrackWorkshopCasePayload,
  UpdateCaseProgressLogPayload,
  WorkshopCandidate,
  WorkshopTrackResult,
  WorkshopWorker,
} from "../domain/caseWorkshop.type";

const BASE = "/api/v2/cases-garage";

/** Header chi nhánh KGara (external id) mà `api/v2/cases-garage` bắt buộc. */
const withBranch = (branchId: string) => ({
  headers: { "x-kgara-branch-id": branchId },
});

const compact = <T extends object>(params: T): Partial<T> =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, v]) => v !== undefined && v !== null && v !== "",
    ),
  ) as Partial<T>;

/** API trang tiến độ xưởng (quyền `garage_workshop`). Đổi status cha dùng `caseProgressApi.updateStatus`. */
export const caseWorkshopApi = {
  board: async (
    params: CaseWorkshopBoardParams,
    branchId: string,
  ): Promise<CaseWorkshopBoardResponse> => {
    const { data } = await v2HttpClient.get<CaseWorkshopBoardResponse>(
      `${BASE}/workshop/board`,
      { params: compact(params), ...withBranch(branchId) },
    );
    return data;
  },

  timeline: async (
    caseId: string,
    branchId: string,
  ): Promise<CaseProgressLogItem[]> => {
    const { data } = await v2HttpClient.get<{ items: CaseProgressLogItem[] }>(
      `${BASE}/${caseId}/progress-logs`,
      withBranch(branchId),
    );
    return data.items ?? [];
  },

  workers: async (
    search: string,
    branchId: string,
  ): Promise<WorkshopWorker[]> => {
    const { data } = await v2HttpClient.get<{ items: WorkshopWorker[] }>(
      `${BASE}/workshop/workers`,
      { params: compact({ search: search.trim() }), ...withBranch(branchId) },
    );
    return data.items ?? [];
  },

  createLog: async (
    caseId: string,
    payload: CreateCaseProgressLogPayload,
    branchId: string,
  ): Promise<CaseProgressLogItem> => {
    const { data } = await v2HttpClient.post<{ data: CaseProgressLogItem }>(
      `${BASE}/${caseId}/progress-logs`,
      payload,
      withBranch(branchId),
    );
    return data.data;
  },

  updateLog: async (
    logId: string,
    payload: UpdateCaseProgressLogPayload,
    branchId: string,
  ): Promise<CaseProgressLogItem> => {
    const { data } = await v2HttpClient.patch<{ data: CaseProgressLogItem }>(
      `${BASE}/progress-logs/${logId}`,
      payload,
      withBranch(branchId),
    );
    return data.data;
  },

  removeLog: async (logId: string, branchId: string): Promise<void> => {
    await v2HttpClient.delete(
      `${BASE}/progress-logs/${logId}`,
      withBranch(branchId),
    );
  },

  candidates: async (
    search: string,
    branchId: string,
  ): Promise<WorkshopCandidate[]> => {
    const { data } = await v2HttpClient.get<{ items: WorkshopCandidate[] }>(
      `${BASE}/workshop/candidates`,
      { params: { search: search.trim() }, ...withBranch(branchId) },
    );
    return data.items ?? [];
  },

  track: async (
    payload: TrackWorkshopCasePayload,
    branchId: string,
  ): Promise<WorkshopTrackResult> => {
    const { data } = await v2HttpClient.post<{ data: WorkshopTrackResult }>(
      `${BASE}/workshop/track`,
      compact(payload),
      withBranch(branchId),
    );
    return data.data;
  },

  trackNew: async (
    payload: TrackNewWorkshopCasePayload,
    branchId: string,
  ): Promise<WorkshopTrackResult> => {
    const { data } = await v2HttpClient.post<{ data: WorkshopTrackResult }>(
      `${BASE}/workshop/track-new`,
      compact(payload),
      withBranch(branchId),
    );
    return data.data;
  },

  untrack: async (caseId: string, branchId: string): Promise<void> => {
    await v2HttpClient.delete(
      `${BASE}/workshop/track/${caseId}`,
      withBranch(branchId),
    );
  },
};
