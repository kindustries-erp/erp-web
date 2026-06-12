import { useState } from "react";
import {
  getCoreRoleUsersApi,
  updateCoreRoleUsersApi,
  type CoreRoleUser,
} from "@/modules/system/api/rbacCoreApi";
import {
  getSystemUsersApi,
  type SystemUserOption,
} from "@/modules/system/api/rbacApi";

export type SelectableUser = SystemUserOption;

export function useCoreRoleUsers() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<SelectableUser[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadUsers(roleId: string) {
    setLoading(true);
    try {
      const [roleUsers, systemUsers] = await Promise.all([
        getCoreRoleUsersApi(roleId),
        getSystemUsersApi(),
      ]);
      const roleUserIds = roleUsers.map((u) => u.id);
      setSelectedIds(roleUserIds);
      setAllUsers(systemUsers);
    } finally {
      setLoading(false);
    }
  }

  async function prepareNew() {
    try {
      const systemUsers = await getSystemUsersApi();
      setAllUsers(systemUsers);
    } catch {
      // ignore
    }
    setSelectedIds([]);
  }

  function reset() {
    setSelectedIds([]);
    setAllUsers([]);
  }

  async function save(roleId: string): Promise<void> {
    await updateCoreRoleUsersApi(roleId, selectedIds);
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
