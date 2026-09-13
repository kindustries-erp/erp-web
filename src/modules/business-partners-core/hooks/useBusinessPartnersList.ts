import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  businessPartnersCoreApi,
  type ErpBusinessPartner,
} from "../api/businessPartnersCoreApi";

export const getDefaultPageSize = (): number => {
  if (typeof window !== "undefined" && window.innerHeight >= 900) {
    return 50;
  }
  return 20;
};

export interface UseBusinessPartnersListOptions {
  partnerType: "CUSTOMER" | "VENDOR" | string;
}

export function useBusinessPartnersList({
  partnerType,
}: UseBusinessPartnersListOptions) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(getDefaultPageSize);
  const [search, setSearch] = useState("");
  const [sorts, setSorts] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>(
    {},
  );
  const [columnSearch, setColumnSearch] = useState<Record<string, string>>({});

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [
      "business-partners-list",
      partnerType,
      page,
      pageSize,
      search,
      sorts,
      dateFrom,
      dateTo,
      columnFilters,
      columnSearch,
    ],
    queryFn: () => {
      return businessPartnersCoreApi.list({
        page,
        pageSize,
        search: search || undefined,
        partnerType,
        sort: sorts.length ? sorts.join(",") : undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        column_filters: Object.keys(columnFilters).length
          ? JSON.stringify(columnFilters)
          : undefined,
        column_search: Object.keys(columnSearch).length
          ? JSON.stringify(columnSearch)
          : undefined,
      });
    },
    staleTime: 1000 * 30,
  });

  const setSort = useCallback((key: string, state: "asc" | "desc" | "none") => {
    setSorts(() => {
      if (state === "none") return [];
      const isDesc = state === "desc";
      return [isDesc ? `-${key}` : key];
    });
    setPage(1);
  }, []);

  const setColumnFilter = useCallback((key: string, vals: string[]) => {
    setColumnFilters((prev) => {
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

  const setColumnSearchValue = useCallback((key: string, val: string) => {
    setColumnSearch((prev) => {
      const next = { ...prev };
      if (!val || !val.trim()) {
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
      if (vals && vals.length > 0) count += 1;
    });
    Object.values(columnSearch).forEach((val) => {
      if (val && val.trim().length > 0) count += 1;
    });
    if (dateFrom || dateTo) count += 1;
    if (search.trim().length > 0) count += 1;
    return count;
  }, [columnFilters, columnSearch, dateFrom, dateTo, search]);

  const clearAllFilters = useCallback(() => {
    setColumnFilters({});
    setColumnSearch({});
    setDateFrom("");
    setDateTo("");
    setSearch("");
    setSorts([]);
    setPage(1);
  }, []);

  return {
    items: data?.items ?? ([] as ErpBusinessPartner[]),
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 0,
    page,
    setPage,
    pageSize,
    setPageSize,
    search,
    setSearch,
    sorts,
    setSort,
    dateFrom,
    dateTo,
    setDateRange,
    columnFilters,
    setColumnFilter,
    columnSearch,
    setColumnSearch: setColumnSearchValue,
    activeFilterCount,
    clearAllFilters,
    isLoading,
    isFetching,
    refetch,
  };
}
