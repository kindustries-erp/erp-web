import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { usersAdminApi, type CoreUserAdmin } from "../api/usersCoreApi";

import { clearAllDropdownSearchStates } from "@/shared/components/DataTable";

export const getDefaultPageSize = (): number => {
  if (typeof window !== "undefined" && window.innerHeight >= 900) {
    return 50;
  }
  return 20;
};

export function useUsersAdminList(extraParams?: {
  search?: string;
  status?: string;
}) {
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

  const queryKey = useMemo(
    () => [
      "users-admin-list",
      page,
      pageSize,
      sorts,
      dateFrom,
      dateTo,
      columnFilters,
      columnSearch,
      extraParams?.search,
      extraParams?.status,
    ],
    [
      page,
      pageSize,
      sorts,
      dateFrom,
      dateTo,
      columnFilters,
      columnSearch,
      extraParams?.search,
      extraParams?.status,
    ],
  );

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey,
    queryFn: () =>
      usersAdminApi.list({
        page,
        pageSize,
        sorts,
        search: extraParams?.search || undefined,
        status: extraParams?.status || undefined,
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
      }),
  });

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
        if (vals[0] === "__ALL_MATCHING__") {
          count += 1;
        } else {
          count += vals.length;
        }
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

  return {
    data: (data?.data ?? []) as CoreUserAdmin[],
    total: data?.total ?? 0,
    totalPages: Math.ceil((data?.total ?? 0) / pageSize) || 1,
    isLoading: isLoading || isFetching,
    error,
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
    refetch,
  };
}
