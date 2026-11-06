import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import type {
  V2FetchOptionsParams,
  V2TableQuery,
} from "@/v2/shared/types/v2-table";
import type { Role, RoleFormValue } from "../domain/entities/role";
import {
  FALLBACK_RESOURCES,
  type ResourceItem,
} from "../domain/entities/permission";
import type {
  RoleEnvelopeDto,
  RoleListResultDto,
  ColumnOptionsResultDto,
} from "./dtos/role.dto";

const BASE = "/api/v1/rbac-core/roles";
const OPTIONS_PAGE_SIZE = 20;

export const toRolesListParams = (query: V2TableQuery) => ({
  page: query.page,
  pageSize: query.pageSize,
  search: query.search?.trim() || undefined,
  sorts: query.sorts.length
    ? query.sorts.map((s) =>
        s.direction === "desc" ? `-${s.columnKey}` : s.columnKey,
      )
    : undefined,
  column_filters: Object.keys(query.columnFilters).length
    ? JSON.stringify(query.columnFilters)
    : undefined,
  column_search: Object.keys(query.columnSearch).length
    ? JSON.stringify(query.columnSearch)
    : undefined,
  date_from: query.dateRanges?.createdAt?.from || undefined,
  date_to: query.dateRanges?.createdAt?.to || undefined,
});

export const rolesV2Api = {
  list: async (query: V2TableQuery) => {
    const { data } = await v2HttpClient.get<RoleListResultDto>(BASE, {
      params: toRolesListParams(query),
    });
    return data;
  },
  options: async (params: V2FetchOptionsParams) => {
    const { data } = await v2HttpClient.get<ColumnOptionsResultDto>(
      `${BASE}/column-options`,
      {
        params: {
          column: params.columnKey,
          search: params.search,
          page: params.pageParam,
          pageSize: OPTIONS_PAGE_SIZE,
          filters: params.filtersStr,
        },
      },
    );
    return data;
  },
  get: async (id: string): Promise<Role> => {
    try {
      const { data } = await v2HttpClient.get<RoleEnvelopeDto | Role>(
        `${BASE}/${id}`,
      );
      return ((data as RoleEnvelopeDto)?.data ?? data) as Role;
    } catch (err: any) {
      if (err?.response?.status === 404 || err?.status === 404) {
        const listData = await rolesV2Api.list({
          page: 1,
          pageSize: 100,
          sorts: [],
          columnFilters: {},
          columnSearch: {},
          columnOperators: {},
          dateRanges: {},
        });
        const match = listData.items.find((item) => item.id === id);
        if (match) {
          return {
            id: match.id,
            name: match.name,
            description: match.description,
            status: match.is_active ? "active" : "inactive",
            createdAt: match.createdAt
              ? new Date(match.createdAt).toISOString()
              : undefined,
          };
        }
      }
      throw err;
    }
  },
  create: async (form: RoleFormValue) => {
    const { data } = await v2HttpClient.post<RoleEnvelopeDto | Role>(BASE, {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
    });
    return ((data as RoleEnvelopeDto)?.data ?? data) as Role;
  },
  update: async (id: string, form: RoleFormValue) => {
    const { data } = await v2HttpClient.patch<RoleEnvelopeDto | Role>(
      `${BASE}/${id}`,
      {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
      },
    );
    return ((data as RoleEnvelopeDto)?.data ?? data) as Role;
  },
  remove: async (id: string) => {
    const { data } = await v2HttpClient.delete<RoleEnvelopeDto | Role>(
      `${BASE}/${id}`,
    );
    return ((data as RoleEnvelopeDto)?.data ?? data) as Role;
  },
  getResources: async () => {
    try {
      const { data } = await v2HttpClient.get<{
        resources: ResourceItem[];
      }>("/api/v1/rbac-core/collections");
      const list: ResourceItem[] =
        data?.resources ?? (Array.isArray(data) ? data : []);
      const filtered = list.filter(
        (r) => r && r.resource && r.resource !== "*",
      );
      if (filtered.length > 0) return filtered;
    } catch {
      // fallback if network fails
    }
    return FALLBACK_RESOURCES;
  },
  getPermissions: async (roleId: string) => {
    const { data } = await v2HttpClient.get<{ permissions: any[] }>(
      `${BASE}/${roleId}/permissions`,
    );
    return data.permissions ?? [];
  },
  savePermissions: async (
    roleId: string,
    permissions: { resource: string; action: string; conditions?: any }[],
  ) => {
    await v2HttpClient.patch(`${BASE}/${roleId}/permissions`, { permissions });
  },
  getUsers: async (roleId: string) => {
    const { data } = await v2HttpClient.get<{
      users: { id: string; email: string }[];
    }>(`${BASE}/${roleId}/users`);
    return data.users ?? [];
  },
  saveUsers: async (roleId: string, userIds: string[]) => {
    await v2HttpClient.patch(`${BASE}/${roleId}/users`, { userIds });
  },
  getAllUsers: async () => {
    try {
      const { data } = await v2HttpClient.get<any>("/api/v1/admin/users", {
        params: { pageSize: 1000 },
      });
      const list =
        data?.data ?? data?.items ?? (Array.isArray(data) ? data : []);
      return list.map((u: any) => ({
        id: u.id,
        display: u.email || u.id,
        roleName: u.employee?.fullName || null,
      }));
    } catch {
      return [];
    }
  },
};
