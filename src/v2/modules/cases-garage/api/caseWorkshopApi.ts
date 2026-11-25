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

import { branchHeaders, compactParams } from "./garageRequest";

const BASE = "/api/v2/cases-garage";

/** API trang tiến độ xưởng (quyền `garage_workshop`). `branchId` là chi nhánh ERP, không bắt buộc. Đổi status cha dùng `caseProgressApi.updateStatus`. */
export const caseWorkshopApi = {
  board: async (
    params: CaseWorkshopBoardParams,
    branchId?: string,
  ): Promise<CaseWorkshopBoardResponse> => {
    const { data } = await v2HttpClient.get<CaseWorkshopBoardResponse>(
      `${BASE}/workshop/board`,
      { params: compactParams(params), ...branchHeaders(branchId) },
    );
    return data;
  },

  timeline: async (
    caseId: string,
    branchId?: string,
  ): Promise<CaseProgressLogItem[]> => {
    const { data } = await v2HttpClient.get<{ items: CaseProgressLogItem[] }>(
      `${BASE}/${caseId}/progress-logs`,
      branchHeaders(branchId),
    );
    return data.items ?? [];
  },

  workers: async (
    search: string,
    branchId?: string,
  ): Promise<WorkshopWorker[]> => {
    const { data } = await v2HttpClient.get<{ items: WorkshopWorker[] }>(
      `${BASE}/workshop/workers`,
      {
        params: compactParams({ search: search.trim() }),
        ...branchHeaders(branchId),
      },
    );
    return data.items ?? [];
  },

  createLog: async (
    caseId: string,
    payload: CreateCaseProgressLogPayload,
    branchId?: string,
  ): Promise<CaseProgressLogItem> => {
    const { data } = await v2HttpClient.post<{ data: CaseProgressLogItem }>(
      `${BASE}/${caseId}/progress-logs`,
      payload,
      branchHeaders(branchId),
    );
    return data.data;
  },

  updateLog: async (
    logId: string,
    payload: UpdateCaseProgressLogPayload,
    branchId?: string,
  ): Promise<CaseProgressLogItem> => {
    const { data } = await v2HttpClient.patch<{ data: CaseProgressLogItem }>(
      `${BASE}/progress-logs/${logId}`,
      payload,
      branchHeaders(branchId),
    );
    return data.data;
  },

  removeLog: async (logId: string, branchId?: string): Promise<void> => {
    await v2HttpClient.delete(
      `${BASE}/progress-logs/${logId}`,
      branchHeaders(branchId),
    );
  },

  candidates: async (
    search: string,
    branchId?: string,
  ): Promise<WorkshopCandidate[]> => {
    const { data } = await v2HttpClient.get<{ items: WorkshopCandidate[] }>(
      `${BASE}/workshop/candidates`,
      { params: { search: search.trim() }, ...branchHeaders(branchId) },
    );
    return data.items ?? [];
  },

  track: async (
    payload: TrackWorkshopCasePayload,
    branchId?: string,
  ): Promise<WorkshopTrackResult> => {
    const { data } = await v2HttpClient.post<{ data: WorkshopTrackResult }>(
      `${BASE}/workshop/track`,
      compactParams(payload),
      branchHeaders(branchId),
    );
    return data.data;
  },

  trackNew: async (
    payload: TrackNewWorkshopCasePayload,
    branchId?: string,
  ): Promise<WorkshopTrackResult> => {
    const { data } = await v2HttpClient.post<{ data: WorkshopTrackResult }>(
      `${BASE}/workshop/track-new`,
      compactParams(payload),
      branchHeaders(branchId),
    );
    return data.data;
  },

  untrack: async (caseId: string, branchId?: string): Promise<void> => {
    await v2HttpClient.delete(
      `${BASE}/workshop/track/${caseId}`,
      branchHeaders(branchId),
    );
  },
};
