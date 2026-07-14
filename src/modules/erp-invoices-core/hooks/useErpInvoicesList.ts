import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { erpInvoicesCoreApi, type ErpInvoice } from "../api/erpInvoicesCoreApi";
import {
  useErpInvoiceListStore,
  type Direction,
} from "./useErpInvoiceListStore";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";

export function useErpInvoicesList(initialDirection: Direction = "IN") {
  const [direction, setDirection] = useState<Direction>(initialDirection);
  const [invoices, setInvoices] = useState<ErpInvoice[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const store = useErpInvoiceListStore();
  const state = store.states[direction];

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

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await erpInvoicesCoreApi.list({
        direction,
        search: state.search || undefined,
        seller_name: state.seller_name || undefined,
        buyer_name: state.buyer_name || undefined,
        date_from: state.dateFrom || undefined,
        date_to: state.dateTo || undefined,
        status: state.status || undefined,
        tag_id: state.tag_id || undefined,
        page: state.page,
        pageSize: state.pageSize,
        sort_by: sortBy || undefined,
        sort_order: sortOrder || undefined,
        column_search: JSON.stringify(tableState.columnSearch),
        column_filters: JSON.stringify(tableState.columnFilters),
      });
      setInvoices(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [
    direction,
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
    tableState.columnFilters,
  ]);

  useEffect(() => {
    void loadInvoices();
  }, [loadInvoices]);

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
      openPanel: () => store.setFilterPanelOpen(direction, true),
      closePanel: () => store.setFilterPanelOpen(direction, false),
      togglePanel: () => store.setFilterPanelOpen(direction, (prev) => !prev),
      setPeriod: (v: string) => store.setPeriod(direction, v),
      setDateFrom: (v: string) => store.setDateFrom(direction, v),
      setDateTo: (v: string) => store.setDateTo(direction, v),
      setChannel: () => {},
      setSearchInput: (v: string) => {
        store.setSearchInput(direction, v);
        if (!v) {
          store.setSearch(direction, "");
          return;
        }
        debounce(() => {
          store.setSearch(direction, v);
        });
      },
      setAmountMinInput: () => {},
      setAmountMaxInput: () => {},
      setStatus: (v: string) => store.setStatus(direction, v),
      setCounterpartySource: () => {},
      setCustom: (key: string, v: string) => {
        if (key === "seller_name") store.setSellerName(direction, v);
        if (key === "buyer_name") store.setBuyerName(direction, v);
        if (key === "tag_id") store.setTagId(direction, v);
      },
      resetAll: () => {
        store.resetAllFilters(direction);
        tableState.resetFilters();
      },
      hasActiveFilter: activeFilterCount > 0,
      activeFilterCount,
    }),
    [state, store, direction, activeFilterCount],
  );

  return {
    direction,
    setDirection,
    page: state.page,
    setPage: (p: number) => store.setPage(direction, p),
    pageSize: state.pageSize,
    setPageSize: (s: number) => store.setPageSize(direction, s),
    invoices,
    total,
    totalPages,
    loading,
    sortBy,
    sortOrder,
    handleSort: (key: string) => {
      tableState.toggleSort(key);
      store.setPage(direction, 1);
    },
    filterPanel,
    loadInvoices,
    STATUS_OPTIONS,
    tableState,
  };
}
