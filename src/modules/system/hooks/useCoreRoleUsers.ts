import { useState } from "react";
import {
  getCoreRoleUsersApi,
  updateCoreRoleUsersApi,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type CoreRoleUser,
} from "@/modules/system/api/rbacCoreApi";
import {
  usersAdminApi,
  type CoreUserAdmin,
} from "@/modules/system/api/usersCoreApi";

export interface SystemUserOption {
  id: string;
  display: string;
  roleName: string | null;
}

export type SelectableUser = SystemUserOption;

export function useCoreRoleUsers() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<SelectableUser[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadUsers(roleId: string) {
    setLoading(true);
    try {
      const [roleUsers, systemUsersRes] = await Promise.all([
        getCoreRoleUsersApi(roleId),
        usersAdminApi.list({ pageSize: 1000 }),
      ]);
      const roleUserIds = roleUsers.map((u) => u.id);
      setSelectedIds(roleUserIds);
      setAllUsers(
        systemUsersRes.data.map((u: CoreUserAdmin) => ({
          id: u.id,
          display: u.email,
          roleName: u.employee ? u.employee.fullName : null,
        })),
      );
    } finally {
      setLoading(false);
    }
  }

  async function prepareNew() {
    try {
      const systemUsers = await usersAdminApi.list({ pageSize: 1000 });
      setAllUsers(
        systemUsers.data.map((u: CoreUserAdmin) => ({
          id: u.id,
          display: u.email,
          roleName: u.employee ? u.employee.fullName : null,
        })),
      );
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
