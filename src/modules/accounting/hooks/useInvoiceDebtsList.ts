import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { ErpQueryKey, DEFAULT_STALE_TIME } from "@/shared/lib/queryKeys";
import {
  invoiceDebtsApi,
  type InvoiceDebtItem,
  type InvoiceDebtSummary,
  type InvoicePartnerType,
} from "../api/invoiceDebtsApi";

export const getDefaultPageSize = (): number => {
  if (typeof window !== "undefined" && window.innerHeight >= 900) {
    return 50;
  }
  return 20;
};

export function useInvoiceDebtsList(
  activeTab: "customers" | "suppliers" = "customers",
  branchId?: string,
) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(getDefaultPageSize);
  const [search, setSearch] = useState<string>("");
  const [sorts, setSorts] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>(
    {},
  );
  const [columnSearch, setColumnSearchState] = useState<Record<string, string>>(
    {},
  );

  const partnerType: InvoicePartnerType =
    activeTab === "suppliers" ? "SUPPLIER" : "CUSTOMER";

  // Parse sort for backend
  const { sortBy, sortOrder } = useMemo(() => {
    if (!sorts || sorts.length === 0) {
      return { sortBy: undefined, sortOrder: undefined };
    }
    const raw = sorts[0];
    if (raw.startsWith("-")) {
      return { sortBy: raw.substring(1), sortOrder: "DESC" as const };
    }
    return { sortBy: raw, sortOrder: "ASC" as const };
  }, [sorts]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [
      ErpQueryKey.INVOICE_DEBTS_LIST,
      activeTab,
      page,
      pageSize,
      sortBy,
      sortOrder,
      dateFrom,
      dateTo,
      search,
      columnFilters,
      columnSearch,
      branchId,
    ],
    queryFn: () =>
      invoiceDebtsApi.getDebts({
        partner_type: partnerType,
        page,
        pageSize,
        search: search || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        branch_id: branchId || undefined,
        sortBy,
        sortOrder,
        column_search:
          Object.keys(columnSearch).length > 0
            ? JSON.stringify(columnSearch)
            : undefined,
        column_filters:
          Object.keys(columnFilters).length > 0
            ? JSON.stringify(columnFilters)
            : undefined,
      }),
    staleTime: DEFAULT_STALE_TIME,
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
    setColumnFilters((prev) => {
      if (!vals || vals.length === 0) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: vals };
    });
    setPage(1);
  }, []);

  const setColumnSearch = useCallback((key: string, val: string) => {
    setColumnSearchState((prev) => {
      if (!val || !val.trim()) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: val };
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
    if (search && search.trim().length > 0) count += 1;
    return count;
  }, [columnFilters, columnSearch, dateFrom, dateTo, search]);

  const clearAllFilters = useCallback(() => {
    setColumnFilters({});
    setColumnSearchState({});
    setDateFrom("");
    setDateTo("");
    setSearch("");
    setPage(1);
  }, []);

  const emptySummary: InvoiceDebtSummary = {
    totalPartners: 0,
    totalInvoiceCount: 0,
    grandTotalAmount: 0,
    grandTotalPaid: 0,
    grandTotalBalance: 0,
  };

  return {
    data: (data?.items ?? []) as InvoiceDebtItem[],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 0,
    summary: data?.summary ?? emptySummary,
    isLoading: isLoading || isFetching,
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
    setColumnSearch,
    activeFilterCount,
    clearAllFilters,
    refetch,
    partnerType,
  };
}
