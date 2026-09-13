import { useMemo, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { ErpQueryKey, DEFAULT_STALE_TIME } from "@/shared/lib/queryKeys";
import {
  erpInvoicesCoreApi,
  type ErpInvoiceItemListParams,
} from "../api/erpInvoicesCoreApi";
import {
  useErpInvoiceItemsStore,
  type ErpInvoiceItemsState,
} from "./useErpInvoiceItemsStore";
import type { Direction } from "./useErpInvoiceListStore";

import { DEFAULT_DEBOUNCE_TIME } from "@/shared/constants/timing";

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

  const storeDir: Direction =
    instanceIndex === 2 ? (direction === "IN" ? "IN_2" : "OUT_2") : direction;

  const storeState = useErpInvoiceItemsStore((s) => s.states[storeDir]);
  const storeSetPage = useErpInvoiceItemsStore((s) => s.setPage);
  const storeSetPageSize = useErpInvoiceItemsStore((s) => s.setPageSize);
  const storeSetSort = useErpInvoiceItemsStore((s) => s.setSort);
  const storeSetPeriod = useErpInvoiceItemsStore((s) => s.setPeriod);
  const storeSetDateFrom = useErpInvoiceItemsStore((s) => s.setDateFrom);
  const storeSetDateTo = useErpInvoiceItemsStore((s) => s.setDateTo);
  const storeSetDateRange = useErpInvoiceItemsStore((s) => s.setDateRange);
  const storeSetSearch = useErpInvoiceItemsStore((s) => s.setSearch);
  const storeSetSearchInput = useErpInvoiceItemsStore((s) => s.setSearchInput);
  const storeSetStatus = useErpInvoiceItemsStore((s) => s.setStatus);
  const storeSetTagId = useErpInvoiceItemsStore((s) => s.setTagId);
  const storeSetSellerName = useErpInvoiceItemsStore((s) => s.setSellerName);
  const storeSetBuyerName = useErpInvoiceItemsStore((s) => s.setBuyerName);
  const storeSetSubcategoryFilter = useErpInvoiceItemsStore(
    (s) => s.setSubcategoryFilter,
  );
  const storeSetColumnFilter = useErpInvoiceItemsStore(
    (s) => s.setColumnFilter,
  );
  const storeSetColumnSearchValue = useErpInvoiceItemsStore(
    (s) => s.setColumnSearchValue,
  );
  const storeSetFilterPanelOpen = useErpInvoiceItemsStore(
    (s) => s.setFilterPanelOpen,
  );
  const storeResetAllFilters = useErpInvoiceItemsStore(
    (s) => s.resetAllFilters,
  );

  const fallbackState: ErpInvoiceItemsState = {
    page: 1,
    pageSize: getDefaultPageSize(),
    sorts: [],
    period: "",
    dateFrom: "",
    dateTo: "",
    search: "",
    searchInput: "",
    status: "",
    sellerName: "",
    buyerName: "",
    tagId: "",
    subcategoryFilter: "ALL",
    columnFilters: {},
    columnSearch: {},
    filterPanelOpen: false,
  };

  const state = storeState || fallbackState;
  const {
    page,
    pageSize,
    sorts,
    period,
    dateFrom,
    dateTo,
    search,
    searchInput,
    status,
    sellerName,
    buyerName,
    tagId,
    subcategoryFilter,
    columnFilters,
    columnSearch,
    filterPanelOpen,
  } = state;

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const debounce = (fn: () => void) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fn, DEFAULT_DEBOUNCE_TIME);
  };

  const setPage = useCallback(
    (p: number) => storeSetPage(storeDir, p),
    [storeDir, storeSetPage],
  );
  const setPageSize = useCallback(
    (s: number) => storeSetPageSize(storeDir, s),
    [storeDir, storeSetPageSize],
  );
  const setSort = useCallback(
    (key: string, sortState: "asc" | "desc" | "none") =>
      storeSetSort(storeDir, key, sortState),
    [storeDir, storeSetSort],
  );
  const setPeriod = useCallback(
    (p: string) => storeSetPeriod(storeDir, p),
    [storeDir, storeSetPeriod],
  );
  const setDateFrom = useCallback(
    (v: string) => storeSetDateFrom(storeDir, v),
    [storeDir, storeSetDateFrom],
  );
  const setDateTo = useCallback(
    (v: string) => storeSetDateTo(storeDir, v),
    [storeDir, storeSetDateTo],
  );
  const setDateRange = useCallback(
    (from: string, to: string) => storeSetDateRange(storeDir, from, to),
    [storeDir, storeSetDateRange],
  );
  const setStatus = useCallback(
    (v: string) => storeSetStatus(storeDir, v),
    [storeDir, storeSetStatus],
  );
  const setTagId = useCallback(
    (v: string) => storeSetTagId(storeDir, v),
    [storeDir, storeSetTagId],
  );
  const setSellerName = useCallback(
    (v: string) => storeSetSellerName(storeDir, v),
    [storeDir, storeSetSellerName],
  );
  const setBuyerName = useCallback(
    (v: string) => storeSetBuyerName(storeDir, v),
    [storeDir, storeSetBuyerName],
  );

  const setSearch = useCallback(
    (v: string) => storeSetSearch(storeDir, v),
    [storeDir, storeSetSearch],
  );

  const setSearchInput = useCallback(
    (v: string) => {
      storeSetSearchInput(storeDir, v);
      if (!v) {
        storeSetSearch(storeDir, "");
        return;
      }
      debounce(() => {
        storeSetSearch(storeDir, v);
      });
    },
    [storeDir, storeSetSearchInput, storeSetSearch],
  );

  const setSubcategoryFilter = useCallback(
    (val: string) => {
      storeSetSubcategoryFilter(storeDir, val);
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        const currentTab = url.searchParams.get("tab") || "in";
        const isLinesTab =
          currentTab === "in-lines" || currentTab === "out-lines";
        if (isLinesTab) {
          if (val && val !== "ALL") {
            url.searchParams.set("subcat", val);
          } else {
            url.searchParams.delete("subcat");
          }
          window.history.replaceState(null, "", url.toString());
        }
      }
    },
    [storeDir, storeSetSubcategoryFilter],
  );

  const setColumnFilter = useCallback(
    (key: string, vals: string[]) => storeSetColumnFilter(storeDir, key, vals),
    [storeDir, storeSetColumnFilter],
  );

  const setColumnSearchValue = useCallback(
    (key: string, val: string) => storeSetColumnSearchValue(storeDir, key, val),
    [storeDir, storeSetColumnSearchValue],
  );

  const setFilterPanelOpen = useCallback(
    (v: boolean | ((prev: boolean) => boolean)) =>
      storeSetFilterPanelOpen(storeDir, v),
    [storeDir, storeSetFilterPanelOpen],
  );

  const clearAllFilters = useCallback(
    () => storeResetAllFilters(storeDir),
    [storeDir, storeResetAllFilters],
  );

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
      ErpQueryKey.INVOICE_ITEMS_LIST,
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
    staleTime: DEFAULT_STALE_TIME,
  });

  const activeFilterCount = useMemo(() => {
    let count = 0;
    Object.values(columnFilters).forEach((vals) => {
      if (vals && vals.length > 0) count += 1;
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
      setFilterPanelOpen,
      setPeriod,
      setDateFrom,
      setDateTo,
      setDateRange,
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
