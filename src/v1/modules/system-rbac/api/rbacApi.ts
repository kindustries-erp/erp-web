import axiosInstance from "@/core/api/axiosInstance";
import type { ListParams, PaginatedResponse } from "@/shared/types/pagination";
import type {
  Role,
  CreateRoleDto,
  UpdateRoleDto,
  Permission,
  PermissionEditorPayload,
  PermissionFieldDef,
  SavePermissionsDto,
} from "@/modules/system/types/rbac";

export interface RoleListParams extends ListParams {
  search?: string;
}

export async function getRolesApi(
  params?: RoleListParams,
): Promise<PaginatedResponse<Role>> {
  const { data } = await axiosInstance.get<Record<string, unknown>>(
    "/api/v1/rbac/roles",
    { params },
  );
  const total = (data.total as number) ?? 0;
  const ps = (data.pageSize as number) ?? params?.pageSize ?? 20;
  return {
    items: (data.items ?? data.data ?? []) as Role[],
    total,
    page: (data.page as number) ?? params?.page ?? 1,
    pageSize: ps,
    totalPages:
      (data.totalPages as number) ?? Math.max(Math.ceil(total / ps), 1),
  };
}

export async function createRoleApi(dto: CreateRoleDto): Promise<Role> {
  const { data } = await axiosInstance.post<Role>("/api/v1/rbac/roles", dto);
  return data;
}

export async function updateRoleApi(
  id: string,
  dto: UpdateRoleDto,
): Promise<Role> {
  const { data } = await axiosInstance.patch<Role>(
    `/api/v1/rbac/roles/${id}`,
    dto,
  );
  return data;
}

export async function deleteRoleApi(id: string): Promise<void> {
  await axiosInstance.delete(`/api/v1/rbac/roles/${id}`);
}

export interface RoleUser {
  id: string;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  role?: string | { id?: string; name?: string | null } | null;
}

export async function getRoleUsersApi(roleId: string): Promise<RoleUser[]> {
  const { data } = await axiosInstance.get<{ users: RoleUser[] }>(
    `/api/v1/rbac/roles/${roleId}/users`,
  );
  return data.users ?? [];
}

export async function updateRoleUsersApi(
  roleId: string,
  userIds: string[],
): Promise<void> {
  await axiosInstance.patch(`/api/v1/rbac/roles/${roleId}/users`, { userIds });
}

export interface SystemUserOption {
  id: string;
  display: string;
  roleName?: string | null;
}

function extractDirectusUserId(
  raw: UserItem["directus_user_id"],
): string | null {
  if (!raw) return null;
  if (typeof raw === "string") return raw;
  if (typeof raw.id === "string") return raw.id;
  if (typeof raw.user_id === "string") return raw.user_id;
  if (typeof raw.user === "string") return raw.user;
  if (
    raw.user &&
    typeof raw.user === "object" &&
    typeof raw.user.id === "string"
  ) {
    return raw.user.id;
  }
  return null;
}

function extractRoleName(raw: UserItem["directus_user_id"]): string | null {
  if (!raw || typeof raw === "string") return null;
  const role = raw.role;
  if (!role) return null;
  if (typeof role === "string") return role;
  return role.name ?? null;
}

export async function getSystemUsersApi(): Promise<SystemUserOption[]> {
  try {
    const { data } = await axiosInstance.get<Record<string, unknown>>(
      "/api/v1/employees",
      { params: { pageSize: 500 } },
    );
    const payload = (data.items ?? data.data ?? data) as
      | UserItem[]
      | { items?: UserItem[]; data?: UserItem[] };
    const list = Array.isArray(payload)
      ? payload
      : ((payload.items ?? payload.data ?? []) as UserItem[]);
    const seen = new Set<string>();
    const result: SystemUserOption[] = [];
    for (const u of list) {
      const directusId = extractDirectusUserId(u.directus_user_id);
      const id = directusId ?? u.id;
      if (!id || seen.has(id)) continue;
      seen.add(id);
      const display =
        u.email ||
        u.full_name ||
        [u.first_name, u.last_name].filter(Boolean).join(" ") ||
        id;
      result.push({
        id,
        display,
        roleName: extractRoleName(u.directus_user_id),
      });
    }
    return result;
  } catch {
    return [];
  }
}

export async function getRolePermissionsApi(
  roleId: string,
): Promise<Permission[]> {
  const { data } = await axiosInstance.get<{ permissions: Permission[] }>(
    `/api/v1/rbac/roles/${roleId}/permissions`,
  );
  return data.permissions ?? [];
}

export async function saveRolePermissionsApi(
  roleId: string,
  dto: SavePermissionsDto,
): Promise<void> {
  await axiosInstance.patch(`/api/v1/rbac/roles/${roleId}/permissions`, dto);
}

export async function getPermissionByIdApi(
  permissionId: string,
): Promise<Permission> {
  const { data } = await axiosInstance.get<Permission>(
    `/api/v1/rbac/permissions/${permissionId}`,
  );
  return data;
}

export async function getPermissionEditorApi(
  permissionId: string,
): Promise<PermissionEditorPayload> {
  const { data } = await axiosInstance.get<PermissionEditorPayload>(
    `/api/v1/rbac/permissions/${permissionId}/editor`,
  );
  return {
    permission: data.permission,
    availableFields: data.availableFields ?? [],
    isAllFields: data.isAllFields === true,
  };
}

export async function createPermissionApi(
  dto: Permission,
): Promise<Permission> {
  const { data } = await axiosInstance.post<Permission>(
    "/api/v1/rbac/permissions",
    dto,
  );
  return data;
}

export async function updatePermissionApi(
  permissionId: string,
  dto: Partial<Permission>,
): Promise<Permission> {
  const { data } = await axiosInstance.patch<Permission>(
    `/api/v1/rbac/permissions/${permissionId}`,
    dto,
  );
  return data;
}

export async function deletePermissionApi(permissionId: string): Promise<void> {
  await axiosInstance.delete(`/api/v1/rbac/permissions/${permissionId}`);
}

export async function getCollectionFieldsApi(
  collection: string,
): Promise<PermissionFieldDef[]> {
  const { data } = await axiosInstance.get<
    { fields?: PermissionFieldDef[] } | PermissionFieldDef[]
  >(`/api/v1/rbac/collections/${collection}/fields`);
  if (Array.isArray(data)) return data;
  return data.fields ?? [];
}

/** Returns custom policy permissions for an employee (by employee record ID). */
export async function getEmployeePermissionsApi(
  employeeId: string,
): Promise<Permission[]> {
  try {
    const { data } = await axiosInstance.get<{ permissions: Permission[] }>(
      `/api/v1/employees/${employeeId}/permissions`,
    );
    return data.permissions ?? [];
  } catch {
    return [];
  }
}

/** Saves custom policy permissions for an employee. */
export async function saveEmployeePermissionsApi(
  employeeId: string,
  dto: SavePermissionsDto,
): Promise<void> {
  await axiosInstance.patch(`/api/v1/employees/${employeeId}/permissions`, dto);
}

/** Returns role IDs currently assigned to a Directus user. Tries multiple endpoint patterns. */
export async function getUserRolesApi(
  directusUserId: string,
): Promise<string[]> {
  // Pattern 1: dedicated endpoint (BE needs to implement)
  try {
    const { data } = await axiosInstance.get<Record<string, unknown>>(
      `/api/v1/rbac/users/${directusUserId}/roles`,
    );
    const raw = data.role_ids ?? data.roles ?? data.role;
    if (raw) {
      if (Array.isArray(raw)) return raw as string[];
      if (typeof raw === "string") return [raw];
    }
  } catch {
    // Try next pattern
  }

  // Pattern 2: GET single user info which may include role field
  try {
    const { data } = await axiosInstance.get<Record<string, unknown>>(
      `/api/v1/rbac/users/${directusUserId}`,
    );
    const raw = data.role_ids ?? data.roles ?? data.role;
    if (raw) {
      if (Array.isArray(raw)) return raw as string[];
      if (typeof raw === "string") return [raw];
    }
  } catch {
    // No endpoint available
  }

  return [];
}

/** Replaces the full set of roles for a Directus user */
export async function updateUserRolesApi(
  directusUserId: string,
  roleIds: string[],
): Promise<void> {
  await axiosInstance.patch(`/api/v1/rbac/users/${directusUserId}/roles`, {
    role_ids: roleIds,
  });
}

interface UserItem {
  id: string;
  directus_user_id?:
    | string
    | {
        id?: string;
        user_id?: string;
        user?: string | { id?: string };
        role?: string | { id?: string; name?: string | null; users?: string[] };
      }
    | null;
  full_name?: string | null;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
}

/** Returns id → email (or display name) for all users */
export async function getUserEmailsMapApi(): Promise<Record<string, string>> {
  try {
    const { data } = await axiosInstance.get<Record<string, unknown>>(
      "/api/v1/employees",
      { params: { pageSize: 500 } },
    );
    const payload = (data.items ?? data.data ?? data) as
      | UserItem[]
      | { items?: UserItem[]; data?: UserItem[] };
    const list = Array.isArray(payload)
      ? payload
      : ((payload.items ?? payload.data ?? []) as UserItem[]);
    const map: Record<string, string> = {};
    for (const u of list) {
      const value =
        u.email ||
        u.full_name ||
        [u.first_name, u.last_name].filter(Boolean).join(" ") ||
        u.id;
      const directusId = extractDirectusUserId(u.directus_user_id);
      const directusKeys = directusId ? [directusId] : [];
      const keys = [...directusKeys, u.id].filter(Boolean);
      for (const key of keys) {
        map[key] = value;
      }
    }
    return map;
  } catch {
    return {};
  }
}
