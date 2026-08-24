import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  garageOpexApi,
  type GarageOpexItem,
} from "@/modules/garage/api/garageOpexApi";

export const getDefaultPageSize = (): number => {
  if (typeof window !== "undefined" && window.innerHeight >= 900) {
    return 50;
  }
  return 20;
};

export function useGarageOpexList() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(getDefaultPageSize);
  const [sorts, setSorts] = useState<string[]>([]);
  const [year, setYear] = useState<number | undefined>(undefined);
  const [month, setMonth] = useState<number | undefined>(undefined);
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>(
    {},
  );
  const [columnSearch, setColumnSearch] = useState<Record<string, string>>({});

  const { data, isLoading, refetch } = useQuery({
    queryKey: [
      "garage-opex-list",
      page,
      pageSize,
      sorts,
      year,
      month,
      columnFilters,
      columnSearch,
    ],
    queryFn: () =>
      garageOpexApi.getList({
        page,
        pageSize,
        sorts,
        year,
        month,
        column_filters: Object.keys(columnFilters).length
          ? JSON.stringify(columnFilters)
          : undefined,
        column_search: Object.keys(columnSearch).length
          ? JSON.stringify(columnSearch)
          : undefined,
      }),
  });

  const setSort = (key: string, state: "asc" | "desc" | "none") => {
    setSorts((prev) => {
      const filtered = prev.filter((s) => s !== key && s !== `-${key}`);
      if (state === "asc") return [...filtered, key];
      if (state === "desc") return [...filtered, `-${key}`];
      return filtered;
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

  const setPeriodFilter = (
    newYear: number | undefined,
    newMonth: number | undefined,
  ) => {
    setYear(newYear);
    setMonth(newMonth);
    setPage(1);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    Object.values(columnFilters).forEach((vals) => {
      if (vals && vals.length > 0) count += vals.length;
    });
    Object.values(columnSearch).forEach((val) => {
      if (val && val.trim().length > 0) count += 1;
    });
    if (year !== undefined || month !== undefined) count += 1;
    return count;
  }, [columnFilters, columnSearch, year, month]);

  const clearAllFilters = () => {
    setColumnFilters({});
    setColumnSearch({});
    setYear(undefined);
    setMonth(undefined);
    setPage(1);
  };

  return {
    data: (data?.data ?? []) as GarageOpexItem[],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 0,
    isLoading,
    page,
    setPage,
    pageSize,
    setPageSize,
    sorts,
    setSort,
    year,
    month,
    setPeriodFilter,
    columnFilters,
    setColumnFilter,
    columnSearch,
    setColumnSearch: setColumnSearchVal,
    activeFilterCount,
    clearAllFilters,
    refetch,
  };
}
