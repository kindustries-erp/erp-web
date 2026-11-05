import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import type { V2TableQuery } from "@/v2/shared/types/v2-table";
import type { ProcurementActionKey } from "./procurement.rules";
import { PROCUREMENT_REASON_ACTIONS } from "./procurement.rules";
import type {
  ProcurementApi,
  ProcurementLinePayload,
  ProcurementListResponse,
  ProcurementPoDraft,
} from "./procurement.types";

/** Tham số danh sách của API procurement: phân trang, sắp xếp và tìm kiếm chung. */
export const toProcurementListParams = (query: V2TableQuery) => ({
  page: query.page,
  pageSize: query.pageSize,
  search: query.search?.trim() || undefined,
});

/**
 * Tạo API client cho một họ chứng từ procurement theo base path.
 * Hành động duyệt là POST `{base}/{id}/{action}`; hành động có lý do gửi `{ reason }`.
 */
export function createProcurementApi<T, D = any, C = any, H = any>(
  basePath: string,
  options: {
    supportsDelete?: boolean;
    supportsPoDraft?: boolean;
    supportsPurge?: boolean;
  } = {},
): ProcurementApi<T, D, C, H> {
  return {
    list: async (query) => {
      const { data } = await v2HttpClient.get<ProcurementListResponse<T>>(
        basePath,
        { params: toProcurementListParams(query) },
      );
      return { items: data.rows, total: data.total };
    },
    transition: async (id, action: ProcurementActionKey, reason) => {
      const body = PROCUREMENT_REASON_ACTIONS.includes(action)
        ? { reason: reason ?? "" }
        : undefined;
      const { data } = await v2HttpClient.post(
        `${basePath}/${id}/${action}`,
        body,
      );
      return data;
    },
    get: async (id) => {
      const { data } = await v2HttpClient.get<D>(`${basePath}/${id}`);
      return data;
    },
    create: async (payload) => {
      const { data } = await v2HttpClient.post<{ id: string }>(
        basePath,
        payload,
      );
      return data;
    },
    updateHeader: async (id, payload) => {
      const { data } = await v2HttpClient.patch(`${basePath}/${id}`, payload);
      return data;
    },
    replaceLines: async (id, lines: ProcurementLinePayload[]) => {
      const { data } = await v2HttpClient.patch(`${basePath}/${id}/lines`, {
        lines,
      });
      return data;
    },
    poDraft: options.supportsPoDraft
      ? async (id) => {
          const { data } = await v2HttpClient.get<ProcurementPoDraft>(
            `${basePath}/${id}/po-draft`,
          );
          return data;
        }
      : undefined,
    remove: options.supportsDelete
      ? async (id) => {
          const { data } = await v2HttpClient.delete(`${basePath}/${id}`);
          return data;
        }
      : undefined,
    purge: options.supportsPurge
      ? async (id) => {
          const { data } = await v2HttpClient.delete(
            `${basePath}/${id}/permanent`,
          );
          return data;
        }
      : undefined,
  };
}
