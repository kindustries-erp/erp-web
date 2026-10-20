import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { garageCashflowApi } from "../../../api/garageCashflowApi";
import type { GarageCashflowVoucher } from "../../../api/garageCashflowApi";
import { useGarageCashflowMutations } from "./GarageCashflowTable.mutations";

export const getDefaultPageSize = (): number => {
  if (typeof window !== "undefined" && window.innerHeight >= 900) {
    return 50;
  }
  return 20;
};

export function useGarageCashflowTable() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(getDefaultPageSize);
  const [sorts, setSorts] = useState<string[]>([]);
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>(
    {},
  );
  const [columnSearch, setColumnSearch] = useState<Record<string, string>>({});
  const [dateRanges, setDateRanges] = useState<
    Record<string, { from?: string; to?: string }>
  >({});

  const serverFilters = useMemo(() => {
    const combined: Record<string, string[]> = { ...columnFilters };
    Object.entries(dateRanges).forEach(([key, range]) => {
      if (range?.from || range?.to) {
        combined[key] = [`${range.from || ""}..${range.to || ""}`];
      }
    });
    return combined;
  }, [columnFilters, dateRanges]);

  const queryKey = [
    "garage-cashflow-list",
    page,
    pageSize,
    sorts,
    serverFilters,
    columnSearch,
  ];

  const { data, isLoading, refetch } = useQuery({
    queryKey,
    queryFn: () =>
      garageCashflowApi.getList({
        page,
        pageSize,
        sorts: sorts && sorts.length > 0 ? sorts.join(",") : undefined,
        column_filters: Object.keys(serverFilters).length
          ? JSON.stringify(serverFilters)
          : undefined,
        column_search: Object.keys(columnSearch).length
          ? JSON.stringify(columnSearch)
          : undefined,
      }),
  });

  const { createMutation, updateMutation, deleteMutation } =
    useGarageCashflowMutations();

  const setSort = (key: string, state: "asc" | "desc" | "none") => {
    setSorts((prev) => {
      const filtered = prev.filter((s) => s !== key && s !== `-${key}`);
      if (state === "asc") return [...filtered, key];
      if (state === "desc") return [...filtered, `-${key}`];
      return filtered;
    });
    setPage(1);
  };

  const toggleSort = (field: string) => {
    setSorts((prev) => {
      const next = [...prev];
      const ascIdx = next.indexOf(field);
      const descIdx = next.indexOf(`-${field}`);
      if (ascIdx >= 0) {
        next[ascIdx] = `-${field}`;
      } else if (descIdx >= 0) {
        next.splice(descIdx, 1);
      } else {
        next.push(field);
      }
      return next;
    });
    setPage(1);
  };

  const setColumnFilter = (key: string, vals: string[]) => {
    setColumnFilters((prev) => ({ ...prev, [key]: vals }));
    setPage(1);
  };

  const setColumnSearchVal = (key: string, val: string) => {
    setColumnSearch((prev) => ({ ...prev, [key]: val }));
    setPage(1);
  };

  const setDateRange = (key: string, from?: string, to?: string) => {
    setDateRanges((prev) => ({
      ...prev,
      [key]: { from: from || "", to: to || "" },
    }));
    setPage(1);
  };

  const getDateRange = (key: string) => dateRanges[key] || { from: "", to: "" };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    Object.values(columnFilters).forEach((vals) => {
      if (vals && vals.length > 0) count += 1;
    });
    Object.values(columnSearch).forEach((val) => {
      if (val && val.trim().length > 0) count += 1;
    });
    Object.values(dateRanges).forEach((range) => {
      if (range?.from || range?.to) count += 1;
    });
    return count;
  }, [columnFilters, columnSearch, dateRanges]);

  const clearAllFilters = () => {
    setColumnFilters({});
    setColumnSearch({});
    setDateRanges({});
    setPage(1);
  };

  const getColumnOptions = async ({
    columnKey,
    search,
    pageParam,
    pageSize: reqPageSize = 20,
  }: {
    columnKey: string;
    search?: string;
    pageParam?: number;
    pageSize?: number;
  }) => {
    const filtersWithoutCurrent = { ...serverFilters };
    delete filtersWithoutCurrent[columnKey];
    const res = await garageCashflowApi.getOptions(
      columnKey,
      search || "",
      pageParam || 1,
      reqPageSize,
      Object.keys(filtersWithoutCurrent).length
        ? JSON.stringify(filtersWithoutCurrent)
        : undefined,
    );
    return {
      items: res.items.map((i: string) => ({ label: i, value: i })),
      total: res.total,
      next: (pageParam || 1) < res.totalPages ? (pageParam || 1) + 1 : null,
    };
  };

  return {
    data: (data?.data ?? []) as GarageCashflowVoucher[],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 0,
    totals: data?.totals,
    isLoading,
    page,
    setPage,
    pageSize,
    setPageSize,
    sorts,
    setSort,
    toggleSort,
    columnFilters,
    setColumnFilter,
    columnSearch,
    setColumnSearch: setColumnSearchVal,
    dateRanges,
    setDateRange,
    getDateRange,
    serverFilters,
    activeFilterCount,
    clearAllFilters,
    refetch,
    getColumnOptions,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
