import type { V2TableQuery } from "@/v2/shared/types/v2-table";

export const rolesKeys = {
  all: ["v2-rbac-roles"] as const,
  list: (query: V2TableQuery) => [...rolesKeys.all, "list", query] as const,
  detail: (id: string) => [...rolesKeys.all, "detail", id] as const,
  resources: () => [...rolesKeys.all, "resources"] as const,
  permissions: (roleId: string) =>
    [...rolesKeys.all, "permissions", roleId] as const,
  users: (roleId: string) => [...rolesKeys.all, "users", roleId] as const,
  allUsers: () => [...rolesKeys.all, "allUsers"] as const,
};
