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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  conditions?: any;
}

export interface RoleListParams extends ListParams {
  search?: string;
}

export async function getCoreRolesApi(
  params?: RoleListParams,
): Promise<PaginatedResponse<Role>> {
  const { data } = await axiosInstance.get("/api/v1/rbac-core/roles", {
    params,
  });
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
