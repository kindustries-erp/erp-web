import { useState } from "react";
import {
  getRoleUsersApi,
  updateRoleUsersApi,
  getSystemUsersApi,
  type RoleUser,
  type SystemUserOption,
} from "@/modules/system/api/rbacApi";

export type SelectableUser = SystemUserOption;

function userToSelectable(u: RoleUser): SelectableUser {
  const roleName =
    typeof u.role === "object" && u.role ? (u.role.name ?? null) : null;
  return {
    id: u.id,
    display:
      u.email || [u.first_name, u.last_name].filter(Boolean).join(" ") || u.id,
    roleName,
  };
}

function userKey(u: SelectableUser): string {
  return u.display.trim().toLowerCase();
}

function mergeUserOptions(
  systemUsers: SelectableUser[],
  roleUsers: RoleUser[],
): { users: SelectableUser[]; selectedIds: string[] } {
  const roleOptions = roleUsers.map(userToSelectable);
  const roleByKey = new Map(roleOptions.map((u) => [userKey(u), u]));
  const usedRoleKeys = new Set<string>();
  const merged: SelectableUser[] = [];

  for (const systemUser of systemUsers) {
    const key = userKey(systemUser);
    const roleUser = roleByKey.get(key);
    if (roleUser) {
      usedRoleKeys.add(key);
      merged.push({
        ...systemUser,
        id: roleUser.id,
        roleName: systemUser.roleName ?? roleUser.roleName,
      });
    } else {
      merged.push(systemUser);
    }
  }

  for (const roleUser of roleOptions) {
    const key = userKey(roleUser);
    if (!usedRoleKeys.has(key) && !merged.some((u) => u.id === roleUser.id)) {
      merged.push(roleUser);
    }
  }

  return {
    users: merged,
    selectedIds: roleOptions.map((u) => u.id),
  };
}

export function useRoleUsers() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<SelectableUser[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadUsers(roleId: string) {
    setLoading(true);
    try {
      const [roleUsers, systemUsers] = await Promise.all([
        getRoleUsersApi(roleId),
        getSystemUsersApi(),
      ]);
      const merged = mergeUserOptions(systemUsers, roleUsers);
      setSelectedIds(merged.selectedIds);
      setAllUsers(merged.users);
    } finally {
      setLoading(false);
    }
  }

  async function prepareNew() {
    try {
      const systemUsers = await getSystemUsersApi();
      setAllUsers(systemUsers);
    } catch {
      // ignore — list will be empty
    }
    setSelectedIds([]);
  }

  function reset() {
    setSelectedIds([]);
    setAllUsers([]);
  }

  async function save(roleId: string): Promise<void> {
    await updateRoleUsersApi(roleId, selectedIds);
  }

  return {
    selectedIds,
    setSelectedIds,
    allUsers,
    loading,
    loadUsers,
    prepareNew,
    reset,
    save,
  };
}
