import axiosInstance from "@/core/api/axiosInstance";
import {
  auditLogsV2Api,
  type AuditLogRowDto,
  type AuditLogsListQuery,
} from "@/v2/modules/audit-logs/api/auditLogsV2Api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CoreUserAdmin {
  id: string;
  email: string;
  status: "ACTIVE" | "INACTIVE";
  employeeId: string | null;
  legacyDirectusUserId: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  employee: {
    id: string;
    fullName: string;
    employeeCode: string;
    email: string | null;
    phone: string | null;
    status: string;
  } | null;
}

/** Cùng kiểu với dòng trả về của client v2, tránh hai định nghĩa lệch nhau. */
export type AuditLogEntry = AuditLogRowDto;

export interface ErpEmployee {
  id: string;
  fullName: string;
  employeeCode: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  startDate: string | null;
  leaveDate: string | null;
  status: string;
}

// ─── User Admin API ──────────────────────────────────────────────────────────

const BASE = "/api/v1/admin/users";

const EMPLOYEES_BASE = "/api/v1/employees";

export const usersAdminApi = {
  async list(query: {
    page?: number;
    pageSize?: number;
    status?: string;
    search?: string;
    sorts?: string[];
    date_from?: string;
    date_to?: string;
    column_filters?: string;
    column_search?: string;
  }) {
    const params = new URLSearchParams();
    if (query.page) params.set("page", String(query.page));
    if (query.pageSize) params.set("pageSize", String(query.pageSize));
    if (query.status) params.set("status", query.status);
    if (query.search) params.set("search", query.search);
    if (query.date_from) params.set("date_from", query.date_from);
    if (query.date_to) params.set("date_to", query.date_to);
    if (query.column_filters)
      params.set("column_filters", query.column_filters);
    if (query.column_search) params.set("column_search", query.column_search);
    if (query.sorts && query.sorts.length) {
      query.sorts.forEach((s) => params.append("sorts", s));
    }
    const res = await axiosInstance.get<{
      data: CoreUserAdmin[];
      total: number;
      page: number;
      pageSize: number;
    }>(`${BASE}?${params.toString()}`, { _silentSuccess: true });
    return res.data;
  },

  async getColumnOptions(
    columnKey: string,
    search: string = "",
    pageParam: number = 1,
    pageSize: number = 20,
    filtersStr?: string,
  ) {
    const params = new URLSearchParams();
    params.set("column", columnKey);
    if (search) params.set("search", search);
    params.set("page", String(pageParam));
    params.set("pageSize", String(pageSize));
    if (filtersStr) params.set("filters", filtersStr);

    const res = await axiosInstance.get<{
      items: { label: string; value: string }[];
      total: number;
      next: number | null;
    }>(`${BASE}/column-options?${params.toString()}`, { _silentSuccess: true });
    return res.data;
  },

  async create(body: { email: string; password: string; employeeId?: string }) {
    const res = await axiosInstance.post<{
      message: string;
      data: CoreUserAdmin;
    }>(BASE, body);
    return res.data;
  },

  async update(
    id: string,
    body: { status?: string; employeeId?: string | null },
  ) {
    const res = await axiosInstance.patch<{
      message: string;
      data: CoreUserAdmin;
    }>(`${BASE}/${id}`, body);
    return res.data;
  },

  async activate(id: string) {
    const res = await axiosInstance.post<{ message: string }>(
      `${BASE}/${id}/activate`,
    );
    return res.data;
  },

  async deactivate(id: string) {
    const res = await axiosInstance.post<{ message: string }>(
      `${BASE}/${id}/deactivate`,
    );
    return res.data;
  },

  async resetPassword(id: string, newPassword: string) {
    const res = await axiosInstance.post<{ message: string }>(
      `${BASE}/${id}/reset-password`,
      { newPassword },
    );
    return res.data;
  },

  async linkEmployee(id: string, employeeId: string) {
    const res = await axiosInstance.post<{ message: string }>(
      `${BASE}/${id}/link-employee`,
      { employeeId },
    );
    return res.data;
  },

  async unlinkEmployee(id: string) {
    const res = await axiosInstance.post<{ message: string }>(
      `${BASE}/${id}/unlink-employee`,
    );
    return res.data;
  },
};

// ─── Audit Core API ──────────────────────────────────────────────────────────

/** Ủy quyền sang client v2 `/api/v2/audit-logs`; giữ nguyên hình dạng trả về cho UI hiện có. */
export const auditCoreApi = {
  list: (query: AuditLogsListQuery) => auditLogsV2Api.list(query),

  getColumnOptions: (
    columnKey: string,
    search: string = "",
    pageParam: number = 1,
    pageSize: number = 20,
    filtersStr?: string,
  ) =>
    auditLogsV2Api.columnOptions(
      columnKey,
      search,
      pageParam,
      pageSize,
      filtersStr,
    ),

  getEntityTimeline: (entityType: string, entityId: string) =>
    auditLogsV2Api.timeline(entityType, entityId),
};

// ─── Employees API (for select) ───────────────────────────────────────────────

export const employeeSelectApi = {
  async list() {
    const res = await axiosInstance.get<{
      items?: ErpEmployee[];
      data?: ErpEmployee[];
      total?: number;
    }>(`${EMPLOYEES_BASE}?page=1&pageSize=200`, { _silentSuccess: true });
    return (res.data.items ?? res.data.data ?? []) as ErpEmployee[];
  },
};
