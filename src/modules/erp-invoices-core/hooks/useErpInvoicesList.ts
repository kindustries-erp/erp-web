import { useState, useCallback, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ErpQueryKey, DEFAULT_STALE_TIME } from "@/shared/lib/queryKeys";
import { erpInvoicesCoreApi, type ErpInvoice } from "../api/erpInvoicesCoreApi";
import {
  useErpInvoiceListStore,
  type Direction,
} from "./useErpInvoiceListStore";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";

const TAX_TAB_TO_STATUS: Record<string, string[]> = {
  all: [],
  new: ["1"],
  replacement: ["2", "4"],
  adjustment: ["3", "5"],
};

export function useErpInvoicesList(
  initialDirection: Direction | "ALL" = "IN",
  partnerTaxCode?: string,
) {
  const [overrideDir, setOverrideDir] = useState<Direction | "ALL" | null>(
    null,
  );
  const prevInitialDirRef = useRef(initialDirection);
  if (prevInitialDirRef.current !== initialDirection) {
    prevInitialDirRef.current = initialDirection;
    if (overrideDir !== null) {
      setOverrideDir(null);
    }
  }

  const direction: Direction | "ALL" = overrideDir ?? initialDirection;
  const safeDir: Direction = direction === "ALL" ? "IN" : direction;
  const state = useErpInvoiceListStore((s) => s.states[safeDir] || s.states.IN);

  const tableState = useTableColumnState(`erp-invoices-table-${direction}`);

  const activeSort = tableState.sorts[0] || "";
  let sortBy = "";
  let sortOrder: "asc" | "desc" = "desc";
  if (activeSort.startsWith("-")) {
    sortBy = activeSort.substring(1);
    sortOrder = "desc";
  } else if (activeSort) {
    sortBy = activeSort;
    sortOrder = "asc";
  } else {
    sortBy = "invoiceDate";
    sortOrder = "desc";
  }

  const STATUS_OPTIONS = useMemo(
    () => [
      { value: "DRAFT", label: "Nháp" },
      { value: "CONFIRMED", label: "Đã xác nhận" },
      { value: "CANCELLED", label: "Đã hủy" },
    ],
    [],
  );

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const debounce = (fn: () => void) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fn, 400);
  };

  let apiDirection: "IN" | "OUT" | undefined = undefined;
  if (
    direction === "IN" ||
    direction === "IN_2" ||
    direction === "CHECKPOINT_IN"
  ) {
    apiDirection = "IN";
  } else if (
    direction === "OUT" ||
    direction === "OUT_2" ||
    direction === "CHECKPOINT_OUT"
  ) {
    apiDirection = "OUT";
  }

  const effectiveColumnFilters = useMemo(() => {
    const filters: Record<string, string[]> = {
      ...tableState.columnFilters,
    };
    const userSelectedStatus = tableState.columnFilters?.taxInvoiceStatus;
    if (userSelectedStatus && userSelectedStatus.length > 0) {
      filters.taxInvoiceStatus = userSelectedStatus;
    } else {
      const taxStatusList = TAX_TAB_TO_STATUS[state.activeTaxTab || "all"];
      if (taxStatusList && taxStatusList.length > 0) {
        filters.taxInvoiceStatus = taxStatusList;
      } else {
        delete filters.taxInvoiceStatus;
      }
    }
    return filters;
  }, [tableState.columnFilters, state.activeTaxTab]);

  const queryParams = useMemo(() => {
    return {
      direction: apiDirection,
      partner_tax_code: partnerTaxCode || undefined,
      search: state.search || undefined,
      seller_name: state.seller_name || undefined,
      buyer_name: state.buyer_name || undefined,
      date_from: state.dateFrom ? `${state.dateFrom}T00:00:00` : undefined,
      date_to: state.dateTo ? `${state.dateTo}T23:59:59` : undefined,
      status: state.status || undefined,
      tag_id: state.tag_id || undefined,
      page: state.page,
      pageSize: state.pageSize,
      sort_by: sortBy || undefined,
      sort_order: sortOrder || undefined,
      column_search: JSON.stringify(tableState.columnSearch),
      column_filters: JSON.stringify(effectiveColumnFilters),
    };
  }, [
    apiDirection,
    partnerTaxCode,
    state.search,
    state.seller_name,
    state.buyer_name,
    state.dateFrom,
    state.dateTo,
    state.status,
    state.tag_id,
    state.page,
    state.pageSize,
    sortBy,
    sortOrder,
    tableState.columnSearch,
    effectiveColumnFilters,
  ]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [
      ErpQueryKey.INVOICES_LIST,
      direction,
      partnerTaxCode,
      state.activeTaxTab,
      state.search,
      state.seller_name,
      state.buyer_name,
      state.dateFrom,
      state.dateTo,
      state.status,
      state.tag_id,
      state.page,
      state.pageSize,
      sortBy,
      sortOrder,
      tableState.columnSearch,
      effectiveColumnFilters,
    ],
    queryFn: () => erpInvoicesCoreApi.list(queryParams),
    staleTime: DEFAULT_STALE_TIME,
  });

  const invoices: ErpInvoice[] = data?.items || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 0;
  const loading = isLoading || isFetching;

  const loadInvoices = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const activeFilterCount = [
    !!state.period || !!state.dateFrom || !!state.dateTo,
    !!state.search,
    !!state.status,
    !!state.seller_name,
    !!state.buyer_name,
    !!state.tag_id,
  ].filter(Boolean).length;

  const filterPanel = useMemo(
    () => ({
      state: {
        period: state.period,
        dateFrom: state.dateFrom,
        dateTo: state.dateTo,
        channel: "",
        search: state.search,
        amountMin: "",
        amountMax: "",
        status: state.status,
        counterpartySource: "",
        custom: {
          seller_name: state.seller_name,
          buyer_name: state.buyer_name,
          tag_id: state.tag_id,
        },
      },
      inputs: {
        search: state.searchInput,
        amountMin: "",
        amountMax: "",
      },
      panelOpen: state.filterPanelOpen,
      openPanel: () =>
        useErpInvoiceListStore.getState().setFilterPanelOpen(safeDir, true),
      closePanel: () =>
        useErpInvoiceListStore.getState().setFilterPanelOpen(safeDir, false),
      togglePanel: () =>
        useErpInvoiceListStore
          .getState()
          .setFilterPanelOpen(safeDir, (prev: boolean) => !prev),
      setPeriod: (v: string) =>
        useErpInvoiceListStore.getState().setPeriod(safeDir, v),
      setDateFrom: (v: string) =>
        useErpInvoiceListStore.getState().setDateFrom(safeDir, v),
      setDateTo: (v: string) =>
        useErpInvoiceListStore.getState().setDateTo(safeDir, v),
      setChannel: () => {},
      setSearchInput: (v: string) => {
        useErpInvoiceListStore.getState().setSearchInput(safeDir, v);
        if (!v) {
          useErpInvoiceListStore.getState().setSearch(safeDir, "");
          return;
        }
        debounce(() => {
          useErpInvoiceListStore.getState().setSearch(safeDir, v);
        });
      },
      setAmountMinInput: () => {},
      setAmountMaxInput: () => {},
      setStatus: (v: string) =>
        useErpInvoiceListStore.getState().setStatus(safeDir, v),
      setCounterpartySource: () => {},
      setCustom: (key: string, v: string) => {
        if (key === "seller_name")
          useErpInvoiceListStore.getState().setSellerName(safeDir, v);
        if (key === "buyer_name")
          useErpInvoiceListStore.getState().setBuyerName(safeDir, v);
        if (key === "tag_id")
          useErpInvoiceListStore.getState().setTagId(safeDir, v);
      },
      resetAll: () => {
        useErpInvoiceListStore.getState().resetAllFilters(safeDir);
        tableState.resetFilters();
      },
      hasActiveFilter: activeFilterCount > 0,
      activeFilterCount,
    }),
    [state, safeDir, activeFilterCount, tableState],
  );

  return {
    direction,
    setDirection: (dir?: Direction | "ALL") => {
      if (dir) {
        setOverrideDir(dir);
        useErpInvoiceListStore
          .getState()
          .setPage(dir === "ALL" ? "IN" : dir, 1);
      }
    },
    page: state.page,
    setPage: (p: number) =>
      useErpInvoiceListStore.getState().setPage(safeDir, p),
    pageSize: state.pageSize,
    setPageSize: (s: number) =>
      useErpInvoiceListStore.getState().setPageSize(safeDir, s),
    invoices,
    total,
    totalPages,
    loading,
    isLoading,
    isFetching,
    sortBy,
    sortOrder,
    handleSort: (key: string) => {
      tableState.toggleSort(key);
      useErpInvoiceListStore.getState().setPage(safeDir, 1);
    },
    filterPanel,
    loadInvoices,
    refetch,
    STATUS_OPTIONS,
    tableState,
    activeTaxTab: state.activeTaxTab || "all",
    setActiveTaxTab: (tab: string) =>
      useErpInvoiceListStore.getState().setActiveTaxTab(safeDir, tab),
  };
}
