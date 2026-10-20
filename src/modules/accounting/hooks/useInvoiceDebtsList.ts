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

export type InvoiceDebtTabKey = "customers" | "suppliers";

export interface InvoiceDebtTabState {
  page: number;
  pageSize: number;
  search: string;
  sorts: string[];
  dateFrom: string;
  dateTo: string;
  columnFilters: Record<string, string[]>;
  columnSearch: Record<string, string>;
}

export const createDefaultDebtTabState = (): InvoiceDebtTabState => ({
  page: 1,
  pageSize: getDefaultPageSize(),
  search: "",
  sorts: [],
  dateFrom: "",
  dateTo: "",
  columnFilters: {},
  columnSearch: {},
});

export function useInvoiceDebtsList(
  activeTab: InvoiceDebtTabKey = "customers",
  branchId?: string,
) {
  const [tabStates, setTabStates] = useState<
    Record<InvoiceDebtTabKey, InvoiceDebtTabState>
  >({
    customers: createDefaultDebtTabState(),
    suppliers: createDefaultDebtTabState(),
  });

  const partnerType: InvoicePartnerType =
    activeTab === "suppliers" ? "SUPPLIER" : "CUSTOMER";

  // Current tab state (with safety fallback)
  const currentTabState = useMemo(() => {
    return tabStates[activeTab] || createDefaultDebtTabState();
  }, [tabStates, activeTab]);

  const {
    page,
    pageSize,
    search,
    sorts,
    dateFrom,
    dateTo,
    columnFilters,
    columnSearch,
  } = currentTabState;

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

  const setPage = useCallback(
    (updater: number | ((prev: number) => number)) => {
      setTabStates((prev) => {
        const cur = prev[activeTab] || createDefaultDebtTabState();
        const nextVal =
          typeof updater === "function" ? updater(cur.page) : updater;
        return {
          ...prev,
          [activeTab]: {
            ...cur,
            page: nextVal,
          },
        };
      });
    },
    [activeTab],
  );

  const setPageSize = useCallback(
    (updater: number | ((prev: number) => number)) => {
      setTabStates((prev) => {
        const cur = prev[activeTab] || createDefaultDebtTabState();
        const nextVal =
          typeof updater === "function" ? updater(cur.pageSize) : updater;
        return {
          ...prev,
          [activeTab]: {
            ...cur,
            pageSize: nextVal,
            page: 1,
          },
        };
      });
    },
    [activeTab],
  );

  const setSearch = useCallback(
    (newSearch: string) => {
      setTabStates((prev) => {
        const cur = prev[activeTab] || createDefaultDebtTabState();
        return {
          ...prev,
          [activeTab]: {
            ...cur,
            search: newSearch,
            page: 1,
          },
        };
      });
    },
    [activeTab],
  );

  const setSort = useCallback(
    (key: string, state: "asc" | "desc" | "none") => {
      setTabStates((prev) => {
        const cur = prev[activeTab] || createDefaultDebtTabState();
        const filtered = cur.sorts.filter((s) => s !== key && s !== `-${key}`);
        let nextSorts = filtered;
        if (state === "asc") nextSorts = [...filtered, key];
        if (state === "desc") nextSorts = [...filtered, `-${key}`];
        return {
          ...prev,
          [activeTab]: {
            ...cur,
            sorts: nextSorts,
            page: 1,
          },
        };
      });
    },
    [activeTab],
  );

  const setColumnFilter = useCallback(
    (key: string, vals: string[]) => {
      setTabStates((prev) => {
        const cur = prev[activeTab] || createDefaultDebtTabState();
        const nextFilters = { ...cur.columnFilters };
        if (!vals || vals.length === 0) {
          delete nextFilters[key];
        } else {
          nextFilters[key] = vals;
        }
        return {
          ...prev,
          [activeTab]: {
            ...cur,
            columnFilters: nextFilters,
            page: 1,
          },
        };
      });
    },
    [activeTab],
  );

  const setColumnSearch = useCallback(
    (key: string, val: string) => {
      setTabStates((prev) => {
        const cur = prev[activeTab] || createDefaultDebtTabState();
        const nextSearch = { ...cur.columnSearch };
        if (!val || !val.trim()) {
          delete nextSearch[key];
        } else {
          nextSearch[key] = val;
        }
        return {
          ...prev,
          [activeTab]: {
            ...cur,
            columnSearch: nextSearch,
            page: 1,
          },
        };
      });
    },
    [activeTab],
  );

  const setDateRange = useCallback(
    (from?: string, to?: string) => {
      setTabStates((prev) => {
        const cur = prev[activeTab] || createDefaultDebtTabState();
        return {
          ...prev,
          [activeTab]: {
            ...cur,
            dateFrom: from || "",
            dateTo: to || "",
            page: 1,
          },
        };
      });
    },
    [activeTab],
  );

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
    setTabStates((prev) => {
      const cur = prev[activeTab] || createDefaultDebtTabState();
      return {
        ...prev,
        [activeTab]: {
          ...cur,
          columnFilters: {},
          columnSearch: {},
          dateFrom: "",
          dateTo: "",
          search: "",
          page: 1,
        },
      };
    });
  }, [activeTab]);

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
