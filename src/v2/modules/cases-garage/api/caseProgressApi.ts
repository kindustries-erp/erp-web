import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import type {
  CaseMutationResult,
  CaseProgressItem,
  CaseProgressListParams,
  CaseProgressListResponse,
  CaseProgressStatus,
  UpdateCaseProgressPayload,
} from "../domain/caseProgress.type";

import { branchHeaders, compactParams } from "./garageRequest";

const BASE = "/api/v2/cases-garage";

export const caseProgressApi = {
  /** Bảng theo dõi tiến độ xe; `status: "ALL"` để lấy mọi trạng thái (backend mặc định IN_PROGRESS). */
  list: async (
    params?: CaseProgressListParams,
    branchId?: string,
  ): Promise<CaseProgressListResponse> => {
    const { data } = await v2HttpClient.get<CaseProgressListResponse>(
      `${BASE}/progress`,
      {
        params: compactParams(params ?? {}),
        ...branchHeaders(branchId),
      },
    );
    return data;
  },

  /** Gom mọi trang (200 dòng/trang) của `list`; dùng cho Kanban cần toàn bộ xe. */
  listAll: async (
    params: Omit<CaseProgressListParams, "page" | "pageSize"> = {},
    branchId?: string,
  ): Promise<CaseProgressItem[]> => {
    const pageSize = 200;
    const first = await caseProgressApi.list(
      { ...params, page: 1, pageSize },
      branchId,
    );
    const items = [...first.items];
    for (let page = 2; page <= first.pagination.totalPages; page += 1) {
      const next = await caseProgressApi.list(
        { ...params, page, pageSize },
        branchId,
      );
      items.push(...next.items);
    }
    return items;
  },

  /** Đổi trạng thái vụ việc (cột Kanban). Xe sync: ghi đè ở v2, không ghi ngược KGara. */
  updateStatus: async (
    id: string,
    status: CaseProgressStatus,
    branchId?: string,
  ): Promise<CaseMutationResult> => {
    const { data } = await v2HttpClient.patch<CaseMutationResult>(
      `${BASE}/${id}/status`,
      { status },
      branchHeaders(branchId),
    );
    return data;
  },

  /** Cập nhật công đoạn, %, người phụ trách, ngày hẹn xong. */
  updateProgress: async (
    id: string,
    payload: UpdateCaseProgressPayload,
    branchId?: string,
  ): Promise<CaseMutationResult> => {
    const { data } = await v2HttpClient.patch<CaseMutationResult>(
      `${BASE}/${id}/progress`,
      payload,
      branchHeaders(branchId),
    );
    return data;
  },

  /** Về giá trị KGara cho các field đã sửa đè; bỏ `fields` để về hết. */
  revert: async (
    id: string,
    fields?: string[],
    branchId?: string,
  ): Promise<CaseMutationResult> => {
    const { data } = await v2HttpClient.post<CaseMutationResult>(
      `${BASE}/${id}/revert`,
      fields ? { fields } : {},
      branchHeaders(branchId),
    );
    return data;
  },
};
