import { useState, useMemo, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  periodFirstDay,
  periodLastDay,
} from "@/modules/finance/utils/financeHelpers";
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
  const [period, setPeriodState] = useState<string>("");
  const [dateFrom, setDateFromState] = useState<string>("");
  const [dateTo, setDateToState] = useState<string>("");
  const [search, setSearchState] = useState<string>("");
  const [searchInput, setSearchInputState] = useState<string>("");
  const [status, setStatusState] = useState<string>("");
  const [tagId, setTagIdState] = useState<string>("");
  const [sellerName, setSellerNameState] = useState<string>("");
  const [buyerName, setBuyerNameState] = useState<string>("");
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const debounce = (fn: () => void) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fn, 400);
  };

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
      status: status || undefined,
      seller_name: sellerName.trim() || undefined,
      buyer_name: buyerName.trim() || undefined,
      tag_id: tagId || undefined,
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
    status,
    sellerName,
    buyerName,
    tagId,
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
      status,
      sellerName,
      buyerName,
      tagId,
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
    setDateFromState(from);
    setDateToState(to);
    setPeriodState("");
    setPage(1);
  };

  const setPeriod = useCallback((p: string) => {
    setPeriodState(p);
    if (p) {
      setDateFromState(periodFirstDay(p));
      setDateToState(periodLastDay(p));
    } else {
      setDateFromState("");
      setDateToState("");
    }
    setPage(1);
  }, []);

  const setDateFrom = useCallback((v: string) => {
    setDateFromState(v);
    setPeriodState("");
    setPage(1);
  }, []);

  const setDateTo = useCallback((v: string) => {
    setDateToState(v);
    setPeriodState("");
    setPage(1);
  }, []);

  const setSearch = useCallback((v: string) => {
    setSearchState(v);
    setSearchInputState(v);
    setPage(1);
  }, []);

  const setSearchInput = useCallback((v: string) => {
    setSearchInputState(v);
    if (!v) {
      setSearchState("");
      setPage(1);
      return;
    }
    debounce(() => {
      setSearchState(v);
      setPage(1);
    });
  }, []);

  const setStatus = useCallback((v: string) => {
    setStatusState(v);
    setPage(1);
  }, []);

  const setTagId = useCallback((v: string) => {
    setTagIdState(v);
    setPage(1);
  }, []);

  const setSellerName = useCallback((v: string) => {
    setSellerNameState(v);
    setPage(1);
  }, []);

  const setBuyerName = useCallback((v: string) => {
    setBuyerNameState(v);
    setPage(1);
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    Object.values(columnFilters).forEach((vals) => {
      if (vals && vals.length > 0) count += vals.length;
    });
    Object.values(columnSearch).forEach((val) => {
      if (val && val.trim().length > 0) count += 1;
    });
    if (dateFrom || dateTo || period) count += 1;
    if (search.trim().length > 0) count += 1;
    if (status) count += 1;
    if (sellerName.trim().length > 0) count += 1;
    if (buyerName.trim().length > 0) count += 1;
    if (tagId) count += 1;
    return count;
  }, [
    columnFilters,
    columnSearch,
    dateFrom,
    dateTo,
    period,
    search,
    status,
    sellerName,
    buyerName,
    tagId,
  ]);

  const clearAllFilters = useCallback(() => {
    setColumnFilters({});
    setColumnSearch({});
    setDateFromState("");
    setDateToState("");
    setPeriodState("");
    setSearchState("");
    setSearchInputState("");
    setStatusState("");
    setSellerNameState("");
    setBuyerNameState("");
    setTagIdState("");
    setSubcategoryFilterState("ALL");
    setPage(1);
  }, []);

  const filterPanel = useMemo(
    () => ({
      state: {
        period,
        dateFrom,
        dateTo,
        channel: "",
        search,
        amountMin: "",
        amountMax: "",
        status,
        counterpartySource: "",
        custom: {
          seller_name: sellerName,
          buyer_name: buyerName,
          tag_id: tagId,
        },
      },
      inputs: {
        search: searchInput,
        amountMin: "",
        amountMax: "",
      },
      panelOpen: filterPanelOpen,
      openPanel: () => setFilterPanelOpen(true),
      closePanel: () => setFilterPanelOpen(false),
      togglePanel: () => setFilterPanelOpen((prev) => !prev),
      setPeriod,
      setDateFrom,
      setDateTo,
      setDateRange,
      setChannel: () => {},
      setSearchInput,
      setAmountMinInput: () => {},
      setAmountMaxInput: () => {},
      setStatus,
      setCounterpartySource: () => {},
      setCustom: (key: string, v: string) => {
        if (key === "tag_id") setTagId(v);
        if (key === "seller_name") setSellerName(v);
        if (key === "buyer_name") setBuyerName(v);
      },
      resetAll: clearAllFilters,
      hasActiveFilter: [
        !!period || !!dateFrom || !!dateTo,
        !!search,
        !!status,
        !!sellerName,
        !!buyerName,
        !!tagId,
      ].some(Boolean),
      activeFilterCount: [
        !!period || !!dateFrom || !!dateTo,
        !!search,
        !!status,
        !!sellerName,
        !!buyerName,
        !!tagId,
      ].filter(Boolean).length,
    }),
    [
      period,
      dateFrom,
      dateTo,
      search,
      searchInput,
      status,
      sellerName,
      buyerName,
      tagId,
      filterPanelOpen,
      setPeriod,
      setDateFrom,
      setDateTo,
      setSearchInput,
      setStatus,
      setTagId,
      setSellerName,
      setBuyerName,
      clearAllFilters,
    ],
  );

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
    period,
    setPeriod,
    dateFrom,
    dateTo,
    setDateRange,
    search,
    setSearch,
    status,
    setStatus,
    tagId,
    setTagId,
    sellerName,
    setSellerName,
    buyerName,
    setBuyerName,
    subcategoryFilter,
    setSubcategoryFilter,
    columnFilters,
    setColumnFilter,
    columnSearch,
    setColumnSearch: setColumnSearchValue,
    filterPanel,
    filterPanelOpen,
    setFilterPanelOpen,
    activeFilterCount,
    clearAllFilters,
    refetch,
  };
}
