import { useState, useCallback } from "react";
import {
  getRolesApi,
  createRoleApi,
  updateRoleApi,
  deleteRoleApi,
  getUserEmailsMapApi,
} from "@/modules/system/api/rbacApi";
import type {
  Role,
  CreateRoleDto,
  UpdateRoleDto,
} from "@/modules/system/types/rbac";
import { extractApiError } from "@/shared/utils/apiError";

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (opts?: { page?: number; pageSize?: number; search?: string }) => {
      const pg = opts?.page ?? page;
      const ps = opts?.pageSize ?? pageSize;
      const q = opts?.search ?? search;
      setLoading(true);
      setError(null);
      try {
        const [res, emailMap] = await Promise.all([
          getRolesApi({ page: pg, pageSize: ps, search: q || undefined }),
          getUserEmailsMapApi(),
        ]);
        setRoles(res.items);
        setTotal(res.total);
        setTotalPages(res.totalPages);
        setUsersMap(emailMap);
      } catch (e) {
        setError(extractApiError(e, "Không thể tải danh sách vai trò."));
      } finally {
        setLoading(false);
      }
    },
    [page, pageSize, search],
  );

  function handleSearch(q: string) {
    setSearch(q);
    setPage(1);
    load({ page: 1, search: q });
  }

  function handlePage(pg: number) {
    setPage(pg);
    load({ page: pg });
  }

  function handlePageSize(ps: number) {
    setPageSize(ps);
    setPage(1);
    load({ page: 1, pageSize: ps });
  }

  async function createRole(dto: CreateRoleDto): Promise<Role | null> {
    try {
      const role = await createRoleApi(dto);
      await load();
      return role;
    } catch (e) {
      throw new Error(extractApiError(e, "Tạo vai trò thất bại."));
    }
  }

  async function updateRole(
    id: string,
    dto: UpdateRoleDto,
  ): Promise<Role | null> {
    try {
      const role = await updateRoleApi(id, dto);
      setRoles((prev) => prev.map((r) => (r.id === id ? role : r)));
      return role;
    } catch (e) {
      throw new Error(extractApiError(e, "Cập nhật vai trò thất bại."));
    }
  }

  async function deleteRole(id: string): Promise<void> {
    try {
      await deleteRoleApi(id);
      await load();
    } catch (e) {
      throw new Error(extractApiError(e, "Xóa vai trò thất bại."));
    }
  }

  return {
    roles,
    usersMap,
    loading,
    error,
    total,
    totalPages,
    page,
    pageSize,
    search,
    load,
    handleSearch,
    handlePage,
    handlePageSize,
    createRole,
    updateRole,
    deleteRole,
  };
}
