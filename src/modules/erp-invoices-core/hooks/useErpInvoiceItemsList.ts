import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  erpInvoicesCoreApi,
  type ErpInvoiceItemListParams,
} from "../api/erpInvoicesCoreApi";

export const getDefaultPageSize = (): number => {
  if (typeof window !== "undefined" && window.innerHeight >= 900) {
    return 50;
  }
  return 20;
};

export interface UseErpInvoiceItemsListOptions {
  direction?: "IN" | "OUT";
  instanceIndex?: 1 | 2;
  partnerTaxCode?: string;
}

export function useErpInvoiceItemsList(
  options: UseErpInvoiceItemsListOptions = {},
) {
  const { direction = "IN", instanceIndex = 1, partnerTaxCode } = options;

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(getDefaultPageSize);
  const [sorts, setSorts] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [subcategoryFilter, setSubcategoryFilterState] = useState<string>(
    () => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const subcatParam = params.get("subcat");
        if (
          subcatParam &&
          ["ALL", "NORMAL", "DISCOUNT"].includes(subcatParam)
        ) {
          return subcatParam;
        }
      }
      return "ALL";
    },
  );

  const setSubcategoryFilter = (val: string) => {
    setSubcategoryFilterState(val);
    setPage(1);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (val && val !== "ALL") {
        url.searchParams.set("subcat", val);
      } else {
        url.searchParams.delete("subcat");
      }
      window.history.replaceState(null, "", url.toString());
    }
  };
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>(
    {},
  );
  const [columnSearch, setColumnSearch] = useState<Record<string, string>>({});

  // Parse active sort
  const activeSort = sorts[0] || "";
  let sortBy: string | undefined = undefined;
  let sortOrder: "asc" | "desc" | undefined = undefined;
  if (activeSort.startsWith("-")) {
    sortBy = activeSort.substring(1);
    sortOrder = "desc";
  } else if (activeSort) {
    sortBy = activeSort;
    sortOrder = "asc";
  }

  const queryParams: ErpInvoiceItemListParams = useMemo(() => {
    const params: ErpInvoiceItemListParams = {
      direction,
      page,
      pageSize,
      sort_by: sortBy,
      sort_order: sortOrder,
      date_from: dateFrom ? `${dateFrom}T00:00:00` : undefined,
      date_to: dateTo ? `${dateTo}T23:59:59` : undefined,
      search: search.trim() || undefined,
      partner_tax_code: partnerTaxCode || undefined,
    };

    if (subcategoryFilter && subcategoryFilter !== "ALL") {
      params.invoice_subcategory = subcategoryFilter;
    }

    if (Object.keys(columnFilters).length > 0) {
      params.column_filters = JSON.stringify(columnFilters);
    }
    if (Object.keys(columnSearch).length > 0) {
      params.column_search = JSON.stringify(columnSearch);
    }

    return params;
  }, [
    direction,
    page,
    pageSize,
    sortBy,
    sortOrder,
    dateFrom,
    dateTo,
    search,
    partnerTaxCode,
    subcategoryFilter,
    columnFilters,
    columnSearch,
  ]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [
      "erp-invoice-items-list",
      direction,
      instanceIndex,
      page,
      pageSize,
      sorts,
      dateFrom,
      dateTo,
      search,
      partnerTaxCode,
      subcategoryFilter,
      columnFilters,
      columnSearch,
    ],
    queryFn: () => erpInvoicesCoreApi.getItemsList(queryParams),
    staleTime: 30000,
  });

  const setSort = (key: string, state: "asc" | "desc" | "none") => {
    setSorts(() => {
      if (state === "asc") return [key];
      if (state === "desc") return [`-${key}`];
      return [];
    });
    setPage(1);
  };

  const setColumnFilter = (key: string, vals: string[]) => {
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
  };

  const setColumnSearchValue = (key: string, val: string) => {
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
    if (search.trim().length > 0) count += 1;
    if (subcategoryFilter && subcategoryFilter !== "ALL") count += 1;
    return count;
  }, [
    columnFilters,
    columnSearch,
    dateFrom,
    dateTo,
    search,
    subcategoryFilter,
  ]);

  const clearAllFilters = () => {
    setColumnFilters({});
    setColumnSearch({});
    setDateFrom("");
    setDateTo("");
    setSearch("");
    setSubcategoryFilter("ALL");
    setPage(1);
  };

  return {
    data: data?.items ?? [],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 0,
    summary: data?.summary ?? {
      totalQuantity: 0,
      totalPreVatAmount: 0,
      totalVatAmount: 0,
      totalDiscountAmount: 0,
      totalAmount: 0,
    },
    isLoading: isLoading || isFetching,
    page,
    setPage,
    pageSize,
    setPageSize,
    sorts,
    setSort,
    dateFrom,
    dateTo,
    setDateRange,
    search,
    setSearch,
    subcategoryFilter,
    setSubcategoryFilter,
    columnFilters,
    setColumnFilter,
    columnSearch,
    setColumnSearch: setColumnSearchValue,
    activeFilterCount,
    clearAllFilters,
    refetch,
  };
}
