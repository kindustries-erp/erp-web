import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  accountingApi,
  type ChartOfAccountItem,
} from "@/modules/accounting/api/accountingApi";

export function useAccountsList() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sorts, setSorts] = useState<string[]>([]);
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>(
    {},
  );
  const [columnSearch, setColumnSearchMap] = useState<Record<string, string>>(
    {},
  );

  const queryParams = useMemo(() => {
    const params: Record<string, any> = {
      page,
      pageSize,
    };

    if (sorts.length > 0) {
      params.sort = sorts.join(",");
    }

    // Individual column search
    if (columnSearch.accountCode?.trim()) {
      params.accountCodeSearch = columnSearch.accountCode.trim();
    }
    if (columnSearch.accountName?.trim()) {
      params.accountNameSearch = columnSearch.accountName.trim();
    }
    if (columnSearch.parentAccount?.trim()) {
      params.parentAccountSearch = columnSearch.parentAccount.trim();
    }
    if (columnSearch.search?.trim()) {
      params.search = columnSearch.search.trim();
    }

    // Column checkbox filters
    if (columnFilters.accountCode && columnFilters.accountCode.length > 0) {
      params.accountCode = columnFilters.accountCode.join(",");
    }
    if (columnFilters.accountName && columnFilters.accountName.length > 0) {
      params.accountName = columnFilters.accountName.join(",");
    }
    if (columnFilters.parentAccount && columnFilters.parentAccount.length > 0) {
      params.parentAccount = columnFilters.parentAccount.join(",");
    }

    // Account Type filter
    if (columnFilters.accountType && columnFilters.accountType.length > 0) {
      params.accountType = columnFilters.accountType.join(",");
    }

    // Active status filter
    if (columnFilters.isActive && columnFilters.isActive.length > 0) {
      if (columnFilters.isActive.length === 1) {
        params.isActive = columnFilters.isActive[0] === "true";
      }
    }

    return params;
  }, [page, pageSize, sorts, columnFilters, columnSearch]);

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["chart-of-accounts", queryParams],
    queryFn: () => accountingApi.getChartOfAccounts(queryParams),
    placeholderData: (previousData) => previousData,
  });

  const items: ChartOfAccountItem[] = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    return data.items || data.data || [];
  }, [data]);

  const total = useMemo(() => {
    if (!data) return 0;
    if (typeof data.total === "number") return data.total;
    if (Array.isArray(data)) return data.length;
    return 0;
  }, [data]);

  const totalPages = useMemo(() => {
    if (!data) return 1;
    if (typeof data.totalPages === "number") return data.totalPages;
    return Math.ceil(total / pageSize) || 1;
  }, [data, total, pageSize]);

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
    setColumnFilters((prev) => ({ ...prev, [key]: vals }));
    setPage(1);
  }, []);

  const setColumnSearch = useCallback((key: string, val: string) => {
    setColumnSearchMap((prev) => ({ ...prev, [key]: val }));
    setPage(1);
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    Object.values(columnFilters).forEach((vals) => {
      if (vals && vals.length > 0) count += 1;
    });
    Object.values(columnSearch).forEach((val) => {
      if (val && val.trim().length > 0) count += 1;
    });
    return count;
  }, [columnFilters, columnSearch]);

  const clearAllFilters = useCallback(() => {
    setColumnFilters({});
    setColumnSearchMap({});
    setPage(1);
  }, []);

  return {
    data: items,
    total,
    totalPages,
    isLoading: isLoading || isFetching,
    error: error instanceof Error ? error.message : null,
    page,
    setPage,
    pageSize,
    setPageSize,
    sorts,
    setSort,
    columnFilters,
    setColumnFilter,
    columnSearch,
    setColumnSearch,
    activeFilterCount,
    clearAllFilters,
    refetch,
  };
}
