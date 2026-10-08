import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { garageApi } from "../api/garageApi";

export interface SupplierDebtItem {
  id: string;
  customerCode: string;
  customerName: string;
  branchExternalId?: string;
  caseCount: number;
  vehicleCount?: number;
  costAmount: number;
  paidAmount: number;
  balanceAmount: number;
  latestDate?: string | null;
  oldestDate?: string | null;
  maxAgingDays: number;
  aging0_30: number;
  aging31_60: number;
  aging61_90: number;
  agingOver90: number;
  // Backward compatibility
  soPhieu: string;
  caseId: string;
  caseCode?: string;
  bienSoXe?: string;
  licensePlate?: string;
  supplierId?: string;
  supplierCode?: string;
  supplierName?: string;
  statusName?: string;
  revenueAmount?: number;
  completedDate?: string | null;
  agingDays?: number;
  psNo?: number;
  psCo?: number;
  ckNo?: number;
  ckCo?: number;
}

export interface SupplierDebtSummary {
  totalCustomers?: number;
  totalCases: number;
  totalCost: number;
  totalPaid: number;
  totalBalance: number;
  totalAging0_30: number;
  totalAging31_60: number;
  totalAging61_90: number;
  totalAgingOver90: number;
  totalPsNo?: number;
  totalPsCo?: number;
  totalCkCo?: number;
  totalCkNo?: number;
}

export function useGarageSuppliersList(branchId?: string) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchQ, setSearchQ] = useState("");
  const [sorts, setSorts] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState<string>("");
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
    queryFn: () =>
      garageApi.getSuppliersDebt({
        branchId: branchId || "",
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
      }),
    staleTime: 1000 * 30,
  });

  const setSort = (key: string, state: "asc" | "desc" | "none") => {
    setSorts(() =>
      state === "none" ? [] : [state === "desc" ? `-${key}` : key],
    );
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
    Object.values(columnFilters).forEach(
      (vals) => vals?.length && (count += 1),
    );
    Object.values(columnSearch).forEach((val) => val?.trim() && (count += 1));
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
    setSorts([]);
    setPage(1);
  };

  const defaultSummary: SupplierDebtSummary = {
    totalCustomers: 0,
    totalCases: 0,
    totalCost: 0,
    totalPaid: 0,
    totalBalance: 0,
    totalAging0_30: 0,
    totalAging31_60: 0,
    totalAging61_90: 0,
    totalAgingOver90: 0,
    totalPsNo: 0,
    totalPsCo: 0,
    totalCkCo: 0,
    totalCkNo: 0,
  };

  return {
    data: (data?.data ?? []) as SupplierDebtItem[],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 0,
    summary: (data?.summary ?? defaultSummary) as SupplierDebtSummary,
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
