import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import type {
  V2FetchOptions,
  V2FilterOption,
} from "@/v2/shared/types/v2-table";
import type { ProcurementActionKey } from "./procurement.rules";
import { PROCUREMENT_REASON_ACTIONS } from "./procurement.rules";
import { toSummaryKeysParam } from "@/v2/shared/utils/toSummaryKeysParam";
import { toFetchOptionsResult } from "@/v2/shared/utils/v2FetchOptionsAdapter";
import type { V2PaginatedResponse } from "@/v2/shared/types/v2-pagination";
import type {
  ProcurementApi,
  ProcurementApprovalEvent,
  ProcurementFetchOptionsParams,
  ProcurementLinePayload,
  ProcurementListResponse,
  ProcurementPoDraft,
  ProcurementTableQuery,
} from "./procurement.types";

/**
 * Gắn bộ lọc procurement (đã xóa mềm) vào hàm lấy gợi ý cột của bảng V2.
 * Thiếu API thì trả undefined để bảng dùng cấu hình mặc định.
 */
export const withProcurementFilter = (
  options: ProcurementApi<unknown>["options"],
  filter: Pick<ProcurementFetchOptionsParams, "deleted">,
): V2FetchOptions | undefined =>
  options ? (params) => options({ ...params, ...filter }) : undefined;

/** Tham số danh sách của API procurement: phân trang, sắp xếp, bộ lọc bảng V2 và bộ lọc riêng. */
export const toProcurementListParams = (query: ProcurementTableQuery) => ({
  page: query.page,
  status: query.status || undefined,
  deleted: query.deleted,
  pageSize: query.pageSize,
  search: query.search?.trim() || undefined,
  sort: query.sorts?.length
    ? query.sorts
        .map((s) => (s.direction === "desc" ? `-${s.columnKey}` : s.columnKey))
        .join(",")
    : undefined,
  column_filters:
    query.columnFilters && Object.keys(query.columnFilters).length
      ? JSON.stringify(query.columnFilters)
      : undefined,
  column_search:
    query.columnSearch && Object.keys(query.columnSearch).length
      ? JSON.stringify(query.columnSearch)
      : undefined,
  column_operators:
    query.columnOperators && Object.keys(query.columnOperators).length
      ? JSON.stringify(query.columnOperators)
      : undefined,
  date_ranges:
    query.dateRanges && Object.keys(query.dateRanges).length
      ? JSON.stringify(query.dateRanges)
      : undefined,
  summary_keys: toSummaryKeysParam(query),
});

/**
 * Tạo API client cho một họ chứng từ procurement theo base path.
 * Hành động duyệt là POST `{base}/{id}/{action}`; hành động có lý do gửi `{ reason }`.
 */
export function createProcurementApi<T, D = unknown, C = unknown, H = unknown>(
  basePath: string,
  options: {
    supportsDelete?: boolean;
    supportsPoDraft?: boolean;
    supportsPurge?: boolean;
    supportsClone?: boolean;
    /** Đường dẫn lưu-và-hành-động một bước: PR `save-and-submit`, PO `save-and-confirm` */
    saveAndAct?: "save-and-submit" | "save-and-confirm";
  } = {},
): ProcurementApi<T, D, C, H> {
  return {
    list: async (query) => {
      const { data } = await v2HttpClient.get<ProcurementListResponse<T>>(
        basePath,
        { params: toProcurementListParams(query) },
      );
      return {
        items: data.items,
        total: data.pagination.total,
        summaries: data.summaries,
      };
    },
    transition: async (
      id,
      action: ProcurementActionKey,
      reason,
      approverId,
    ) => {
      const body =
        action === "submit" && approverId
          ? { approverId }
          : PROCUREMENT_REASON_ACTIONS.includes(action)
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
    saveAndSubmit: options.saveAndAct
      ? async (id, body) => {
          const url = id
            ? `${basePath}/${id}/${options.saveAndAct}`
            : `${basePath}/${options.saveAndAct}`;
          const { data } = id
            ? await v2HttpClient.patch<{ id: string }>(url, body)
            : await v2HttpClient.post<{ id: string }>(url, body);
          return data;
        }
      : undefined,
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
    approvalEvents: async (id) => {
      const { data } = await v2HttpClient.get<ProcurementApprovalEvent[]>(
        `${basePath}/${id}/approval-events`,
      );
      return data;
    },
    remove: options.supportsDelete
      ? async (id) => {
          const { data } = await v2HttpClient.delete(`${basePath}/${id}`);
          return data;
        }
      : undefined,
    clone: options.supportsClone
      ? async (id) => {
          const { data } = await v2HttpClient.post<{ id: string }>(
            `${basePath}/${id}/clone`,
          );
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
    options: async (params: ProcurementFetchOptionsParams) => {
      const { data } = await v2HttpClient.get<
        V2PaginatedResponse<V2FilterOption>
      >(`${basePath}/column-options`, {
        params: {
          column: params.columnKey,
          search: params.search,
          page: params.pageParam,
          pageSize: 20,
          filters: params.filtersStr,
          deleted: params.deleted,
        },
      });
      return toFetchOptionsResult(data);
    },
  };
}
