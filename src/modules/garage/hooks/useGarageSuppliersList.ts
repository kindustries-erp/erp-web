import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { garageApi } from "../api/garageApi";

export interface SupplierDebtItem {
  supplierId: string;
  supplierCode: string;
  supplierName: string;
  accountCode: string;
  accountName: string;
  currency: string;
  caseCount: number;
  dkNo: number;
  dkCo: number;
  psNo: number;
  psCo: number;
  ckNo: number;
  ckCo: number;
  balanceAmount: number;
  periodFrom: string | null;
  periodTo: string | null;
  maxAgingDays: number;
  aging0_30: number;
  aging31_60: number;
  aging61_90: number;
  agingOver90: number;
}

export interface SupplierDebtSummary {
  totalPsNo: number;
  totalPsCo: number;
  totalCkCo: number;
  totalCkNo: number;
  totalBalance: number;
  totalAging0_30: number;
  totalAging31_60: number;
  totalAging61_90: number;
  totalAgingOver90: number;
}

export function useGarageSuppliersList(branchId?: string) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchQ, setSearchQ] = useState("");
  const [sorts, setSorts] = useState<string[]>(["-balanceAmount"]);
  const [dateFrom, setDateFrom] = useState<string>("2026-07-01");
  const [dateTo, setDateTo] = useState<string>("");
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>(
    {},
  );
  const [columnSearch, setColumnSearch] = useState<Record<string, string>>({});

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [
      "garage-suppliers-debt",
      branchId,
      page,
      pageSize,
      searchQ,
      sorts,
      dateFrom,
      dateTo,
      columnFilters,
      columnSearch,
    ],
    queryFn: () => {
      if (!branchId) {
        return Promise.resolve({
          data: [] as SupplierDebtItem[],
          total: 0,
          totalPages: 0,
          summary: {
            totalPsNo: 0,
            totalPsCo: 0,
            totalCkCo: 0,
            totalCkNo: 0,
            totalBalance: 0,
            totalAging0_30: 0,
            totalAging31_60: 0,
            totalAging61_90: 0,
            totalAgingOver90: 0,
          } as SupplierDebtSummary,
        });
      }
      return garageApi.getSuppliersDebt({
        branchId,
        page,
        pageSize,
        q: searchQ || undefined,
        from: dateFrom || undefined,
        to: dateTo || undefined,
        sorts,
        column_filters: Object.keys(columnFilters).length
          ? JSON.stringify(columnFilters)
          : undefined,
        column_search: Object.keys(columnSearch).length
          ? JSON.stringify(columnSearch)
          : undefined,
      });
    },
    enabled: !!branchId,
    staleTime: 1000 * 30,
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

  const setColumnSearchValue = (key: string, val: string) => {
    setColumnSearch((prev) => ({ ...prev, [key]: val }));
    setPage(1);
  };

  const setDateRange = (from: string, to: string) => {
    setDateFrom(from);
    setDateTo(to);
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
    if (dateFrom || dateTo) count += 1;
    if (searchQ) count += 1;
    return count;
  }, [columnFilters, columnSearch, dateFrom, dateTo, searchQ]);

  const clearAllFilters = () => {
    setColumnFilters({});
    setColumnSearch({});
    setDateFrom("");
    setDateTo("");
    setSearchQ("");
    setSorts(["-balanceAmount"]);
    setPage(1);
  };

  return {
    data: (data?.data ?? []) as SupplierDebtItem[],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 0,
    summary: (data?.summary ?? {
      totalPsNo: 0,
      totalPsCo: 0,
      totalCkCo: 0,
      totalCkNo: 0,
      totalBalance: 0,
      totalAging0_30: 0,
      totalAging31_60: 0,
      totalAging61_90: 0,
      totalAgingOver90: 0,
    }) as SupplierDebtSummary,
    isLoading: isLoading || isFetching,
    page,
    setPage,
    pageSize,
    setPageSize,
    searchQ,
    setSearchQ,
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
    refetch,
  };
}
