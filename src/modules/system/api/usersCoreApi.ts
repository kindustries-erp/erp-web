import axiosInstance from "@/core/api/axiosInstance";

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

export interface AuditLogEntry {
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
const AUDIT_BASE = "/api/v1/audit-logs-core";

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

export const auditCoreApi = {
  async list(query: {
    page?: number;
    pageSize?: number;
    module?: string;
    actionType?: string;
    entityType?: string;
    entityId?: string;
    actorUserId?: string;
    dateFrom?: string;
    dateTo?: string;
    date_from?: string;
    date_to?: string;
    status?: string;
    search?: string;
    sorts?: string[];
    column_filters?: string;
    column_search?: string;
  }) {
    const params = new URLSearchParams();
    if (query.page) params.set("page", String(query.page));
    if (query.pageSize) params.set("pageSize", String(query.pageSize));
    if (query.module) params.set("module", query.module);
    if (query.actionType) params.set("actionType", query.actionType);
    if (query.entityType) params.set("entityType", query.entityType);
    if (query.entityId) params.set("entityId", query.entityId);
    if (query.actorUserId) params.set("actorUserId", query.actorUserId);
    const dFrom = query.date_from || query.dateFrom;
    const dTo = query.date_to || query.dateTo;
    if (dFrom) params.set("date_from", dFrom);
    if (dTo) params.set("date_to", dTo);
    if (query.status) params.set("status", query.status);
    if (query.search) params.set("search", query.search);
    if (query.column_filters)
      params.set("column_filters", query.column_filters);
    if (query.column_search) params.set("column_search", query.column_search);
    if (query.sorts && query.sorts.length) {
      query.sorts.forEach((s) => params.append("sorts", s));
    }
    const res = await axiosInstance.get<{
      data: AuditLogEntry[];
      total: number;
      page: number;
      pageSize: number;
    }>(`${AUDIT_BASE}?${params.toString()}`, { _silentSuccess: true });
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
    }>(`${AUDIT_BASE}/column-options?${params.toString()}`, {
      _silentSuccess: true,
    });
    return res.data;
  },

  async getEntityTimeline(entityType: string, entityId: string) {
    const res = await axiosInstance.get<AuditLogEntry[]>(
      `${AUDIT_BASE}/${entityType}/${entityId}/timeline`,
      { _silentSuccess: true },
    );
    return res.data;
  },
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
