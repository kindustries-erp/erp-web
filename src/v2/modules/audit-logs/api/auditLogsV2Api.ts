import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import type { V2PaginatedResponse } from "@/v2/shared/types/v2-pagination";

const BASE = "/api/v2/audit-logs";

/** Một dòng nhật ký theo DTO `/api/v2/audit-logs` (V2 tự định nghĩa, không dùng chung với V1). */
export interface AuditLogRowDto {
  id: string;
  requestId: string | null;
  actorUserId: string | null;
  actorEmail: string | null;
  actorEmployeeId: string | null;
  actionType: string;
  module: string;
  entityType: string | null;
  entityId: string | null;
  route: string | null;
  httpMethod: string | null;
  status: string;
  message: string | null;
  uiScreen: string | null;
  uiAction: string | null;
  beforeSnapshot: Record<string, unknown> | null;
  afterSnapshot: Record<string, unknown> | null;
  errorSnapshot: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface AuditLogsListQuery {
  page?: number;
  pageSize?: number;
  module?: string;
  actionType?: string;
  entityType?: string;
  entityId?: string;
  actorUserId?: string;
  date_from?: string;
  date_to?: string;
  status?: string;
  search?: string;
  sorts?: string[];
  column_filters?: string;
  column_search?: string;
}

const SCALAR_KEYS = [
  "module",
  "actionType",
  "entityType",
  "entityId",
  "actorUserId",
  "status",
  "search",
  "column_filters",
  "column_search",
] as const;

export const toAuditLogsListParams = (
  query: AuditLogsListQuery,
): URLSearchParams => {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.pageSize) params.set("pageSize", String(query.pageSize));
  SCALAR_KEYS.forEach((k) => {
    const v = query[k];
    if (v) params.set(k, v);
  });
  if (query.date_from) params.set("date_from", query.date_from);
  if (query.date_to) params.set("date_to", query.date_to);
  query.sorts?.forEach((s) => params.append("sorts", s));
  return params;
};

export const auditLogsV2Api = {
  async list(query: AuditLogsListQuery) {
    const res = await v2HttpClient.get<V2PaginatedResponse<AuditLogRowDto>>(
      `${BASE}?${toAuditLogsListParams(query).toString()}`,
    );
    const { items, pagination } = res.data;
    return {
      data: items,
      total: pagination.total,
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
  },

  async columnOptions(
    column: string,
    search = "",
    page = 1,
    pageSize = 20,
    filters?: string,
  ) {
    const params = new URLSearchParams({ column });
    if (search) params.set("search", search);
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    if (filters) params.set("filters", filters);
    const res = await v2HttpClient.get<
      V2PaginatedResponse<{ label: string; value: string }>
    >(`${BASE}/column-options?${params.toString()}`);
    const { items, pagination } = res.data;
    return { items, total: pagination.total, next: pagination.next };
  },

  async timeline(entityType: string, entityId: string) {
    const res = await v2HttpClient.get<{ items: AuditLogRowDto[] }>(
      `${BASE}/${encodeURIComponent(entityType)}/${encodeURIComponent(entityId)}/timeline`,
    );
    return res.data.items ?? [];
  },
};
