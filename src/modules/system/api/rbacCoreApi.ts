import axiosInstance from "@/core/api/axiosInstance";
import type { ListParams, PaginatedResponse } from "@/shared/types/pagination";
import type {
  Role,
  CreateRoleDto,
  UpdateRoleDto,
} from "@/modules/system/types/rbac";

export interface CorePermission {
  id?: string;
  roleId?: string;
  resource: string;
  action: string;

  conditions?: any;
}

export interface RoleListParams extends ListParams {
  search?: string;
  sorts?: string[];
  column_filters?: string;
  column_search?: string;
  date_from?: string;
  date_to?: string;
}

export async function getCoreRolesApi(
  params?: RoleListParams,
): Promise<PaginatedResponse<Role>> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set("page", String(params.page));
  if (params?.pageSize) queryParams.set("pageSize", String(params.pageSize));
  if (params?.search) queryParams.set("search", params.search);
  if (params?.date_from) queryParams.set("date_from", params.date_from);
  if (params?.date_to) queryParams.set("date_to", params.date_to);
  if (params?.column_filters)
    queryParams.set("column_filters", params.column_filters);
  if (params?.column_search)
    queryParams.set("column_search", params.column_search);
  if (params?.sorts && params.sorts.length) {
    params.sorts.forEach((s) => queryParams.append("sorts", s));
  }

  const { data } = await axiosInstance.get(
    `/api/v1/rbac-core/roles?${queryParams.toString()}`,
  );
  return data;
}

export async function getCoreRolesColumnOptionsApi(
  columnKey: string,
  search: string = "",
  pageParam: number = 1,
  pageSize: number = 20,
  filtersStr?: string,
): Promise<{
  items: { label: string; value: string }[];
  total: number;
  next: number | null;
}> {
  const params = new URLSearchParams();
  params.set("column", columnKey);
  if (search) params.set("search", search);
  params.set("page", String(pageParam));
  params.set("pageSize", String(pageSize));
  if (filtersStr) params.set("filters", filtersStr);

  const { data } = await axiosInstance.get(
    `/api/v1/rbac-core/roles/column-options?${params.toString()}`,
  );
  return data;
}

export async function createCoreRoleApi(dto: CreateRoleDto): Promise<Role> {
  const { data } = await axiosInstance.post("/api/v1/rbac-core/roles", dto);
  return data;
}

export async function updateCoreRoleApi(
  id: string,
  dto: UpdateRoleDto,
): Promise<Role> {
  const { data } = await axiosInstance.patch(
    `/api/v1/rbac-core/roles/${id}`,
    dto,
  );
  return data;
}

export async function deleteCoreRoleApi(id: string): Promise<void> {
  await axiosInstance.delete(`/api/v1/rbac-core/roles/${id}`);
}

export async function getCoreRolePermissionsApi(
  roleId: string,
): Promise<CorePermission[]> {
  const { data } = await axiosInstance.get<{ permissions: CorePermission[] }>(
    `/api/v1/rbac-core/roles/${roleId}/permissions`,
  );
  return data.permissions ?? [];
}

export async function saveCoreRolePermissionsApi(
  roleId: string,

  permissions: { resource: string; action: string; conditions?: any }[],
): Promise<void> {
  await axiosInstance.patch(`/api/v1/rbac-core/roles/${roleId}/permissions`, {
    permissions,
  });
}

export interface CoreRoleUser {
  id: string;
  email: string;
}

export async function getCoreRoleUsersApi(
  roleId: string,
): Promise<CoreRoleUser[]> {
  const { data } = await axiosInstance.get<{ users: CoreRoleUser[] }>(
    `/api/v1/rbac-core/roles/${roleId}/users`,
  );
  return data.users ?? [];
}

export async function updateCoreRoleUsersApi(
  roleId: string,
  userIds: string[],
): Promise<void> {
  await axiosInstance.patch(`/api/v1/rbac-core/roles/${roleId}/users`, {
    userIds,
  });
}

export async function getCoreAvailableResourcesApi(): Promise<
  { resource: string; label: string }[]
> {
  const { data } = await axiosInstance.get<{
    resources: { resource: string; label: string }[];
  }>("/api/v1/rbac-core/collections");
  return data.resources ?? [];
}
