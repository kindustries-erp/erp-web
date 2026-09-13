import { useState, useCallback, useMemo } from "react";
import {
  getCoreRolesApi,
  createCoreRoleApi,
  updateCoreRoleApi,
  deleteCoreRoleApi,
} from "@/modules/system/api/rbacCoreApi";
import type {
  Role,
  CreateRoleDto,
  UpdateRoleDto,
} from "@/modules/system/types/rbac";
import { extractApiError } from "@/shared/utils/apiError";

import { clearAllDropdownSearchStates } from "@/shared/components/DataTable";

export const getDefaultPageSize = (): number => {
  if (typeof window !== "undefined" && window.innerHeight >= 900) {
    return 50;
  }
  return 20;
};

export function useCoreRoles(extraParams?: {
  search?: string;
  status?: string;
}) {
  // Destructure sang primitives để tránh object reference mới mỗi render gây infinite loop
  const extraSearch = extraParams?.search;
  const extraStatus = extraParams?.status;

  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(getDefaultPageSize);
  const [sorts, setSorts] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [columnFilters, setColumnFiltersState] = useState<
    Record<string, string[]>
  >({});
  const [columnSearch, setColumnSearchState] = useState<Record<string, string>>(
    {},
  );
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCoreRolesApi({
        page,
        pageSize,
        sorts,
        search: extraSearch || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        column_filters:
          Object.keys(columnFilters).length > 0
            ? JSON.stringify(columnFilters)
            : undefined,
        column_search:
          Object.keys(columnSearch).length > 0
            ? JSON.stringify(columnSearch)
            : undefined,
      });
      let items = res.items;
      if (extraStatus) {
        const isAct = extraStatus === "true";
        items = items.filter(
          (r) => r.is_active === isAct || r.isActive === isAct,
        );
      }
      setRoles(items);
      setTotal(extraStatus ? items.length : res.total);
      setTotalPages(res.totalPages || Math.ceil(res.total / pageSize) || 1);
    } catch (e) {
      setError(extractApiError(e, "Không thể tải danh sách vai trò."));
    } finally {
      setLoading(false);
    }
  }, [
    page,
    pageSize,
    sorts,
    dateFrom,
    dateTo,
    columnFilters,
    columnSearch,
    extraSearch,
    extraStatus,
  ]);

  const setSort = useCallback((key: string, state: "asc" | "desc" | "none") => {
    setSorts((prev) => {
      const filtered = prev.filter((s) => s !== key && s !== `-${key}`);
      if (state === "asc") return [...filtered, key];
      if (state === "desc") return [...filtered, `-${key}`];
      return filtered;
    });
    setPage(1);
  }, []);

  const setColumnFilter = useCallback((key: string, vals: string[]) => {
    setColumnFiltersState((prev) => {
      const next = { ...prev };
      if (!vals || vals.length === 0) {
        delete next[key];
      } else {
        next[key] = vals;
      }
      return next;
    });
    setPage(1);
  }, []);

  const setColumnSearch = useCallback((key: string, val: string) => {
    setColumnSearchState((prev) => {
      const next = { ...prev };
      if (!val || val.trim() === "") {
        delete next[key];
      } else {
        next[key] = val;
      }
      return next;
    });
    setPage(1);
  }, []);

  const setDateRange = useCallback((from?: string, to?: string) => {
    setDateFrom(from || "");
    setDateTo(to || "");
    setPage(1);
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    Object.values(columnFilters).forEach((vals) => {
      if (vals && vals.length > 0) {
        count += 1;
      }
    });
    Object.values(columnSearch).forEach((val) => {
      if (val && val.trim().length > 0) count += 1;
    });
    if (dateFrom || dateTo) count += 1;
    return count;
  }, [columnFilters, columnSearch, dateFrom, dateTo]);

  const clearAllFilters = useCallback(() => {
    setColumnFiltersState({});
    setColumnSearchState({});
    setDateFrom("");
    setDateTo("");
    setSorts([]);
    setPage(1);
    clearAllDropdownSearchStates();
  }, []);

  async function createRole(dto: CreateRoleDto): Promise<Role | null> {
    try {
      const role = await createCoreRoleApi(dto);
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
      const role = await updateCoreRoleApi(id, dto);
      setRoles((prev) => prev.map((r) => (r.id === id ? role : r)));
      return role;
    } catch (e) {
      throw new Error(extractApiError(e, "Cập nhật vai trò thất bại."));
    }
  }

  async function deleteRole(id: string): Promise<void> {
    try {
      await deleteCoreRoleApi(id);
      await load();
    } catch (e) {
      throw new Error(extractApiError(e, "Xóa vai trò thất bại."));
    }
  }

  return {
    roles,
    loading,
    error,
    total,
    totalPages,
    page,
    setPage,
    pageSize,
    setPageSize,
    sorts,
    setSort,
    dateFrom,
    dateTo,
    setDateRange,
    columnFilters,
    setColumnFilter,
    columnSearch,
    setColumnSearch,
    activeFilterCount,
    clearAllFilters,
    load,
    createRole,
    updateRole,
    deleteRole,
  };
}
